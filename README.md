# WebDAV Image Uploader for Obsidian

自动将粘贴、拖放或插入的图片上传到 WebDAV 图床，并在 Obsidian 中插入自定义 URL 链接。

## ✨ 功能特性

- 🚀 **自动上传图片**：粘贴、拖放图片时自动上传到 WebDAV 服务器
- ✏️ **三种重命名模式**：
  - 对话框模式：手动重命名，支持 AI 辅助
  - AI 模式：完全由 AI 自动命名
  - 模板模式：使用自定义模板自动生成名称
- 🤖 **AI 智能命名**：支持 OpenAI 和兼容 API 的图片识别命名
- 🌐 **自定义 URL**：支持使用 CDN 或自定义前缀链接
- 📁 **本地图片上传**：右键本地图片可直接上传到 WebDAV
- ⚙️ **灵活配置**：所有功能可在设置中配置
- 📱 **跨平台支持**：支持桌面端和移动端
- 🖼️ **多格式支持**：JPG, PNG, GIF, WebP, BMP, SVG

## 📦 安装

### 开发/测试安装

1. 克隆或下载此项目到 `.obsidian/plugins/` 目录下（文件夹名称可以任意）
2. 安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```
3. 在 Obsidian 中启用插件

### 正式安装

1. 下载 `main.js` 和 `manifest.json`
2. 复制到 `.obsidian/plugins/webdav-image-uploader/`
3. 重启 Obsidian 并启用插件

> **注意**：文件夹名称不影响插件功能，插件 ID 由 `manifest.json` 中的 `id` 字段决定。

## ⚙️ 配置指南

在 Obsidian 设置中找到 **WebDAV Image Uploader**：

### 1️⃣ WebDAV 基础配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| **WebDAV URL** | 服务器地址 | `https://dav.example.com` |
| **用户名** | 账号用户名 | `your-username` |
| **密码** | 账号密码 | `your-password` |
| **上传路径** | 图片存储路径 | `/images` 或 `/obsidian/pictures` |

配置完成后点击 **"Test"** 按钮测试连接。

### 2️⃣ 重命名模式配置

**重命名模式**：选择图片命名方式

| 模式 | 说明 | 使用场景 |
|------|------|----------|
| **对话框模式** | 每次上传时弹窗手动命名，支持 AI 辅助按钮 | 需要精确控制文件名 |
| **AI 模式** | 完全由 AI 自动识别图片内容并命名 | 大量图片快速上传 |
| **模板模式** | 使用自定义模板自动生成文件名 | 统一命名规范 |

#### 对话框模式设置
- 弹窗中显示默认名称（基于模板）
- 可手动编辑
- 如配置了 AI，显示 "🤖 AI" 按钮一键智能命名

#### AI 模式设置
需要配置 AI API：
- **AI API Key**：OpenAI API Key 或兼容服务的 Key
- **AI API Endpoint**：API 地址（默认 OpenAI）
- **AI Model**：模型名称（如 `gpt-4o-mini`）
- **AI Prompt**：自定义命名提示词

#### 模板模式设置
- **默认图片名称模板**：自动生成名称的规则
  - `image-{timestamp}` → `image-1701234567890.png`
  - `{date}-{random}` → `2024-12-01-abc123.png`
  - `photo-{date}` → `photo-2024-12-01.png`

### 3️⃣ 自定义 URL 配置

**自定义 URL 前缀**：决定插入笔记中的图片链接格式

#### 使用场景示例

| 场景 | WebDAV URL | 上传路径 | 自定义 URL 前缀 |
|------|-----------|----------|----------------|
| 直接访问 | `https://dav.example.com` | `/images` | `https://dav.example.com/images` |
| CDN 加速 | `https://webdav.server.com` | `/img` | `https://cdn.mycdn.com/img` |
| 反向代理 | `https://internal.dav.com` | `/files` | `https://public.example.com/files` |

### 4️⃣ 本地图片上传

- **启用本地图片上传**：在图片文件右键菜单添加"Upload to WebDAV"选项
- **本地文件处理**：上传后如何处理本地文件
  - **Keep file**：保留本地文件
  - **Move to trash**：移动到回收站（遵循 Obsidian 设置）
  - **Delete permanently**：永久删除

## 🚀 使用方法

### 方式一：粘贴图片
1. 复制图片（截图/文件）
2. 在编辑器中 `Ctrl+V` (Mac: `Cmd+V`)
3. 根据重命名模式：
   - **对话框模式**：弹窗重命名（可点击 🤖 AI 按钮智能命名）
   - **AI 模式**：自动 AI 命名并上传
   - **模板模式**：自动使用模板命名并上传
4. 自动上传并插入链接

### 方式二：拖放图片
1. 从文件管理器拖动图片
2. 放到编辑器中
3. 按照重命名模式处理
4. 自动上传并插入链接

### 方式三：上传本地图片
1. 在文件列表中右键图片文件
2. 选择 "Upload to WebDAV"
3. 按照重命名模式处理
4. 上传后根据设置处理本地文件

### AI 命名技巧
- 在对话框模式中，点击 "🤖 AI" 按钮可快速获取 AI 建议
- AI 会分析图片内容生成描述性文件名
- 可以在 AI 建议基础上继续手动修改
- 自定义 AI Prompt 可优化命名效果

## 🔧 完整配置示例

