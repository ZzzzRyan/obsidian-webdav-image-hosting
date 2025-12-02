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

			// Get the filename to determine the mode
			await this.processImageWithMode(arrayBuffer, file.name, editor, file);
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
		localFile?: TFile
	): Promise<void> {
		const mode = this.plugin.settings.renameMode;

		switch (mode) {
			case "dialog":
				await this.handleDialogMode(imageData, originalName, editor, localFile);
				break;
			case "ai":
				await this.handleAIMode(imageData, originalName, editor, localFile);
				break;
			case "template":
				await this.handleTemplateMode(imageData, originalName, editor, localFile);
				break;
		}
	}

	private async handleDialogMode(
		imageData: ArrayBuffer,
		originalName: string,
		editor: Editor,
		localFile?: TFile
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
				await this.uploadAndInsert(imageData, fileName, editor, localFile);
			},
			aiCallback
		).open();
	}

	private async handleAIMode(
		imageData: ArrayBuffer,
		originalName: string,
		editor: Editor,
		localFile?: TFile
	): Promise<void> {
		try {
			new Notice("🤖 AI is generating filename...");
			const aiName = await this.aiRenameService.generateFileName(imageData);

			// Add extension
			const ext = originalName.match(/\.[^.]+$/)?.[0] || ".png";
			const fileName = aiName + ext;

			await this.uploadAndInsert(imageData, fileName, editor, localFile);
		} catch (error) {
			// Fallback to template mode
			new Notice("AI rename failed, using template...");
			await this.handleTemplateMode(imageData, originalName, editor, localFile);
		}
	}

	private async handleTemplateMode(
		imageData: ArrayBuffer,
		originalName: string,
		editor: Editor,
		localFile?: TFile
	): Promise<void> {
		const fileName = this.plugin.uploader.generateFileName(originalName);
		await this.uploadAndInsert(imageData, fileName, editor, localFile);
	}

	private async uploadAndInsert(
		imageData: ArrayBuffer,
		fileName: string,
		editor: Editor,
		localFile?: TFile
	): Promise<void> {
		try {
			new Notice("Uploading image...");

			// Upload to WebDAV
			const imageUrl = await this.plugin.uploader.uploadImage(
				imageData,
				fileName
			);

			// Insert markdown image link at cursor position
			const cursor = editor.getCursor();
			const imageMarkdown = `![${fileName}](${imageUrl})`;
			editor.replaceRange(imageMarkdown, cursor);

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

		this.plugin.registerEvent(
			this.plugin.app.workspace.on("file-menu", (menu: Menu, file: TFile) => {
				if (file instanceof TFile && this.isImageFile(file.name)) {
					menu.addItem((item) => {
						item
							.setTitle("Upload to WebDAV")
							.setIcon("upload")
							.onClick(async () => {
								const editor = this.plugin.app.workspace.activeEditor?.editor;
								if (editor) {
									await this.handleLocalImageUpload(file, editor);
								} else {
									new Notice("No active editor found");
								}
							});
					});
				}
			})
		);
	}
}
