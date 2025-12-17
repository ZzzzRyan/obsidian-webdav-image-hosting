# WebDAV Image Hosting

An Obsidian plugin that automatically uploads images to WebDAV servers with intelligent renaming and custom URL support.

一个 Obsidian 插件，将图片自动上传到 WebDAV 服务器，支持智能重命名和自定义 URL。

---

## ✨ Features

### 📤 Upload Images to WebDAV
- **Paste/Drop**: Auto-upload clipboard or dragged images
- **Context Menu**: Right-click any image link to upload
- **Batch Upload**: Upload all local and external images in one click
- Works on desktop and mobile
- Supports JPG, PNG, GIF, WebP, BMP, SVG

### ✏️ Three Renaming Modes
1. **Dialog**: Manual rename with preview and AI assist button
2. **AI**: Auto-generate names based on image content and existing file patterns
3. **Template**: Custom patterns with placeholders (`{timestamp}`, `{date}`, `{random}`)

### 🌐 Custom Final URLs
- Configure URL prefix for inserted image links (e.g., CDN or reverse proxy)
- Separate WebDAV storage location from access URL
- Support for custom domain names

---

## ✨ 核心功能

### 📤 WebDAV 图片上传
- **粘贴/拖放**：自动上传剪贴板或拖入的图片
- **右键菜单**：右键任意图片链接直接上传
- **批量上传**：一键上传所有本地和外部图片
- 兼容桌面端和移动端
- 支持 JPG、PNG、GIF、WebP、BMP、SVG

### ✏️ 三种重命名方式
1. **对话框**：手动重命名，显示预览，可用 AI 辅助
2. **AI 模式**：根据图片内容和现有文件风格自动生成名称
3. **模板**：自定义模板（`{timestamp}`、`{date}`、`{random}` 等占位符）

### 🌐 自定义最终链接
- 配置插入笔记的图片 URL 前缀（如 CDN 或反向代理）
- WebDAV 存储位置与访问链接分离
- 支持自定义域名

---

## 📦 Installation

### From Community Plugins (Recommended)
1. Open **Settings** → **Community plugins**
2. Search for "WebDAV Image Hosting"
3. Click **Install**, then **Enable**

### Manual Installation
1. Download `obsidian-webdav-image-hosting.zip` from releases
2. Extract to `.obsidian/plugins/` in your vault
3. Enable the plugin in **Settings** → **Community plugins**

## ⚙️ Configuration

### WebDAV Server Setup

| Setting | Description | Example |
|---------|-------------|---------|
| WebDAV URL | Server address | `https://your-server.com/dav` |
| Username | Account name | `your-username` |
| Password | Account password | `your-password` |
| Upload Path | Storage path | `/obsidian/images` |

**Compatible Services**: Nextcloud, ownCloud, Synology NAS, 坚果云 (Nutstore), InfiniCLOUD, and any WebDAV-compliant server.

Click **Test** to verify connection.

### Renaming Modes

| Mode | Description |
|------|-------------|
| **Dialog** | Manual input with image preview and AI assist button |
| **AI** | Auto-generate names using GPT-4 Vision based on image content |
| **Template** | Custom pattern with placeholders: `{timestamp}`, `{date}`, `{random}`, `{baseName}` |

**Template Examples**:
- `img-{timestamp}` → `img-1701234567890.png`
- `{date}-{random}` → `20251217143055-a7b3c9.png`

**AI Configuration** (for AI mode):
- API Key, Endpoint, Model (e.g., `gpt-4o-mini`)
- Prompt supports `{existing_images}` to maintain naming consistency

### Custom URL Prefix

Control the final image URL inserted into your notes.

**Examples**:

| WebDAV Storage | Custom URL Prefix | Result |
|----------------|-------------------|--------|
| `https://dav.server.com/uploads` | `https://dav.server.com/uploads` | Direct WebDAV access |
| `https://webdav.internal.com/img` | `https://cdn.mycdn.com/img` | CDN acceleration |
| `https://internal.dav.com/files` | `https://public.example.com/files` | Reverse proxy |

---

## 📦 安装

### 从社区插件安装（推荐）
1. 打开 **设置** → **社区插件**
2. 搜索「WebDAV Image Hosting」
3. 点击 **安装**，然后 **启用**

### 手动安装
1. 下载发布包中的 `obsidian-webdav-image-hosting.zip`
2. 解压到库文件夹的 `.obsidian/plugins/` 目录
3. 在 **设置** → **社区插件** 中启用

## ⚙️ 配置

### WebDAV 服务器设置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| WebDAV URL | 服务器地址 | `https://your-server.com/dav` |
| 用户名 | 账号名称 | `your-username` |
| 密码 | 账号密码 | `your-password` |
| 上传路径 | 存储路径 | `/obsidian/images` |

**兼容服务**：Nextcloud、ownCloud、群晖 NAS、坚果云、InfiniCLOUD 及任何 WebDAV 兼容服务器。

