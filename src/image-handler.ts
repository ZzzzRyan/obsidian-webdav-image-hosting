import { Editor, MarkdownView, Notice, TFile, Menu, requestUrl } from "obsidian";
import { ImageRenameModal } from "./rename-modal";
import { AIRenameService } from "./ai-rename";
import WebDAVImageUploaderPlugin from "../main";

export class ImageHandler {
	private aiRenameService: AIRenameService;

	constructor(private plugin: WebDAVImageUploaderPlugin) {
		this.aiRenameService = new AIRenameService(plugin.settings);
	}

	async handlePaste(
		evt: ClipboardEvent,
		editor: Editor,
		view: MarkdownView
	): Promise<void> {
		const files = evt.clipboardData?.files;
		if (!files || files.length === 0) return;

		// Check if any file is an image
		const imageFiles = Array.from(files).filter((file) =>
			file.type.startsWith("image/")
		);

		if (imageFiles.length === 0) return;

		// Prevent default paste behavior
		evt.preventDefault();

		// Process all images
		for (const file of imageFiles) {
			await this.processImageFile(file, editor);
		}
	}

	async handleDrop(
		evt: DragEvent,
		editor: Editor,
		view: MarkdownView
	): Promise<void> {
		const files = evt.dataTransfer?.files;
		if (!files || files.length === 0) return;

		// Check if any file is an image
		const imageFiles = Array.from(files).filter((file) =>
			file.type.startsWith("image/") || this.isImageFile(file.name)
		);

		if (imageFiles.length === 0) return;

		// Prevent default drop behavior
		evt.preventDefault();

		// Process all images
		for (const file of imageFiles) {
			await this.processImageFile(file, editor);
		}
	}

	async handleLocalImageUpload(
		file: TFile,
		editor: Editor
	): Promise<void> {
		try {
			// Read the file
			const arrayBuffer = await this.plugin.app.vault.readBinary(file);

			// Find the image reference in the current document
			const currentContent = editor.getValue();
			const imageRefInfo = this.findImageReference(currentContent, file.name, file.path);

			// Get the filename to determine the mode
			await this.processImageWithMode(arrayBuffer, file.name, editor, file, imageRefInfo);
		} catch (error) {
			console.error("Error uploading local image:", error);
			new Notice(`Failed to upload local image: ${error.message}`);
		}
	}

	private isImageFile(fileName: string): boolean {
		const imageExtensions = [
			".jpg",
			".jpeg",
			".png",
			".gif",
			".webp",
			".bmp",
			".svg",
		];
		const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
		return imageExtensions.includes(ext);
	}

