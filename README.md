# WebDAV Image Hosting

一个 Obsidian 插件，将图片自动上传到 WebDAV 图床，支持多种智能重命名方式和自定义 URL 链接。

## ✨ 核心功能

### 📤 WebDAV 图床上传
- 粘贴或拖放图片时自动上传到 WebDAV 服务器
- 支持右键本地图片直接上传
- 兼容桌面端和移动端
- 支持多种图片格式（JPG, PNG, GIF, WebP, BMP, SVG）

### ✏️ 三种智能重命名方式
1. **对话框模式**：弹窗手动重命名，一键 AI 辅助生成文件名
2. **AI 模式**：完全自动化 AI 识别图片内容并命名
3. **模板模式**：使用自定义模板（时间戳、日期、随机字符）批量命名

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

| 模式 | 特点 | 适用场景 |
|------|------|----------|
| 对话框 | 手动输入 + AI 辅助按钮 | 需要精确控制文件名 |
| AI | 完全自动 AI 命名 | 快速批量上传 |
| 模板 | 自定义规则自动生成 | 统一命名规范 |

**模板示例**：
- `image-{timestamp}` → `image-1701234567890.png`
- `{date}-{random}` → `20251203144201-abc123.png`

**AI 配置**（选用 AI 模式时需要）：
- API Key：OpenAI 或兼容服务的密钥
- Endpoint：API 地址（默认 OpenAI）
- Model：模型名称（如 `gpt-4o-mini`）

### 3. 自定义最终链接

通过"自定义 URL 前缀"控制插入笔记的图片链接格式。

**示例**：

| WebDAV 存储位置 | 上传路径 | 自定义 URL 前缀 | 最终链接 |
|----------------|----------|----------------|----------|
| `https://dav.example.com` | `/images` | `https://dav.example.com/images` | 直接访问 WebDAV |
| `https://webdav.server.com` | `/img` | `https://cdn.mycdn.com/img` | 通过 CDN 访问 |
| `https://internal.dav.com` | `/files` | `https://public.example.com/files` | 反向代理域名 |

## 🚀 使用方法

### 粘贴/拖放图片
1. 复制图片或从文件管理器拖入编辑器
2. 根据配置的重命名模式：
   - **对话框**：弹窗中手动输入或点击 🤖 AI 按钮智能生成
   - **AI**：自动识别内容并命名
   - **模板**：按规则自动生成
3. 自动上传到 WebDAV 并插入自定义链接

### 上传本地图片
1. 在文件列表中右键图片
2. 选择"Upload to WebDAV"
3. 根据设置处理本地文件

**完整示例**：
```
WebDAV: https://webdav.myserver.com/obsidian/images
自定义前缀: https://cdn.example.com/obsidian/images

粘贴图片 → 重命名为 sunset.png
存储位置：https://webdav.myserver.com/obsidian/images/sunset.png
插入链接：![](https://cdn.example.com/obsidian/images/sunset.png)
```

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

## 🛠️ 开发

```bash
npm install          # 安装依赖
npm run dev          # 开发模式（监听文件变化）
npm run build        # 生产构建
```

## 📄 许可证

MIT License