配置完成后点击 **Test** 测试连接。

### 重命名模式

| 模式 | 说明 |
|------|------|
| **对话框** | 手动输入，带图片预览和 AI 辅助按钮 |
| **AI** | 使用 GPT-4 Vision 根据图片内容自动生成名称 |
| **模板** | 自定义模板，支持占位符：`{timestamp}`、`{date}`、`{random}`、`{baseName}` |

**模板示例**：
- `img-{timestamp}` → `img-1701234567890.png`
- `{date}-{random}` → `20251217143055-a7b3c9.png`

**AI 配置**（AI 模式需要）：
- API Key、Endpoint、Model（如 `gpt-4o-mini`）
- 提示词支持 `{existing_images}` 以保持命名一致性

### 自定义 URL 前缀

控制插入笔记的最终图片链接。

**示例**：

| WebDAV 存储 | 自定义 URL 前缀 | 结果 |
|-------------|----------------|------|
| `https://dav.server.com/uploads` | `https://dav.server.com/uploads` | 直接访问 WebDAV |
| `https://webdav.internal.com/img` | `https://cdn.mycdn.com/img` | CDN 加速 |
| `https://internal.dav.com/files` | `https://public.example.com/files` | 反向代理 |

---

## 🚀 Usage

### Paste or Drop Images
1. Copy/paste or drag images into editor
2. Plugin auto-renames based on your chosen mode (Dialog/AI/Template)
3. Uploads to WebDAV and inserts custom URL

### Right-Click Upload
1. Place cursor on any image link (local or external URL)
2. Right-click → **"Upload [filename] to WebDAV"**
3. Link auto-replaced with WebDAV URL

### Batch Upload
- Right-click in editor → **"Batch upload images to WebDAV"**
- Or command palette (Ctrl/Cmd+P) → **"Batch upload"**
- Uploads all local and external images, skips already-uploaded ones

**Example**:
```markdown
Before:
![](local/photo.jpg)
![](https://external.com/image.png)

After:
![](https://cdn.myserver.com/images/photo-20251217.jpg)
![](https://cdn.myserver.com/images/image-20251217.png)
```

---

## 🚀 使用方法

### 粘贴或拖放图片
1. 复制/粘贴或拖动图片到编辑器
2. 根据选择的模式自动重命名（对话框/AI/模板）
3. 上传到 WebDAV 并插入自定义 URL

### 右键上传
1. 将光标放在任意图片链接上（本地或外部 URL）
2. 右键 → **「Upload [filename] to WebDAV」**
3. 链接自动替换为 WebDAV URL

### 批量上传
- 编辑器内右键 → **「Batch upload images to WebDAV」**
- 或命令面板（Ctrl/Cmd+P）→ **「Batch upload」**
- 上传所有本地和外部图片，跳过已上传的

**示例**：
```markdown
上传前：
![](local/photo.jpg)
![](https://external.com/image.png)

上传后：
![](https://cdn.myserver.com/images/photo-20251217.jpg)
![](https://cdn.myserver.com/images/image-20251217.png)
```

---

## 💡 Advanced Features

- **Image Preview**: Dialog mode shows thumbnail (max 300px) for easier renaming
- **AI Context Awareness**: AI references existing image names to maintain consistent naming style
- **External Image Support**: Right-click any external URL to migrate to your WebDAV server
- **Safe Editing**: Batch upload doesn't interrupt editing; cursor position preserved

## ❓ FAQ

**Upload fails?**
- Verify WebDAV URL format (must include `http://` or `https://`)
- Check username, password, and path
- Use **Test** button to verify connection

**Images not displaying?**
- Verify custom URL prefix is correct
- Test image URL directly in browser
- Check WebDAV server access permissions

**AI naming fails?**
- Verify API Key and Endpoint
- Ensure model supports vision (e.g., `gpt-4o-mini`)
- Plugin auto-falls back to template mode on AI failure

---

## 💡 高级特性

- **图片预览**：对话框模式显示缩略图（最大 300px），方便命名
- **AI 上下文感知**：AI 参考现有图片名称以保持命名风格一致
- **外部图片支持**：右键任意外部 URL 即可迁移到你的 WebDAV 服务器
- **安全编辑**：批量上传不中断编辑；光标位置保持不变

## ❓ 常见问题

**上传失败？**
- 检查 WebDAV URL 格式（必须包含 `http://` 或 `https://`）
- 验证用户名、密码和路径
- 使用 **Test** 按钮验证连接

**图片无法显示？**
- 验证自定义 URL 前缀是否正确
- 在浏览器中直接测试图片 URL
- 检查 WebDAV 服务器访问权限

**AI 命名失败？**
- 验证 API Key 和 Endpoint
- 确保模型支持视觉识别（如 `gpt-4o-mini`）
- AI 失败时插件自动回退到模板模式

---

## 🛠️ Development

```bash
npm install    # Install dependencies
npm run dev    # Watch mode
npm run build  # Production build
```

## 📄 License

MIT License