	private extractExistingUploadedImages(content: string): string[] {
		const imageNames: string[] = [];
		const webdavUrlPattern = this.plugin.settings.customUrlPrefix || this.plugin.settings.webdavUrl;

		// Match markdown images with URLs containing webdav prefix
		// ![alt](https://example.com/image.jpg) or ![alt|300](https://example.com/image.jpg)
		const mdRegex = /!\[([^\]]*)(?:\|\d+)?\]\((https?:\/\/[^)]+)\)/g;
		let match;

		while ((match = mdRegex.exec(content)) !== null) {
			const imageUrl = match[2];
			// Check if this URL is from our WebDAV/CDN (uploaded images)
			if (webdavUrlPattern && imageUrl.includes(webdavUrlPattern)) {
				// Extract filename from URL
				const urlParts = imageUrl.split('/');
				const fileName = urlParts[urlParts.length - 1];
				// Remove query parameters and decode
				const cleanName = decodeURIComponent(fileName.split('?')[0]);
				if (cleanName && !imageNames.includes(cleanName)) {
					imageNames.push(cleanName);
				}
			}
		}

		return imageNames;
	}

	private findImageReference(
		content: string,
		fileName: string,
		filePath: string
	): { found: boolean; fullMatch?: string; sizeParam?: string } {
		// Try to find wiki-style links: ![[filename]] or ![[path/to/filename]]
		// Also capture size parameter like |300
		const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		// Match ![[filename|size]] or ![[path/to/filename|size]]
		const wikiRegex1 = new RegExp(`!\\[\\[${escapedFileName}(\\|\\d+)?\\]\\]`, 'g');
		const wikiRegex2 = new RegExp(`!\\[\\[${escapedPath}(\\|\\d+)?\\]\\]`, 'g');

		let match = content.match(wikiRegex1) || content.match(wikiRegex2);
		if (match) {
			const fullMatch = match[0];
			const sizeMatch = fullMatch.match(/\|(\d+)/);
			return {
				found: true,
				fullMatch,
				sizeParam: sizeMatch ? sizeMatch[1] : undefined
			};
		}

		// Try to find markdown-style links: ![alt](filename) or ![alt](path/to/filename)
		const mdRegex1 = new RegExp(`!\\[([^\\]]*)\\]\\(${escapedFileName}\\)`, 'g');
		const mdRegex2 = new RegExp(`!\\[([^\\]]*)\\]\\(${escapedPath}\\)`, 'g');

		match = content.match(mdRegex1) || content.match(mdRegex2);
		if (match) {
			return {
				found: true,
				fullMatch: match[0],
				sizeParam: undefined
			};
		}

		return { found: false };
	}

	private async processImageFile(
		file: File,
		editor: Editor
	): Promise<void> {
		try {
			// Read file as ArrayBuffer
			const arrayBuffer = await file.arrayBuffer();
			await this.processImageWithMode(arrayBuffer, file.name, editor);
		} catch (error) {
			console.error("Error processing image:", error);
			new Notice(`Failed to process image: ${error.message}`);
		}
	}

	private async processImageWithMode(
		imageData: ArrayBuffer,
		originalName: string,
		editor: Editor,
		localFile?: TFile,
		imageRefInfo?: { found: boolean; fullMatch?: string; sizeParam?: string }
	): Promise<void> {
		const mode = this.plugin.settings.renameMode;

		switch (mode) {
			case "dialog":
				await this.handleDialogMode(imageData, originalName, editor, localFile, imageRefInfo);
				break;
			case "ai":
				await this.handleAIMode(imageData, originalName, editor, localFile, imageRefInfo);
				break;
			case "template":
				await this.handleTemplateMode(imageData, originalName, editor, localFile, imageRefInfo);
				break;
		}
	}

	private async handleDialogMode(
		imageData: ArrayBuffer,
		originalName: string,
		editor: Editor,
		localFile?: TFile,
		imageRefInfo?: { found: boolean; fullMatch?: string; sizeParam?: string }
	): Promise<void> {
		const defaultName = this.plugin.uploader.generateFileName(originalName);

		// Extract existing uploaded images for context
		const existingImages = this.extractExistingUploadedImages(editor.getValue());

		// Create AI rename callback if AI is configured
		const aiCallback = this.plugin.settings.aiApiKey
			? async () => {
				return await this.aiRenameService.generateFileName(imageData, existingImages);
			}
			: undefined;

		// Return a promise that resolves when the modal is submitted or closed
		return new Promise<void>((resolve) => {
			let resolved = false;
			const safeResolve = () => {
				if (!resolved) {
					resolved = true;
					resolve();
				}
			};

			const modal = new ImageRenameModal(
				this.plugin.app,
				defaultName,
				(fileName) => {
					void this.uploadAndInsert(imageData, fileName, editor, localFile, imageRefInfo).then(safeResolve);
				},
				aiCallback,
				imageData
			);

			// Also resolve when modal is closed without submitting
			const originalOnClose = modal.onClose.bind(modal);
			modal.onClose = function() {
				originalOnClose();
				safeResolve();
			};

			modal.open();
		});
	}

	private async handleAIMode(
		imageData: ArrayBuffer,
		originalName: string,
		editor: Editor,
		localFile?: TFile,
		imageRefInfo?: { found: boolean; fullMatch?: string; sizeParam?: string }
	): Promise<void> {
		try {
			new Notice("🤖 AI is generating filename...");

			// Extract existing uploaded images for context
			const existingImages = this.extractExistingUploadedImages(editor.getValue());
			const aiName = await this.aiRenameService.generateFileName(imageData, existingImages);

			// Add extension
			const ext = originalName.match(/\.[^.]+$/)?.[0] || ".png";
			const fileName = aiName + ext;

			await this.uploadAndInsert(imageData, fileName, editor, localFile, imageRefInfo);
		} catch (error) {
			// Fallback to template mode
			new Notice("AI rename failed, using template...");
			await this.handleTemplateMode(imageData, originalName, editor, localFile, imageRefInfo);
		}
	}

	private async handleTemplateMode(
		imageData: ArrayBuffer,
		originalName: string,
		editor: Editor,
		localFile?: TFile,
		imageRefInfo?: { found: boolean; fullMatch?: string; sizeParam?: string }
	): Promise<void> {
		const fileName = this.plugin.uploader.generateFileName(originalName);
		await this.uploadAndInsert(imageData, fileName, editor, localFile, imageRefInfo);
	}

	private async uploadAndInsert(
		imageData: ArrayBuffer,
		fileName: string,
		editor: Editor,
		localFile?: TFile,
		imageRefInfo?: { found: boolean; fullMatch?: string; sizeParam?: string }
	): Promise<void> {
		try {
			new Notice("Uploading image...");

			// Upload to WebDAV
			const imageUrl = await this.plugin.uploader.uploadImage(
				imageData,
				fileName
			);

			// Create markdown image link with optional size parameter
			let imageMarkdown = `![${fileName}](${imageUrl})`;
			if (imageRefInfo?.sizeParam) {
				imageMarkdown = `![${fileName}|${imageRefInfo.sizeParam}](${imageUrl})`;
			}

			// If we found an existing reference, replace it; otherwise insert at cursor
			if (imageRefInfo?.found && imageRefInfo.fullMatch) {
				// Find the position of the old image reference and replace it
				const currentContent = editor.getValue();
				const matchIndex = currentContent.indexOf(imageRefInfo.fullMatch);

				if (matchIndex !== -1) {
					// Save cursor position before replacement
					const cursor = editor.getCursor();

					// Calculate the position in the document
					const from = editor.offsetToPos(matchIndex);
					const to = editor.offsetToPos(matchIndex + imageRefInfo.fullMatch.length);

					// Replace the specific range instead of the entire content
					editor.replaceRange(imageMarkdown, from, to);

					// Restore cursor position (adjust if cursor was after the replaced text)
					const lengthDiff = imageMarkdown.length - imageRefInfo.fullMatch.length;
					const cursorOffset = editor.posToOffset(cursor);
					if (cursorOffset > matchIndex) {
						// Cursor was after the replaced text, adjust its position
						const newCursorOffset = cursorOffset + lengthDiff;
						editor.setCursor(editor.offsetToPos(newCursorOffset));
					} else {
						// Cursor was before or at the replaced text, keep it as is
						editor.setCursor(cursor);
					}
				}
			} else {
				// Insert markdown image link at cursor position
				const cursor = editor.getCursor();
				editor.replaceRange(imageMarkdown, cursor);
			}

			new Notice("✓ Image uploaded successfully!");

			// Handle local file if provided
			if (localFile) {
				await this.handleLocalFileAfterUpload(localFile);
			}
		} catch (error) {
			console.error("Upload and insert failed:", error);
			new Notice(`Upload failed: ${error.message}`);
		}
	}

	private async handleLocalFileAfterUpload(file: TFile): Promise<void> {
		const handling = this.plugin.settings.localFileHandling;

		try {
			switch (handling) {
				case "delete":
					// Use fileManager.trashFile to respect user's deletion preference
					await this.plugin.app.fileManager.trashFile(file);
					new Notice(`Deleted local file: ${file.name}`);
					break;
				case "nothing":
					// Do nothing
					break;
			}
		} catch (error) {
			console.error("Error handling local file:", error);
			const message = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to handle local file: ${message}`);
		}
	}

	registerContextMenu(): void {
		if (!this.plugin.settings.enableContextMenu) return;

		// Register context menu for image links in the editor
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, view: MarkdownView) => {
				// Get the text at cursor position to check if it's an image link
				const cursor = editor.getCursor();

				// Check if cursor is on an image reference (wiki or markdown style)
				const imageInfo = this.getImageAtCursor(editor, cursor);

				if (imageInfo) {
					// Single image upload menu
					const imageType = imageInfo.isUrl ? 'URL' : 'local';
					const truncatedName = this.truncateFileName(imageInfo.fileName, 30);
					menu.addItem((item) => {
						item
							.setTitle(`Upload "${truncatedName}" to WebDAV (${imageType})`)
							.setIcon("upload")
							.onClick(() => {
								void this.handleImageLinkUpload(imageInfo, editor);
							});
					});
				}

				// Always show batch upload option
				menu.addItem((item) => {
					item
						.setTitle("Batch upload images to WebDAV")
						.setIcon("upload-cloud")
						.onClick(() => {
							void this.batchUploadImages(editor);
						});
				});
			})
		);
	}

	private truncateFileName(fileName: string, maxLength: number): string {
		if (fileName.length <= maxLength) {
			return fileName;
		}

		// Extract extension
		const lastDotIndex = fileName.lastIndexOf('.');
		const ext = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
		const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;

		// Calculate how much of the name we can show
		const availableLength = maxLength - ext.length - 3; // 3 for "..."

		if (availableLength <= 0) {
			// If even the extension is too long, just truncate everything
			return fileName.substring(0, maxLength - 3) + '...';
		}

		return nameWithoutExt.substring(0, availableLength) + '...' + ext;
	}

	private getImageAtCursor(editor: Editor, cursor: { line: number, ch: number }): { fileName: string, filePath: string, isUrl: boolean, fullMatch: string } | null {
		const line = editor.getLine(cursor.line);
		const ch = cursor.ch;

		// Match wiki-style image: ![[image.png]] or ![[path/to/image.png|300]]
		const wikiRegex = /!\[\[([^\]|]+)(\|[^\]]+)?\]\]/g;
		let match;
		while ((match = wikiRegex.exec(line)) !== null) {
			const start = match.index;
			const end = start + match[0].length;
			if (ch >= start && ch <= end) {
				const path = match[1];
				const fileName = path.includes('/') ? path.split('/').pop()! : path;
				const isUrl = /^https?:\/\//i.test(path);
				return { fileName, filePath: path, isUrl, fullMatch: match[0] };
			}
		}

		// Match markdown-style image: ![alt](image.png) or ![alt](https://...)
		const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
		while ((match = mdRegex.exec(line)) !== null) {
			const start = match.index;
			const end = start + match[0].length;
			if (ch >= start && ch <= end) {
				const path = match[2];
				const fileName = path.includes('/') ? path.split('/').pop()! : path;
				const isUrl = /^https?:\/\//i.test(path);
				return { fileName, filePath: path, isUrl, fullMatch: match[0] };
			}
		}

		return null;
	}

	private async downloadImageFromUrl(url: string): Promise<ArrayBuffer> {
		try {
			const response = await requestUrl({ url, method: 'GET' });
			const contentType = response.headers['content-type'] || response.headers['Content-Type'];
			if (!contentType || !contentType.startsWith('image/')) {
				throw new Error('URL does not point to an image');
			}
			return response.arrayBuffer;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to download image: ${message}`);
		}
	}

	private async handleImageLinkUpload(imageInfo: { fileName: string, filePath: string, isUrl: boolean, fullMatch: string }, editor: Editor): Promise<void> {
		try {
			if (imageInfo.isUrl) {
				// Download the image from URL
				new Notice('Downloading image from URL...');
				const imageData = await this.downloadImageFromUrl(imageInfo.filePath);

				// Get the image reference info for replacement
				const imageRefInfo = {
					found: true,
					fullMatch: imageInfo.fullMatch,
					sizeParam: undefined as string | undefined
				};

				// Extract size parameter if exists (wiki style)
				const sizeMatch = imageInfo.fullMatch.match(/\|(\d+)/);
				if (sizeMatch) {
					imageRefInfo.sizeParam = sizeMatch[1];
				}

				await this.processImageWithMode(imageData, imageInfo.fileName, editor, undefined, imageRefInfo);
			} else {
				// Handle local file
				const file = this.plugin.app.vault.getAbstractFileByPath(imageInfo.filePath);
				if (file instanceof TFile) {
					await this.handleLocalImageUpload(file, editor);
				} else {
					new Notice(`Image file not found: ${imageInfo.filePath}`);
				}
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			new Notice(`Failed to upload image: ${error.message}`);
		}
	}

	private findAllImagesToUpload(content: string): Array<{ url: string, fullMatch: string, isLocal: boolean, fileName: string }> {
		const images: Array<{ url: string, fullMatch: string, isLocal: boolean, fileName: string }> = [];
		const webdavUrlPattern = this.plugin.settings.customUrlPrefix || this.plugin.settings.webdavUrl;

		// Match markdown-style images: ![alt](url)
		const mdRegex = /!\[([^\]]*)(?:\|(\d+))?\]\(([^)]+)\)/g;
		let match;

		while ((match = mdRegex.exec(content)) !== null) {
			const url = match[3];
			const isUrl = /^https?:\/\//i.test(url);

			// Skip if already uploaded to our WebDAV
			if (isUrl && webdavUrlPattern && url.includes(webdavUrlPattern)) {
				continue;
			}

			// Extract filename
			const fileName = url.includes('/') ? url.split('/').pop()! : url;

			images.push({
				url: url,
				fullMatch: match[0],
				isLocal: !isUrl,
				fileName: fileName
			});
		}

		// Match wiki-style images: ![[url]] or ![[url|size]]
		const wikiRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

		while ((match = wikiRegex.exec(content)) !== null) {
			const url = match[1];
			const isUrl = /^https?:\/\//i.test(url);

			// Skip if already uploaded to our WebDAV
			if (isUrl && webdavUrlPattern && url.includes(webdavUrlPattern)) {
				continue;
			}

			// Extract filename
			const fileName = url.includes('/') ? url.split('/').pop()! : url;

			images.push({
				url: url,
				fullMatch: match[0],
				isLocal: !isUrl,
				fileName: fileName
			});
		}

		return images;
	}

	async batchUploadImages(editor: Editor): Promise<void> {
		const content = editor.getValue();
		const imagesToUpload = this.findAllImagesToUpload(content);

		if (imagesToUpload.length === 0) {
			new Notice("No images to upload");
			return;
		}

		// Create progress notice
		const progressNotice = new Notice(`Preparing to upload ${imagesToUpload.length} image(s)...`, 0);

		let successCount = 0;
		let failCount = 0;
		const originalMode = this.plugin.settings.renameMode;

		try {
			// Use batch upload rename mode
			this.plugin.settings.renameMode = this.plugin.settings.batchUploadRenameMode;

			for (let i = 0; i < imagesToUpload.length; i++) {
				const image = imagesToUpload[i];

				// Update progress
				progressNotice.setMessage(`Uploading ${i + 1}/${imagesToUpload.length}: ${image.fileName}`);

				try {
					let imageData: ArrayBuffer;

					// Get image data
					if (image.isLocal) {
						// Local file
						const file = this.plugin.app.vault.getAbstractFileByPath(image.url);
						if (!(file instanceof TFile)) {
							throw new Error(`File not found: ${image.url}`);
						}
						imageData = await this.plugin.app.vault.readBinary(file);
					} else {
						// Network URL
						imageData = await this.downloadImageFromUrl(image.url);
					}

					// Get current content (may have changed from previous uploads)
					const currentContent = editor.getValue();

					// Find the specific image reference in current content
					const matchIndex = currentContent.indexOf(image.fullMatch);
					if (matchIndex === -1) {
						// Image reference no longer exists, skip
						continue;
					}

					// Extract size parameter if exists
					const sizeMatch = image.fullMatch.match(/\|(\d+)/);
					const imageRefInfo = {
						found: true,
						fullMatch: image.fullMatch,
						sizeParam: sizeMatch ? sizeMatch[1] : undefined
					};

					// Process and upload
					await this.processImageWithMode(imageData, image.fileName, editor, undefined, imageRefInfo);

					successCount++;

					// Small delay to avoid overwhelming the server and allow UI updates
					await new Promise(resolve => setTimeout(resolve, 100));

				} catch (error) {
					console.error(`Failed to upload ${image.fileName}:`, error);
					failCount++;
					// Continue with next image
				}
			}

			// Final result
			progressNotice.hide();
			if (failCount === 0) {
				new Notice(`✓ Successfully uploaded all ${successCount} image(s)!`);
			} else {
				new Notice(`Uploaded ${successCount} image(s), ${failCount} failed`);
			}

		} catch (error) {
			progressNotice.hide();
			console.error('Batch upload error:', error);
			new Notice(`Batch upload failed: ${error.message}`);
		} finally {
			// Restore original rename mode
			this.plugin.settings.renameMode = originalMode;
		}
	}
}
