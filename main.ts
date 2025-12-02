import { Editor, MarkdownView, Plugin } from "obsidian";
import { WebDAVImageUploaderSettings, DEFAULT_SETTINGS, setDebugMode } from "./src/types";
import { WebDAVUploader } from "./src/webdav-uploader";
import { ImageHandler } from "./src/image-handler";
import { WebDAVImageUploaderSettingTab } from "./src/settings";
import { i18n } from "./src/i18n";

export default class WebDAVImageUploaderPlugin extends Plugin {
	settings: WebDAVImageUploaderSettings;
	uploader: WebDAVUploader;
	imageHandler: ImageHandler;

	async onload() {
		await this.loadSettings();

		// Initialize debug mode
		setDebugMode(this.settings.debugMode);

		// Initialize i18n
		i18n.setLanguage(this.settings.language);

		// Initialize uploader and handler
		this.uploader = new WebDAVUploader(this.settings);
		this.imageHandler = new ImageHandler(this);

		// Register paste event
		this.registerEvent(
			this.app.workspace.on(
				"editor-paste",
				(evt: ClipboardEvent, editor: Editor, view: MarkdownView) => {
					this.imageHandler.handlePaste(evt, editor, view);
				}
			)
		);

		// Register drop event
		this.registerEvent(
			this.app.workspace.on(
				"editor-drop",
				(evt: DragEvent, editor: Editor, view: MarkdownView) => {
					this.imageHandler.handleDrop(evt, editor, view);
				}
			)
		);

		// Register context menu for local images
		this.imageHandler.registerContextMenu();

		// Add settings tab
		this.addSettingTab(new WebDAVImageUploaderSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup handled automatically by registerEvent
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);

		// Update debug mode
		setDebugMode(this.settings.debugMode);

		// Update i18n
		i18n.setLanguage(this.settings.language);

		// Reinitialize uploader with new settings
		this.uploader = new WebDAVUploader(this.settings);
	}
}
