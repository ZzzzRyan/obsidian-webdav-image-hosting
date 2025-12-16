import { Editor, MarkdownView, Notice, TFile, Menu } from "obsidian";
import { WebDAVUploader } from "./webdav-uploader";
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

		// Create AI rename callback if AI is configured
		const aiCallback = this.plugin.settings.aiApiKey
			? async () => {
					return await this.aiRenameService.generateFileName(imageData);
			  }
			: undefined;

		new ImageRenameModal(
			this.plugin.app,
			defaultName,
			async (fileName) => {
				await this.uploadAndInsert(imageData, fileName, editor, localFile, imageRefInfo);
			},
			aiCallback,
			imageData
		).open();
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
			const aiName = await this.aiRenameService.generateFileName(imageData);

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
					await this.plugin.app.vault.delete(file);
					new Notice(`Deleted local file: ${file.name}`);
					break;
				case "trash":
					await this.plugin.app.vault.trash(file, true);
					new Notice(`Moved to trash: ${file.name}`);
					break;
				case "nothing":
					// Do nothing
					break;
			}
		} catch (error) {
			console.error("Error handling local file:", error);
			new Notice(`Failed to handle local file: ${error.message}`);
		}
	}

	registerContextMenu(): void {
		if (!this.plugin.settings.uploadLocalImages) return;

		// Register context menu for image links in the editor
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, view: MarkdownView) => {
				// Get the text at cursor position to check if it's an image link
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);

				// Check if cursor is on an image reference (wiki or markdown style)
				const imageInfo = this.getImageAtCursor(editor, cursor);

				if (imageInfo) {
					menu.addItem((item) => {
						item
							.setTitle(`Upload "${imageInfo.fileName}" to WebDAV`)
							.setIcon("upload")
							.onClick(async () => {
								// Find the actual file in vault
								const file = this.plugin.app.vault.getAbstractFileByPath(imageInfo.filePath);
								if (file instanceof TFile) {
									await this.handleLocalImageUpload(file, editor);
								} else {
									new Notice(`Image file not found: ${imageInfo.filePath}`);
								}
							});
					});
				}
			})
		);
	}

	private getImageAtCursor(editor: Editor, cursor: { line: number, ch: number }): { fileName: string, filePath: string } | null {
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
				return { fileName, filePath: path };
			}
		}

		// Match markdown-style image: ![alt](image.png)
		const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
		while ((match = mdRegex.exec(line)) !== null) {
			const start = match.index;
			const end = start + match[0].length;
			if (ch >= start && ch <= end) {
				const path = match[2];
				const fileName = path.includes('/') ? path.split('/').pop()! : path;
				return { fileName, filePath: path };
			}
		}

		return null;
	}
}
