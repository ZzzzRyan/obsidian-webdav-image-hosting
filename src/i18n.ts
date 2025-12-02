// Multi-language support for WebDAV Image Uploader Plugin

export type Language = "en" | "zh-cn";

interface Translations {
	[key: string]: string;
}

const translations: Record<Language, Translations> = {
	"en": {
		// Settings headings
		"settings.title": "WebDAV Image Uploader Settings",
		"settings.webdav": "WebDAV Configuration",
		"settings.url": "Image URL Configuration",
		"settings.rename": "Rename Mode",
		"settings.ai": "AI Configuration",
		"settings.local": "Local Image Upload",
		"settings.debug": "Debug",

		// WebDAV settings
		"webdav.url": "WebDAV URL",
		"webdav.url.desc": "WebDAV server URL (e.g., https://dav.example.com)",
		"webdav.username": "Username",
		"webdav.username.desc": "WebDAV username",
		"webdav.password": "Password",
		"webdav.password.desc": "WebDAV password",
		"webdav.path": "Upload path",
		"webdav.path.desc": "Path on WebDAV server to store images (e.g., /images)",
		"webdav.test": "Test connection",
		"webdav.test.btn": "Test",
		"webdav.test.testing": "Testing...",
		"webdav.test.success": "✓ WebDAV connection successful!",
		"webdav.test.failed": "✗ WebDAV connection failed. Check your settings.",

		// URL settings
		"url.prefix": "Custom URL prefix",
		"url.prefix.desc": "The URL prefix to use for inserted image links (e.g., https://cdn.example.com/images)",

		// Rename settings
		"rename.mode": "Rename mode",
		"rename.mode.desc": "How to name uploaded images",
		"rename.mode.dialog": "Rename Dialog",
		"rename.mode.ai": "AI Rename",
		"rename.mode.template": "Template Rename",
		"rename.template": "Default image name template",
		"rename.template.desc": "Template for auto-generated image names. Available placeholders: {timestamp}, {random}, {date}, {baseName}, {ext}",

		// AI settings
		"ai.key": "AI API Key",
		"ai.key.desc": "Your OpenAI API key or compatible service key",
		"ai.endpoint": "AI API Endpoint",
		"ai.endpoint.desc": "API endpoint URL (will auto-append /v1/chat/completions if needed)",
		"ai.model": "AI Model",
		"ai.model.desc": "Model name (e.g., gpt-4o-mini, gpt-4-vision-preview)",
		"ai.prompt": "AI Prompt",
		"ai.prompt.desc": "Custom prompt for AI image naming. Available placeholders: {timestamp}, {random}, {date}",
		"ai.compress": "Compress images for AI",
		"ai.compress.desc": "Compress images before sending to AI to reduce costs (recommended for large images)",
		"ai.test": "Test AI connection",
		"ai.test.btn": "Test",
		"ai.test.testing": "Testing...",
		"ai.test.success": "✓ AI connection successful!",
		"ai.test.failed": "✗ AI connection failed. Check your settings.",

		// Local upload settings
		"local.enable": "Enable local image upload",
		"local.enable.desc": "Add 'Upload to WebDAV' option to image file context menu",
		"local.handling": "Local file handling",
		"local.handling.desc": "What to do with local image after upload",
		"local.handling.keep": "Keep file",
		"local.handling.trash": "Move to trash",
		"local.handling.delete": "Delete permanently",

		// Debug settings
		"debug.mode": "Debug mode",
		"debug.mode.desc": "Enable detailed console logging for troubleshooting",

		// Modal
		"modal.title": "Rename image",
		"modal.filename": "File name",
		"modal.filename.desc": "Enter the name for the uploaded image",
		"modal.filename.preview": "Preview",
		"modal.ai.btn": "🤖 AI",
		"modal.ai.renaming": "🔄 AI naming...",
		"modal.upload": "Upload",
		"modal.cancel": "Cancel",

		// Notices
		"notice.uploading": "Uploading image...",
		"notice.uploaded": "✓ Image uploaded successfully!",
		"notice.upload.failed": "Image upload failed",
		"notice.ai.generating": "🤖 AI is generating filename...",
		"notice.ai.success": "✓ AI rename successful!",
		"notice.ai.failed": "AI rename failed, using template...",
		"notice.ai.notConfigured": "AI API Key not configured",
		"notice.local.deleted": "Deleted local file",
		"notice.local.trashed": "Moved to trash",
		"notice.reload": "Please reload Obsidian for this change to take effect",
	},

	"zh-cn": {
		// 设置标题
		"settings.title": "WebDAV 图片上传器设置",
		"settings.webdav": "WebDAV 配置",
		"settings.url": "图片 URL 配置",
		"settings.rename": "重命名模式",
		"settings.ai": "AI 配置",
		"settings.local": "本地图片上传",
		"settings.debug": "调试",

		// WebDAV 设置
		"webdav.url": "WebDAV URL",
		"webdav.url.desc": "WebDAV 服务器 URL（例如：https://dav.example.com）",
		"webdav.username": "用户名",
		"webdav.username.desc": "WebDAV 用户名",
		"webdav.password": "密码",
		"webdav.password.desc": "WebDAV 密码",
		"webdav.path": "上传路径",
		"webdav.path.desc": "WebDAV 服务器上存储图片的路径（例如：/images）",
		"webdav.test": "测试连接",
		"webdav.test.btn": "测试",
		"webdav.test.testing": "测试中...",
		"webdav.test.success": "✓ WebDAV 连接成功！",
		"webdav.test.failed": "✗ WebDAV 连接失败，请检查设置。",

		// URL 设置
		"url.prefix": "自定义 URL 前缀",
		"url.prefix.desc": "插入图片链接时使用的 URL 前缀（例如：https://cdn.example.com/images）",

		// 重命名设置
		"rename.mode": "重命名模式",
		"rename.mode.desc": "如何命名上传的图片",
		"rename.mode.dialog": "重命名对话框",
		"rename.mode.ai": "AI 重命名",
		"rename.mode.template": "模板重命名",
		"rename.template": "默认图片名称模板",
		"rename.template.desc": "自动生成图片名称的模板。可用占位符：{timestamp}、{random}、{date}、{baseName}、{ext}",

		// AI 设置
		"ai.key": "AI API 密钥",
		"ai.key.desc": "您的 OpenAI API 密钥或兼容服务密钥",
		"ai.endpoint": "AI API 端点",
		"ai.endpoint.desc": "API 端点 URL（如果需要会自动添加 /v1/chat/completions）",
		"ai.model": "AI 模型",
		"ai.model.desc": "模型名称（例如：gpt-4o-mini、gpt-4-vision-preview）",
		"ai.prompt": "AI 提示词",
		"ai.prompt.desc": "用于 AI 图片命名的自定义提示词。可用占位符：{timestamp}、{random}、{date}",
		"ai.compress": "压缩图片后发送给 AI",
		"ai.compress.desc": "发送给 AI 前压缩图片以降低成本（推荐用于大图片）",
		"ai.test": "测试 AI 连接",
		"ai.test.btn": "测试",
		"ai.test.testing": "测试中...",
		"ai.test.success": "✓ AI 连接成功！",
		"ai.test.failed": "✗ AI 连接失败，请检查设置。",

		// 本地上传设置
		"local.enable": "启用本地图片上传",
		"local.enable.desc": "在图片文件右键菜单中添加\"上传到 WebDAV\"选项",
		"local.handling": "本地文件处理",
		"local.handling.desc": "上传后如何处理本地图片",
		"local.handling.keep": "保留文件",
		"local.handling.trash": "移到回收站",
		"local.handling.delete": "永久删除",

		// 调试设置
		"debug.mode": "调试模式",
		"debug.mode.desc": "启用详细的控制台日志以便排查问题",

		// 对话框
		"modal.title": "重命名图片",
		"modal.filename": "文件名",
		"modal.filename.desc": "输入上传图片的名称",
		"modal.filename.preview": "预览",
		"modal.ai.btn": "🤖 AI",
		"modal.ai.renaming": "🔄 AI 命名中...",
		"modal.upload": "上传",
		"modal.cancel": "取消",

		// 通知
		"notice.uploading": "正在上传图片...",
		"notice.uploaded": "✓ 图片上传成功！",
		"notice.upload.failed": "图片上传失败",
		"notice.ai.generating": "🤖 AI 正在生成文件名...",
		"notice.ai.success": "✓ AI 重命名成功！",
		"notice.ai.failed": "AI 重命名失败，使用模板...",
		"notice.ai.notConfigured": "AI API 密钥未配置",
		"notice.local.deleted": "已删除本地文件",
		"notice.local.trashed": "已移到回收站",
		"notice.reload": "请重新加载 Obsidian 以使此更改生效",
	},
};

export class I18n {
	private currentLanguage: Language;

	constructor(language?: Language) {
		// Auto-detect language from Obsidian's locale
		const obsidianLang = (window as any).moment?.locale?.() || "en";
		this.currentLanguage = language || this.detectLanguage(obsidianLang);
	}

	private detectLanguage(locale: string): Language {
		if (locale.startsWith("zh")) {
			return "zh-cn";
		}
		return "en";
	}

	t(key: string): string {
		const translation = translations[this.currentLanguage]?.[key];
		if (!translation) {
			console.warn(`[i18n] Missing translation for key: ${key} (${this.currentLanguage})`);
			return key;
		}
		return translation;
	}

	setLanguage(language: Language): void {
		this.currentLanguage = language;
	}

	getLanguage(): Language {
		return this.currentLanguage;
	}
}

// Global instance
export const i18n = new I18n();
