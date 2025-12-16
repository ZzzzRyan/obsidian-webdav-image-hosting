# WebDAV Image Hosting

一个 Obsidian 插件，将图片自动上传到 WebDAV 图床，支持多种智能重命名方式和自定义 URL 链接。

## ✨ 核心功能

### 📤 灵活的图片上传方式
- **粘贴/拖放**：自动上传剪贴板或拖入的图片
- **右键单图上传**：编辑器内右键本地/网络图片链接直接上传
- **批量上传**：一键上传文档中所有本地和外部网络图片
- 兼容桌面端和移动端
- 支持多种图片格式（JPG, PNG, GIF, WebP, BMP, SVG）

### ✏️ 三种智能重命名方式
1. **对话框模式**：弹窗手动重命名，显示图片预览，可一键 AI 辅助
2. **AI 模式**：自动识别图片内容并智能命名，参考文档已有图片保持风格一致
3. **模板模式**：使用自定义模板自动生成（时间戳、日期、随机字符）

**独立的批量上传模式**：可为批量上传设置不同的重命名策略

### 🌐 自定义最终链接
- 自由配置插入笔记的图片 URL 前缀
- 支持 CDN 加速链接
- 支持反向代理自定义域名
- WebDAV 存储位置与访问链接完全分离

## 📦 安装

1. 下载发布包中的压缩包`obsidian-webdav-image-hosting.zip`
2. 在 Obsidian 的库文件夹下打开或创建 `.obsidian/plugins` 目录
3. 将压缩包解压到该目录，解压后该目录下应该多出一个 `obsidian-webdav-image-hosting` 文件夹
4. 在 Obsidian 设置中启用插件

## ⚙️ 快速配置

### 1. WebDAV 基础配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| WebDAV URL | 服务器地址 | `https://dav.example.com` |
| 用户名 | 账号 | `your-username` |
| 密码 | 密码 | `your-password` |
| 上传路径 | 图片存储路径 | `/images` |

配置完成后点击"Test"按钮测试连接。

### 2. 选择重命名方式

**单图上传模式**：

| 模式 | 特点 | 适用场景 |
|------|------|----------|
| 对话框 | 手动输入 + 图片预览 + AI 辅助按钮 | 需要精确控制文件名 |
| AI | 完全自动 AI 识别内容命名 | 快速上传，自动保持命名风格 |
| 模板 | 自定义规则自动生成 | 统一命名规范 |

**批量上传模式**：独立设置，推荐使用"模板"或"AI"模式

**可用占位符**：
- `{timestamp}` - Unix 时间戳
- `{date}` - 格式化日期时间（YYYYMMDDHHmmss）
- `{random}` - 6位随机字符
- `{baseName}` - 原文件名（不含扩展名）
- `{existing_images}` - 文档中已上传图片列表（AI 模式可用）

**模板示例**：
- `image-{timestamp}` → `image-1701234567890.png`
- `{date}-{random}` → `20251203144201-abc123.png`

**AI 配置**（选用 AI 模式时需要）：
- API Key：OpenAI 或兼容服务的密钥
- Endpoint：API 地址（默认 OpenAI）
- Model：模型名称（如 `gpt-4o-mini`）
- 提示词：支持 `{existing_images}` 占位符，让 AI 参考已有命名风格

### 3. 自定义最终链接

通过"自定义 URL 前缀"控制插入笔记的图片链接格式。

**示例**：

| WebDAV 存储位置 | 上传路径 | 自定义 URL 前缀 | 最终链接 |
|----------------|----------|----------------|----------|
| `https://dav.example.com` | `/images` | `https://dav.example.com/images` | 直接访问 WebDAV |
| `https://webdav.server.com` | `/img` | `https://cdn.mycdn.com/img` | 通过 CDN 访问 |
| `https://internal.dav.com` | `/files` | `https://public.example.com/files` | 反向代理域名 |

## 🚀 使用方法

### 方式 1：粘贴/拖放图片
1. 复制图片或从文件管理器拖入编辑器
2. 根据配置的重命名模式自动处理：
   - **对话框**：弹窗显示图片预览，手动输入名称或点击 🤖 AI 按钮辅助
   - **AI**：自动识别图片内容并生成文件名
   - **模板**：按预设规则自动生成
3. 自动上传到 WebDAV 并插入自定义链接

### 方式 2：右键单图上传
1. 将光标放在编辑器中的图片链接上（本地或网络图片）
2. 右键选择 **"Upload [filename] to WebDAV"**
3. 支持本地图片路径和外部网络 URL
4. 上传完成后自动替换为 WebDAV 链接，保持光标位置不变

### 方式 3：批量上传
1. 在编辑器右键选择 **"Batch upload images to WebDAV"**
2. 或使用命令面板（Ctrl/Cmd+P）搜索 **"Batch upload"**
3. 自动识别文档中所有未上传的本地和外部网络图片
4. 逐个上传并替换链接，实时显示进度
5. 支持使用独立的批量上传重命名模式

**完整示例**：
```
WebDAV: https://webdav.myserver.com/obsidian/images
自定义前缀: https://cdn.example.com/obsidian/images

粘贴图片 → 重命名为 sunset.png
存储位置：https://webdav.myserver.com/obsidian/images/sunset.png
插入链接：![](https://cdn.example.com/obsidian/images/sunset.png)
```

**批量上传示例**：
```
文档中有：
![](local/photo1.jpg)
![](https://external.com/photo2.png)
![](https://cdn.example.com/images/already.jpg)  ← 已上传，跳过

批量上传后：
![](https://cdn.example.com/images/photo1_20231216.jpg)
![](https://cdn.example.com/images/photo2_20231216.png)
![](https://cdn.example.com/images/already.jpg)  ← 保持不变
```

## 💡 高级特性

### 图片预览
重命名对话框中会显示图片缩略图（最大 300px），方便查看后命名

### AI 命名上下文
AI 会自动参考文档中已上传图片的命名风格：
```
已有：blog_header_20231215.png, blog_content_20231215.png
新图：AI 自动命名为 blog_footer_20231216.png  ← 保持前缀和风格
```

### 网络图片支持
直接右键上传外部网络图片到自己的图床：
```
![](https://example.com/external.jpg)  → 右键上传
![](https://cdn.example.com/images/external_20231216.jpg)  ← 转换为自己的图床
```

### 编辑安全
- 批量上传时可边上传边编辑文档
- 更新链接时光标位置不变，视图不跳转
- 使用精确替换，不影响其他内容

## ❓ 常见问题

**上传失败？**
- 检查 WebDAV URL 格式（需包含 `http://` 或 `https://`）
- 验证用户名、密码和路径
- 使用"Test"按钮测试连接

**图片无法显示？**
- 验证自定义 URL 前缀是否正确
- 在浏览器直接访问图片链接测试
- 检查 WebDAV 服务器访问权限

**AI 命名失败？**
- 检查 API Key 和 Endpoint 是否正确
- 确认模型支持图片识别（如 `gpt-4o-mini`）
- AI 失败会自动回退到模板模式

**批量上传太慢？**
- 建议使用"模板"或"AI"模式，避免使用"对话框"模式
- 对话框模式会逐个弹窗等待输入，适合少量精确重命名

## 🛠️ 开发

```bash
npm install          # 安装依赖
npm run dev          # 开发模式（监听文件变化）
npm run build        # 生产构建
```

## 📄 许可证

MIT License
