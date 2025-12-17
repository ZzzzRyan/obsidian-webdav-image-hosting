import { App, Modal, Setting, Notice } from "obsidian";
import { i18n } from "./i18n";

export class ImageRenameModal extends Modal {
	fileName: string;
	onSubmit: (fileName: string) => void;
	onAIRename?: () => Promise<string>;
	imageData?: ArrayBuffer;
	private inputEl: HTMLInputElement;
	private aiButton: HTMLButtonElement;
	private previewEl: HTMLElement;

	constructor(
		app: App,
		defaultName: string,
		onSubmit: (fileName: string) => void,
		onAIRename?: () => Promise<string>,
		imageData?: ArrayBuffer
	) {
		super(app);
		this.fileName = defaultName;
		this.onSubmit = onSubmit;
		this.onAIRename = onAIRename;
		this.imageData = imageData;
	}

	onOpen() {
		const { contentEl, modalEl } = this;
		contentEl.empty();

		// Make modal wider
		modalEl.addClass("image-rename-modal");

		contentEl.createEl("h2", { text: i18n.t("modal.title") });

		// Add image thumbnail if image data is provided
		if (this.imageData) {
			const thumbnailContainer = contentEl.createDiv({ cls: "image-rename-thumbnail" });

			const img = thumbnailContainer.createEl("img");

			// Convert ArrayBuffer to data URL
			const blob = new Blob([this.imageData]);
			const url = URL.createObjectURL(blob);
			img.src = url;

			// Clean up the URL when modal closes
			img.onload = () => {
				// Image loaded successfully
			};
		}

		// Create a container for the input with AI button
		const inputContainer = contentEl.createDiv({ cls: "image-rename-input-container" });

		new Setting(inputContainer)
			.setName(i18n.t("modal.filename"))
			.setDesc(i18n.t("modal.filename.desc"))
			.addText((text) => {
				this.inputEl = text.inputEl;
				text
					.setPlaceholder("image-name")
					.setValue(this.fileName)
					.onChange((value) => {
						this.fileName = value;
						this.updatePreview();
					});


				// Auto-select filename without extension for easy editing
				text.inputEl.focus();
				const lastDot = this.fileName.lastIndexOf(".");
				if (lastDot > 0) {
					text.inputEl.setSelectionRange(0, lastDot);
				} else {
					text.inputEl.select();
				}

				// Submit on Enter
				text.inputEl.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						this.submit();
					}
				});

				// Add AI rename button if callback is provided
				if (this.onAIRename) {
					const buttonContainer = text.inputEl.parentElement;
					if (buttonContainer) {
						this.aiButton = buttonContainer.createEl("button", {
							text: i18n.t("modal.ai.btn"),
							cls: "ai-rename-button",
						});
						this.aiButton.addEventListener("click", async (e) => {
							e.preventDefault();
							await this.handleAIRename();
						});
					}
				}
			});

		// Add preview element
		this.previewEl = contentEl.createDiv({ cls: "image-rename-preview" });
		this.updatePreview();

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText(i18n.t("modal.upload"))
					.setCta()
					.onClick(() => {
						this.submit();
					})
			)
			.addButton((btn) =>
				btn.setButtonText(i18n.t("modal.cancel")).onClick(() => {
					this.close();
				})
			);
	}

	private updatePreview() {
		if (this.previewEl) {
			this.previewEl.innerHTML = `<strong>${i18n.t("modal.filename.preview")}:</strong> ${this.fileName}`;
		}
	}

	private async handleAIRename() {
		if (!this.onAIRename) return;

		const originalText = this.aiButton.textContent;
		try {
			this.aiButton.disabled = true;
			this.aiButton.textContent = i18n.t("modal.ai.renaming");
			this.inputEl.disabled = true;

			const aiGeneratedName = await this.onAIRename();

			if (aiGeneratedName) {
				// Preserve the extension from the original filename
				const ext = this.fileName.match(/\.[^.]+$/)?.[0] || ".png";
				this.fileName = aiGeneratedName + ext;
				this.inputEl.value = this.fileName;

				// Select the filename without extension
				const lastDot = this.fileName.lastIndexOf(".");
				this.inputEl.setSelectionRange(0, lastDot);
				this.inputEl.focus();

				this.updatePreview();
				new Notice(i18n.t("notice.ai.success"));
			}
		} catch (error) {
			console.error("AI rename failed:", error);
			// Error notice is already shown in AI service
		} finally {
			this.aiButton.disabled = false;
			this.aiButton.textContent = originalText;
			this.inputEl.disabled = false;
		}
	}

	submit() {
		if (this.fileName.trim()) {
			this.onSubmit(this.fileName.trim());
			this.close();
		}
	}

	onClose() {
		const { contentEl } = this;

		// Clean up any created object URLs
		const img = contentEl.querySelector('.image-rename-thumbnail img') as HTMLImageElement;
		if (img && img.src.startsWith('blob:')) {
			URL.revokeObjectURL(img.src);
		}

		contentEl.empty();
	}
}
