import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import WebDAVImageUploaderPlugin from "../main";
import { i18n } from "./i18n";
import { Language } from "./types";

export class WebDAVImageUploaderSettingTab extends PluginSettingTab {
	plugin: WebDAVImageUploaderPlugin;

	constructor(app: App, plugin: WebDAVImageUploaderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: i18n.t("settings.title") });

		// Language Setting
		new Setting(containerEl)
			.setName("Language / 语言")
			.setDesc("Select interface language / 选择界面语言")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("en", "English")
					.addOption("zh-cn", "简体中文")
					.setValue(this.plugin.settings.language)
					.onChange(async (value: Language) => {
						this.plugin.settings.language = value;
						await this.plugin.saveSettings();
						this.display(); // Refresh UI with new language
					})
			);

		// WebDAV Configuration
		containerEl.createEl("h3", { text: i18n.t("settings.webdav") });

		new Setting(containerEl)
			.setName(i18n.t("webdav.url"))
			.setDesc(i18n.t("webdav.url.desc"))
			.addText((text) =>
				text
					.setPlaceholder("https://dav.example.com")
					.setValue(this.plugin.settings.webdavUrl)
					.onChange(async (value) => {
						this.plugin.settings.webdavUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(i18n.t("webdav.username"))
			.setDesc(i18n.t("webdav.username.desc"))
			.addText((text) =>
				text
					.setPlaceholder("username")
					.setValue(this.plugin.settings.webdavUsername)
					.onChange(async (value) => {
						this.plugin.settings.webdavUsername = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(i18n.t("webdav.password"))
			.setDesc(i18n.t("webdav.password.desc"))
			.addText((text) => {
				text.setPlaceholder("password")
					.setValue(this.plugin.settings.webdavPassword)
					.onChange(async (value) => {
						this.plugin.settings.webdavPassword = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = "password";
			});

		new Setting(containerEl)
			.setName(i18n.t("webdav.path"))
			.setDesc(i18n.t("webdav.path.desc"))
			.addText((text) =>
				text
					.setPlaceholder("/images")
					.setValue(this.plugin.settings.webdavPath)
					.onChange(async (value) => {
						this.plugin.settings.webdavPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(i18n.t("webdav.test"))
			.setDesc(i18n.t("webdav.test.btn"))
			.addButton((button) =>
				button.setButtonText(i18n.t("webdav.test.btn")).onClick(async () => {
					button.setDisabled(true);
					button.setButtonText(i18n.t("webdav.test.testing"));

					const success = await this.plugin.uploader.testConnection();

					if (success) {
						new Notice(i18n.t("webdav.test.success"));
					} else {
						new Notice(i18n.t("webdav.test.failed"));
					}

					button.setDisabled(false);
					button.setButtonText(i18n.t("webdav.test.btn"));
				})
			);

		// Image URL Configuration
		containerEl.createEl("h3", { text: i18n.t("settings.url") });

		new Setting(containerEl)
			.setName(i18n.t("url.prefix"))
			.setDesc(i18n.t("url.prefix.desc"))
			.addText((text) =>
				text
					.setPlaceholder("https://cdn.example.com/images")
					.setValue(this.plugin.settings.customUrlPrefix)
					.onChange(async (value) => {
						this.plugin.settings.customUrlPrefix = value;
						await this.plugin.saveSettings();
					})
			);

		// Rename Mode Configuration
		containerEl.createEl("h3", { text: i18n.t("settings.rename") });

		new Setting(containerEl)
			.setName(i18n.t("rename.mode"))
			.setDesc(i18n.t("rename.mode.desc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("dialog", i18n.t("rename.mode.dialog"))
					.addOption("ai", i18n.t("rename.mode.ai"))
					.addOption("template", i18n.t("rename.mode.template"))
					.setValue(this.plugin.settings.renameMode)
					.onChange(async (value: "dialog" | "ai" | "template") => {
						this.plugin.settings.renameMode = value;
						await this.plugin.saveSettings();
						this.display(); // Refresh to show/hide relevant settings
					})
			);

		new Setting(containerEl)
			.setName(i18n.t("rename.batch.mode"))
			.setDesc(i18n.t("rename.batch.mode.desc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("dialog", i18n.t("rename.mode.dialog"))
					.addOption("ai", i18n.t("rename.mode.ai"))
					.addOption("template", i18n.t("rename.mode.template"))
					.setValue(this.plugin.settings.batchUploadRenameMode)
					.onChange(async (value: "dialog" | "ai" | "template") => {
						this.plugin.settings.batchUploadRenameMode = value;
						await this.plugin.saveSettings();
					})
			);

		// Template settings (shown for dialog and template modes)
		if (this.plugin.settings.renameMode === "dialog" ||
		    this.plugin.settings.renameMode === "template") {
			new Setting(containerEl)
				.setName(i18n.t("rename.template"))
				.setDesc(i18n.t("rename.template.desc"))
				.addText((text) =>
					text
						.setPlaceholder("image-{timestamp}")
						.setValue(this.plugin.settings.defaultImageName)
						.onChange(async (value) => {
							this.plugin.settings.defaultImageName = value;
							await this.plugin.saveSettings();
						})
				);
		}

		// AI Configuration (shown for AI and dialog modes)
		if (this.plugin.settings.renameMode === "ai" ||
		    this.plugin.settings.renameMode === "dialog") {
			containerEl.createEl("h3", { text: i18n.t("settings.ai") });

			new Setting(containerEl)
				.setName(i18n.t("ai.key"))
				.setDesc(i18n.t("ai.key.desc"))
				.addText((text) => {
					text.setPlaceholder("sk-...")
						.setValue(this.plugin.settings.aiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.aiApiKey = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.type = "password";
				});

			new Setting(containerEl)
				.setName(i18n.t("ai.endpoint"))
				.setDesc(i18n.t("ai.endpoint.desc"))
				.addText((text) =>
					text
						.setPlaceholder("https://api.openai.com")
						.setValue(this.plugin.settings.aiEndpoint)
						.onChange(async (value) => {
							this.plugin.settings.aiEndpoint = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName(i18n.t("ai.model"))
				.setDesc(i18n.t("ai.model.desc"))
				.addText((text) =>
					text
						.setPlaceholder("gpt-4o-mini")
						.setValue(this.plugin.settings.aiModel)
						.onChange(async (value) => {
							this.plugin.settings.aiModel = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName(i18n.t("ai.prompt"))
				.setDesc(i18n.t("ai.prompt.desc"))
				.addTextArea((text) => {
					text
						.setPlaceholder("Describe what prompt to use for AI naming...")
						.setValue(this.plugin.settings.aiPrompt)
						.onChange(async (value) => {
							this.plugin.settings.aiPrompt = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.rows = 4;
					text.inputEl.style.width = "100%";
				});

			new Setting(containerEl)
				.setName(i18n.t("ai.compress"))
				.setDesc(i18n.t("ai.compress.desc"))
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.aiCompressImage)
						.onChange(async (value) => {
							this.plugin.settings.aiCompressImage = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName(i18n.t("ai.test"))
				.setDesc(i18n.t("ai.test.btn"))
				.addButton((button) =>
					button.setButtonText(i18n.t("ai.test.btn")).onClick(async () => {
						button.setDisabled(true);
						button.setButtonText(i18n.t("ai.test.testing"));

						const aiService = new (await import("./ai-rename")).AIRenameService(
							this.plugin.settings
						);
						const success = await aiService.testConnection();

						if (success) {
							new Notice(i18n.t("ai.test.success"));
						} else {
							new Notice(i18n.t("ai.test.failed"));
						}

						button.setDisabled(false);
						button.setButtonText(i18n.t("ai.test.btn"));
					})
				);
		}

		// Local Image Upload
		containerEl.createEl("h3", { text: i18n.t("settings.local") });

		new Setting(containerEl)
			.setName(i18n.t("local.enable"))
			.setDesc(i18n.t("local.enable.desc"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.uploadLocalImages)
					.onChange(async (value) => {
						this.plugin.settings.uploadLocalImages = value;
						await this.plugin.saveSettings();
						new Notice(i18n.t("notice.reload"));
					})
			);

		new Setting(containerEl)
			.setName(i18n.t("local.handling"))
			.setDesc(i18n.t("local.handling.desc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("nothing", i18n.t("local.handling.keep"))
					.addOption("trash", i18n.t("local.handling.trash"))
					.addOption("delete", i18n.t("local.handling.delete"))
					.setValue(this.plugin.settings.localFileHandling)
					.onChange(async (value: "nothing" | "trash" | "delete") => {
						this.plugin.settings.localFileHandling = value;
						await this.plugin.saveSettings();
					})
			);

		// Debug Settings
		containerEl.createEl("h3", { text: i18n.t("settings.debug") });

		new Setting(containerEl)
			.setName(i18n.t("debug.mode"))
			.setDesc(i18n.t("debug.mode.desc"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
