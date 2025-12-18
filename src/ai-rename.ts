import { requestUrl, Notice } from "obsidian";
import { WebDAVImageUploaderSettings, normalizeAIEndpoint, replacePlaceholders, debugLog } from "./types";

export class AIRenameService {
	constructor(private settings: WebDAVImageUploaderSettings) {}

	private async compressImageForAI(imageData: ArrayBuffer): Promise<string> {
		if (!this.settings.aiCompressImage) {
			// No compression, just convert to base64
			return this.arrayBufferToBase64(imageData);
		}

		try {
			debugLog("AI", "Compressing image for AI analysis...");
			const originalSize = imageData.byteLength;

			// Create image from ArrayBuffer
			const blob = new Blob([imageData]);
			const imageBitmap = await createImageBitmap(blob);

			// Calculate target dimensions (max 800px on longest side)
			const maxSize = 800;
			let width = imageBitmap.width;
			let height = imageBitmap.height;

			if (width > maxSize || height > maxSize) {
				if (width > height) {
					height = Math.round((height * maxSize) / width);
					width = maxSize;
				} else {
					width = Math.round((width * maxSize) / height);
					height = maxSize;
				}
			}

			// Draw to canvas and compress
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Could not get canvas context");

			ctx.drawImage(imageBitmap, 0, 0, width, height);

			// Convert to JPEG with quality 0.7
			const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

			const compressedSize = (compressedBase64.length * 3) / 4; // Approximate byte size
			debugLog("AI", "Image compressed:", {
				originalSize,
				compressedSize,
				reduction: `${Math.round((1 - compressedSize / originalSize) * 100)}%`,
				dimensions: `${width}x${height}`
			});

			return compressedBase64;
		} catch (error) {
			debugLog("AI", "Image compression failed, using original:", error);
			return this.arrayBufferToBase64(imageData);
		}
	}

	async generateFileName(imageData: ArrayBuffer, existingImages?: string[]): Promise<string> {
		if (!this.settings.aiApiKey) {
			new Notice("AI API Key not configured");
			throw new Error("AI API Key not configured");
		}

		if (!this.settings.aiEndpoint) {
			new Notice("AI API Endpoint not configured");
			throw new Error("AI API Endpoint not configured");
		}

		try {
			// Convert image to base64 (with optional compression)
			const base64Image = await this.compressImageForAI(imageData);

			// Detect image format
			const imageFormat = this.detectImageFormat(imageData);

			// Process prompt with placeholders including existing images context
			const processedPrompt = replacePlaceholders(this.settings.aiPrompt, {
				existingImages
			});

			// Prepare the API request body
			const requestBody = {
				model: this.settings.aiModel,
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: processedPrompt,
							},
							{
								type: "image_url",
								image_url: {
									url: `data:image/${imageFormat};base64,${base64Image}`,
								},
							},
						],
					},
				],
				max_tokens: 100,
			};

			// Normalize endpoint URL
			const apiEndpoint = normalizeAIEndpoint(this.settings.aiEndpoint);

			debugLog("AI", "API Request:", {
				endpoint: apiEndpoint,
				model: this.settings.aiModel,
				hasApiKey: !!this.settings.aiApiKey,
			});

			// Make API request
			const response = await requestUrl({
				url: apiEndpoint,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.settings.aiApiKey}`,
				},
				body: JSON.stringify(requestBody),
				throw: false, // Don't throw on non-200 status
			});

			debugLog("AI", "API Response:", {
				status: response.status,
				headers: response.headers,
			});

			// Check response status
			if (response.status !== 200) {
				let errorMessage = `API returned status ${response.status}`;

				try {
					// Try to parse error response
					const errorData = response.json;
					if (errorData?.error?.message) {
						errorMessage = errorData.error.message;
					} else if (typeof response.text === 'string') {
						errorMessage = response.text.substring(0, 200);
					}
				} catch {
					// If parsing fails, use raw text
					if (typeof response.text === 'string') {
						errorMessage = `${response.status}: ${response.text.substring(0, 100)}`;
					}
				}

				console.error("[AI] API Error:", errorMessage);
				throw new Error(errorMessage);
			}

			// Parse response
			let result;
			try {
				result = response.json;
			} catch {
				console.error("[AI] Failed to parse JSON response:", response.text);
				throw new Error("Invalid JSON response from AI API");
			}

			const generatedName = result.choices?.[0]?.message?.content?.trim();

			if (!generatedName) {
				console.error("[AI] Response structure:", result);
				throw new Error("AI did not return a valid filename");
			}

			debugLog("AI", "Generated name:", generatedName);

			// Clean up the filename
			return this.sanitizeFileName(generatedName);
		} catch (error) {
			console.error("AI rename error:", error);

			// Provide more specific error messages
			let userMessage = "AI rename failed";
			if (error.message) {
				if (error.message.includes("ERR_CONNECTION") || error.message.includes("Failed to fetch")) {
					userMessage = "Cannot connect to AI API. Check your endpoint URL and network.";
				} else if (error.message.includes("not valid JSON") || error.message.includes("<!doctype")) {
					userMessage = "AI API returned invalid response. Check your endpoint URL.";
				} else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
					userMessage = "Invalid API Key. Check your AI API Key.";
				} else if (error.message.includes("429")) {
					userMessage = "AI API rate limit exceeded. Try again later.";
				} else {
					userMessage = `AI rename failed: ${error.message}`;
				}
			}

			new Notice(userMessage);
			throw error;
		}
	}

	private detectImageFormat(buffer: ArrayBuffer): string {
		const arr = new Uint8Array(buffer);

		// Check magic numbers for common image formats
		if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
			return "jpeg";
		}
		if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
			return "png";
		}
		if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) {
			return "gif";
		}
		if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46) {
			return "webp";
		}

		// Default to jpeg
		return "jpeg";
	}

	private arrayBufferToBase64(buffer: ArrayBuffer): string {
		const bytes = new Uint8Array(buffer);
		let binary = "";
		const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow

		for (let i = 0; i < bytes.length; i += chunkSize) {
			const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
			binary += String.fromCharCode.apply(null, Array.from(chunk));
		}

		return btoa(binary);
	}

	private sanitizeFileName(name: string): string {
		// Remove any quotes, backticks, or code block markers
		const cleaned = name
			.replace(/^["'`]+|["'`]+$/g, "") // Remove quotes at start/end
			.replace(/^```[\s\S]*?```$/g, "") // Remove code blocks
			.replace(/^\s*[\r\n]/gm, ""); // Remove empty lines

		// Remove any path separators and special characters
		return cleaned
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
			.trim();
	}

	async testConnection(): Promise<boolean> {
		try {
			const apiEndpoint = normalizeAIEndpoint(this.settings.aiEndpoint);

			// Simple test request with minimal payload
			const testBody = {
				model: this.settings.aiModel,
				messages: [
					{
						role: "user",
						content: "test"
					}
				],
				max_tokens: 5
			};

			const response = await requestUrl({
				url: apiEndpoint,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.settings.aiApiKey}`,
				},
				body: JSON.stringify(testBody),
				throw: false,
			});

			return response.status === 200;
		} catch (error) {
			console.error("AI connection test failed:", error);
			return false;
		}
	}
}
