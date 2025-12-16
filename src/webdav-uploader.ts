import { Notice, requestUrl } from "obsidian";
import { WebDAVImageUploaderSettings, PlaceholderContext, replacePlaceholders, debugLog } from "./types";

export class WebDAVUploader {
	constructor(private settings: WebDAVImageUploaderSettings) {}

	private getAuthHeader(): string {
		const credentials = btoa(
			`${this.settings.webdavUsername}:${this.settings.webdavPassword}`
		);
		return `Basic ${credentials}`;
	}

	private async ensureDirectoryExists(): Promise<boolean> {
		try {
			const dirUrl = `${this.settings.webdavUrl}${this.settings.webdavPath}`;
			debugLog("WebDAV", "Checking if directory exists:", dirUrl);

			// First, try PROPFIND to check if directory exists
			const checkResponse = await requestUrl({
				url: dirUrl,
				method: "PROPFIND",
				headers: {
					Authorization: this.getAuthHeader(),
					Depth: "0",
				},
				throw: false,
			});

			debugLog("WebDAV", "Directory check response:", {
				status: checkResponse.status,
				headers: checkResponse.headers
			});

			// If directory exists (200, 207) or any success status
			if (checkResponse.status >= 200 && checkResponse.status < 300) {
				debugLog("WebDAV", "Directory exists and is accessible");
				return true;
			}

			// If 404, try to create the directory
			if (checkResponse.status === 404) {
				debugLog("WebDAV", "Directory not found, attempting to create...");
				const createResponse = await requestUrl({
					url: dirUrl,
					method: "MKCOL",
					headers: {
						Authorization: this.getAuthHeader(),
					},
					throw: false,
				});

				debugLog("WebDAV", "Directory creation response:", {
					status: createResponse.status
				});

				if (createResponse.status >= 200 && createResponse.status < 300) {
					debugLog("WebDAV", "Directory created successfully");
					return true;
				}
			}

			debugLog("WebDAV", "Could not ensure directory exists");
			return false;
		} catch (error) {
			console.error("[WebDAV] Error checking/creating directory:", error);
			return false;
		}
	}

	async uploadImage(
		imageData: ArrayBuffer,
		fileName: string
	): Promise<string> {
		debugLog("WebDAV", "Starting upload:", {
			fileName: fileName,
			imageSize: imageData.byteLength,
			webdavUrl: this.settings.webdavUrl,
			webdavPath: this.settings.webdavPath
		});

		try {
			// Ensure filename has proper extension
			if (!fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
				debugLog("WebDAV", "Filename missing extension, adding .png:", fileName);
				fileName += ".png";
			}

			// Ensure directory exists before upload (this also "wakes up" the connection)
			debugLog("WebDAV", "Ensuring target directory exists...");
			await this.ensureDirectoryExists();

			// Construct WebDAV URL
			const webdavPath = this.settings.webdavPath.endsWith("/")
				? this.settings.webdavPath
				: this.settings.webdavPath + "/";
			const uploadUrl = `${this.settings.webdavUrl}${webdavPath}${fileName}`;

			debugLog("WebDAV", "Upload URL:", uploadUrl);
			debugLog("WebDAV", "Request headers:", {
				hasAuth: !!this.settings.webdavUsername,
				contentType: "application/octet-stream"
			});

			// Upload to WebDAV
			const response = await requestUrl({
				url: uploadUrl,
				method: "PUT",
				headers: {
					Authorization: this.getAuthHeader(),
					"Content-Type": "application/octet-stream",
				},
				body: imageData,
				throw: false, // Handle errors manually
			});

			debugLog("WebDAV", "Upload response:", {
				status: response.status,
				statusText: response.status,
				headers: response.headers
			});

			if (response.status >= 200 && response.status < 300) {
				// Return custom URL
				const customUrlPrefix = this.settings.customUrlPrefix.endsWith(
					"/"
				)
					? this.settings.customUrlPrefix.slice(0, -1)
					: this.settings.customUrlPrefix;
				const finalUrl = `${customUrlPrefix}/${fileName}`;
				debugLog("WebDAV", "Upload successful! Final URL:", finalUrl);
				return finalUrl;
			} else {
				let errorDetails = `Status ${response.status}`;
				try {
					if (response.text) {
						errorDetails += `: ${response.text.substring(0, 200)}`;
					}
				} catch (e) {
					// Ignore text parsing errors
				}

				console.error("[WebDAV] Upload failed:", {
					status: response.status,
					url: uploadUrl,
					responseText: response.text,
					responseHeaders: response.headers
				});

				throw new Error(`Request failed, status ${response.status}`);
			}
		} catch (error) {
			console.error("[WebDAV] Upload error:", {
				errorMessage: error.message,
				errorStack: error.stack,
				fileName: fileName,
				webdavUrl: this.settings.webdavUrl
			});
			new Notice(`Image upload failed: ${error.message}`);
			throw error;
		}
	}

	async testConnection(): Promise<boolean> {
		try {
			const testUrl = `${this.settings.webdavUrl}${this.settings.webdavPath}`;
			debugLog("WebDAV", "Testing connection to:", testUrl);

			const response = await requestUrl({
				url: testUrl,
				method: "PROPFIND",
				headers: {
					Authorization: this.getAuthHeader(),
					Depth: "0",
				},
				throw: false,
			});

			debugLog("WebDAV", "Test connection response:", {
				status: response.status,
				success: response.status >= 200 && response.status < 300
			});

			return response.status >= 200 && response.status < 300;
		} catch (error) {
			console.error("[WebDAV] Connection test failed:", error);
			return false;
		}
	}

	generateFileName(originalName?: string): string {
		debugLog("WebDAV", "Generating filename from template:", {
			template: this.settings.defaultImageName,
			originalName: originalName
		});

		// Extract extension from original name
		let ext = "";
		if (originalName) {
			const match = originalName.match(/\.[^.]+$/);
			ext = match ? match[0] : "";
		}

		// If template already contains extension placeholder or literal extension, use it
		let fileName = replacePlaceholders(
			this.settings.defaultImageName,
			{ originalName }
		);

		debugLog("WebDAV", "After placeholder replacement:", fileName);

		// Clean up the filename (remove invalid characters)
		fileName = fileName
			.replace(/[<>:"|?*\\]/g, "") // Remove invalid filename characters
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Remove duplicate hyphens
			.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

		// Ensure the filename is not empty
		if (!fileName || fileName.trim() === "") {
			const timestamp = Date.now();
			fileName = `image-${timestamp}`;
			debugLog("WebDAV", "Template resulted in empty filename, using fallback:", fileName);
		}

		// Ensure file has an extension
		if (!fileName.match(/\.[a-zA-Z0-9]+$/)) {
			const finalExt = ext || ".png";
			fileName = fileName + finalExt;
			debugLog("WebDAV", "Added extension:", finalExt);
		}

		debugLog("WebDAV", "Final generated filename:", fileName);
		return fileName;
	}
}