```
WebDAV 配置：
  URL: https://webdav.myserver.com
  用户名: myuser
  密码: mypassword
  上传路径: /obsidian/images

URL 配置：
  自定义前缀: https://cdn.example.com/obsidian/images

行为配置：
  重命名对话框: 开启
  名称模板: photo-{timestamp}
```

**上传效果**：
- 粘贴图片 → 重命名为 `sunset.png`
- 上传到：`https://webdav.myserver.com/obsidian/images/sunset.png`
- 插入链接：`![sunset.png](https://cdn.example.com/obsidian/images/sunset.png)`

## ❓ 常见问题

<details>
<summary><b>Q: 上传失败怎么办？</b></summary>

1. 检查 WebDAV URL 格式（需包含 `http://` 或 `https://`）
2. 验证用户名和密码
3. 确认上传路径存在
4. 使用"测试连接"功能验证
5. 查看开发者控制台（Ctrl+Shift+I）错误信息
</details>

<details>
<summary><b>Q: 图片上传成功但无法显示？</b></summary>

1. 验证自定义 URL 前缀是否正确
2. 在浏览器中直接访问图片链接测试
3. 检查 WebDAV 服务器 CORS 配置
4. 确认图片访问权限设置
</details>

<details>
<summary><b>Q: 支持批量上传吗？</b></summary>

支持！一次粘贴或拖放多张图片时会逐个处理。
</details>

<details>
<summary><b>Q: 密码安全吗？</b></summary>

密码存储在本地 `.obsidian/plugins/webdav-image-uploader/data.json`。建议：
- 使用 HTTPS 连接
- 为 WebDAV 创建专用账号
- 定期更换密码
</details>

<details>
<summary><b>Q: AI 命名失败怎么办？</b></summary>

1. 检查 AI API Key 是否正确
2. 验证 API Endpoint 是否可访问
3. 确认模型支持图片识别（如 gpt-4o-mini）
4. 查看浏览器控制台错误信息（Ctrl+Shift+I）
5. AI 模式失败会自动回退到模板模式

**详细调试指南**：查看 [AI-DEBUG.md](AI-DEBUG.md)
</details>

<details>
<summary><b>Q: 常见 AI 错误及解决</b></summary>

**错误：`net::ERR_CONNECTION_RESET`**
- 原因：无法连接到 AI API
- 解决：检查 Endpoint URL、网络连接、代理设置

**错误：`Unexpected token '<'... is not valid JSON`**
- 原因：Endpoint URL 错误，返回的是 HTML 而非 JSON
- 解决：确认使用完整的 API endpoint
  - ✅ `https://api.openai.com/v1/chat/completions`
  - ❌ `https://api.openai.com`

更多信息见 [AI-DEBUG.md](AI-DEBUG.md)
</details>

<details>
<summary><b>Q: 如何自定义 AI 命名风格？</b></summary>

修改 AI Prompt 设置，例如：
- 中文命名：`请为这张图片提供一个简短的中文文件名，使用连字符分隔，只返回文件名不要扩展名`
- 技术风格：`Generate a technical filename for this image using kebab-case, focusing on the main subject`
- 简短风格：`Provide a 2-3 word descriptive filename in lowercase with hyphens`
</details>

<details>
<summary><b>Q: 本地图片上传后原文件不见了？</b></summary>

检查"本地文件处理"设置：
- 如果设置为"Delete permanently"，文件会被永久删除
- 如果设置为"Move to trash"，文件在回收站中
- 建议设置为"Keep file"以保留备份
</details>

## 🛠️ 开发

### 项目结构
```
src/
  ├── types.ts              # 类型定义和默认配置
  ├── webdav-uploader.ts    # WebDAV 上传逻辑
  ├── settings.ts           # 设置界面
  ├── rename-modal.ts       # 重命名对话框
  └── image-handler.ts      # 图片处理逻辑
main.ts                     # 插件入口
manifest.json               # 插件元数据
```

### 开发命令
```bash
npm install          # 安装依赖
npm run dev          # 开发模式（监听文件变化）
npm run build        # 生产构建
npm version patch    # 升级补丁版本
```

### WebDAV 服务器推荐

**云服务**：
- 坚果云（国内稳定，原生支持 WebDAV）
- Nextcloud（功能强大的私有云）
- Synology NAS（群晖 WebDAV Server）

**自建方案**：
```nginx
# Nginx WebDAV 配置示例
location /webdav {
    dav_methods PUT DELETE MKCOL COPY MOVE;
    dav_ext_methods PROPFIND OPTIONS;
    client_max_body_size 50M;
    create_full_put_path on;
    dav_access user:rw group:r all:r;

    auth_basic "WebDAV";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, PUT, DELETE, OPTIONS';
}
```

## 📝 变更日志

### [1.0.0] - 2024-12-01
- ✨ 初始版本发布
- 📤 自动上传粘贴/拖放图片到 WebDAV
- 🎨 图片重命名对话框
- 🔧 完整设置界面
- 🌐 自定义 URL 前缀支持
- 📱 桌面端和移动端支持

## 📄 许可证

MIT License

## 🙏 致谢

基于 [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) 开发。


## First time developing plugins?

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint ./src/`

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
    "fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
    "fundingUrl": {
        "Buy Me a Coffee": "https://buymeacoffee.com",
        "GitHub Sponsor": "https://github.com/sponsors",
        "Patreon": "https://www.patreon.com/"
    }
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
