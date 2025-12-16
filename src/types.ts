export type RenameMode = "dialog" | "ai" | "template";
export type LocalFileHandling = "delete" | "trash" | "nothing";
export type Language = "en" | "zh-cn";

export interface WebDAVImageUploaderSettings {
	webdavUrl: string;
	webdavUsername: string;
	webdavPassword: string;
	webdavPath: string;
	customUrlPrefix: string;
	showRenameDialog: boolean;
	defaultImageName: string;
	renameMode: RenameMode;
	aiApiKey: string;
	aiEndpoint: string;
	aiModel: string;
	aiPrompt: string;
	aiCompressImage: boolean;
	uploadLocalImages: boolean;
	localFileHandling: LocalFileHandling;
	debugMode: boolean;
	language: Language;
}

export const DEFAULT_SETTINGS: WebDAVImageUploaderSettings = {
	webdavUrl: "",
	webdavUsername: "",
	webdavPassword: "",
	webdavPath: "/images",
	customUrlPrefix: "https://your-cdn.com/images",
	showRenameDialog: true,
	defaultImageName: "image-{date}",
	renameMode: "dialog",
	aiApiKey: "",
	aiEndpoint: "https://api.openai.com",
	aiModel: "gpt-4o-mini",
	aiPrompt: "Analyze this image and generate a filename.\nRules:\n1. Identify 2-3 lowercase English words describing the content, ordered from broad category to specific detail.\n2. Join them with underscores.\n3. ALWAYS append the fixed suffix \"_{date}\" at the end.\n4. Existing images in this document: {existing_images}. Consider these names to maintain naming consistency.\nOutput ONLY the final string (e.g., \"broad_specific_detail_{date}\").",
	aiCompressImage: true,
	uploadLocalImages: true,
	localFileHandling: "nothing",
	debugMode: false,
	language: "zh-cn",
};

// Debug logging utility
let debugModeEnabled = false;

export function setDebugMode(enabled: boolean): void {
	debugModeEnabled = enabled;
}

export function debugLog(tag: string, ...args: any[]): void {
	if (debugModeEnabled) {
		console.log(`[${tag}]`, ...args);
	}
}

// Utility function to normalize AI endpoint
export function normalizeAIEndpoint(endpoint: string): string {
	if (!endpoint) return endpoint;

	// Remove trailing slashes
	endpoint = endpoint.replace(/\/+$/, "");

	// If it doesn't end with /v1/chat/completions, add it
	if (!endpoint.endsWith("/v1/chat/completions")) {
		// Check if it ends with /v1
		if (endpoint.endsWith("/v1")) {
			endpoint = endpoint + "/chat/completions";
		} else {
			endpoint = endpoint + "/v1/chat/completions";
		}
	}

	return endpoint;
}

// Context for placeholder replacement
export interface PlaceholderContext {
	originalName?: string;
	existingImages?: string[];
}

// Utility function to replace placeholders in templates
export function replacePlaceholders(
	template: string,
	context?: PlaceholderContext
): string {
	const originalName = context?.originalName;
	const existingImages = context?.existingImages || [];
	const timestamp = Date.now().toString();
	const randomStr = Math.random().toString(36).substring(2, 8);
	const date = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

	let baseName = "";
	let ext = "";

	if (originalName) {
		const match = originalName.match(/^(.+?)(\.[^.]+)?$/);
		if (match) {
			baseName = match[1] || "";
			ext = match[2] || "";
		}
	}

	// Format existing images list
	const existingImagesList = existingImages.length > 0
	? existingImages.join(', ')
	: 'None';

	debugLog("[Placeholders] Replacing:", {
		template,
		originalName,
		values: { timestamp, randomStr, date, baseName, ext, existingImagesList }
	});

	const result = template
		.replace(/\{timestamp\}/g, timestamp)
		.replace(/\{random\}/g, randomStr)
		.replace(/\{date\}/g, date)
		.replace(/\{baseName\}/g, baseName)
		.replace(/\{ext\}/g, ext)
		.replace(/\{existing_images\}/g, existingImagesList);

	debugLog("Placeholders", "Result:", result);
	return result;
}
