# Gemini Image Generator

一个基于 Google Gemini API 的智能图片生成 Web 应用，支持文本生成图片、图片+文本生成图片以及多图融合等多种生成模式。

## 🌟 产品介绍

Gemini Image Generator 是一个现代化的 Web 应用程序，利用 Google 最新的 Gemini 2.5 Flash Image Preview 模型，为用户提供强大的 AI 图片生成功能。无论是创意设计、内容创作还是图片编辑，都能满足您的需求。

## ✨ 功能特性

### 🎨 多种生成模式
- **Text-to-Image**：纯文本描述生成图片
- **Image + Text-to-Image**：基于上传图片和文本描述生成新图片
- **Multi-Image Fusion**：多张图片融合生成，支持风格迁移、场景合成等

### 🖼️ 图片管理
- **多种上传方式**：支持点击选择、拖拽上传、粘贴上传
- **实时预览**：上传图片即时显示缩略图预览
- **批量处理**：支持同时上传多张图片进行融合

### 💾 智能保存
- **自动保存**：生成的图片自动保存到临时目录
- **唯一命名**：使用时间戳和UUID确保文件名唯一性
- **历史记录**：保留原始提示词和上传图片的完整记录

### 🔧 便捷操作
- **一键复制**：生成图片可直接复制到剪贴板
- **快速下载**：支持直接下载图片到本地
- **响应式设计**：适配桌面和移动设备
- **实时反馈**：操作状态提示和错误处理

### 🤖 AI 提示词优化
- **智能优化**：基于 OpenAI 模型优化提示词描述
- **图片结合**：支持结合上传图片内容进行提示词优化
- **一键应用**：优化后的提示词自动填入输入框
- **对比显示**：清晰展示原始提示词与优化后提示词的差异

## 🛠️ 技术栈

### 后端
- **Python 3.8+**
- **Flask** - Web 框架
- **Google GenAI SDK** - Gemini API 客户端
- **OpenAI API** - 提示词优化服务
- **Pillow** - 图片处理库
- **python-dotenv** - 环境变量管理
- **Requests** - HTTP 请求库

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **Vanilla JavaScript** - 交互逻辑
- **Fetch API** - 异步请求
- **Clipboard API** - 剪贴板操作

## 📋 运行环境

### 系统要求
- **操作系统**：Windows 10+、macOS 10.14+、Linux (Ubuntu 18.04+)
- **Python**：3.8 或更高版本
- **浏览器**：Chrome 76+、Firefox 70+、Safari 13+、Edge 79+

### API 要求
- **Google Gemini API Key**：需要有效的 Gemini API 密钥
- **OpenAI API Key**：需要有效的 OpenAI API 密钥（用于提示词优化功能）
- **网络连接**：稳定的互联网连接用于 API 调用

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd GeminiImage
```

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 配置环境变量
复制 `.env.example` 文件并重命名为 `.env`：
```bash
cp .env.example .env
```

编辑 `.env` 文件，添加您的 API 密钥：
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-3.5-turbo
```

### 4. 启动应用
```bash
python app.py
```

### 5. 访问应用
打开浏览器访问：http://127.0.0.1:5000

## 📖 使用说明

### 基本操作
1. **输入提示词**：在底部输入框中描述您想要生成的图片
2. **上传图片**（可选）：
   - 点击上传区域选择文件
   - 直接拖拽图片到上传区域
   - 使用 Ctrl+V 粘贴剪贴板中的图片
3. **优化提示词**（可选）：
   - 点击"优化提示词"按钮使用 AI 优化您的描述
   - 如果上传了图片，AI 会结合图片内容进行优化
   - 优化后的提示词会自动填入输入框
4. **生成图片**：点击发送按钮或按回车键
5. **查看结果**：生成的图片将显示在聊天区域
6. **操作图片**：
   - 点击图片可放大查看
   - 使用复制按钮复制到剪贴板
   - 使用下载按钮保存到本地

### 生成模式说明

#### Text-to-Image（文本生成图片）
- 仅需输入文本描述
- 适用于创意设计、概念图生成
- 示例："一只可爱的橙色小猫在花园里玩耍"

#### Image + Text-to-Image（图片+文本生成）
- 上传一张图片 + 文本描述
- 适用于图片编辑、风格调整
- 示例：上传人物照片 + "将背景改为海滩"

#### Multi-Image Fusion（多图融合）
- 上传多张图片 + 文本描述
- 适用于风格迁移、场景合成
- 示例：上传服装图片和模特图片 + "让模特穿上这件衣服"

## 📁 项目结构

```
GeminiImage/
├── app.py                 # Flask 应用主文件
├── requirements.txt       # Python 依赖包
├── .env.example          # 环境变量模板
├── .gitignore           # Git 忽略文件
├── README.md            # 项目文档
├── temp_images/         # 生成图片临时存储目录
├── static/              # 静态资源目录
│   ├── style.css       # 样式文件
│   └── script.js       # JavaScript 脚本
└── templates/           # HTML 模板目录
    └── index.html      # 主页模板
```

## 🔧 配置说明

### 环境变量
- `GEMINI_API_KEY`：Google Gemini API 密钥（必需）
- `OPENAI_API_KEY`：OpenAI API 密钥（提示词优化功能必需）
- `OPENAI_API_URL`：OpenAI API 端点 URL（可选，默认为官方 API）
- `OPENAI_MODEL`：使用的 OpenAI 模型（可选，默认为 gpt-3.5-turbo）

### 应用配置
- **调试模式**：默认开启，生产环境请关闭
- **端口设置**：默认 5000，可在 `app.py` 中修改
- **临时目录**：`temp_images/`，自动创建

## 🛡️ 安全注意事项

1. **API 密钥保护**：
   - 不要将 `.env` 文件提交到版本控制
   - 定期轮换 API 密钥
   - 限制 API 密钥的访问权限

2. **文件上传安全**：
   - 仅支持图片格式文件
   - 自动验证文件类型
   - 限制文件大小（建议 < 10MB）

3. **生产部署**：
   - 使用 WSGI 服务器（如 Gunicorn）
   - 配置 HTTPS
   - 设置适当的防火墙规则

## 🐛 故障排除

### 常见问题

**Q: API 调用失败**
- 检查 API 密钥是否正确
- 确认网络连接正常
- 验证 API 配额是否充足

**Q: 图片上传失败**
- 确认文件格式为支持的图片类型
- 检查文件大小是否过大
- 验证浏览器是否支持相关 API

**Q: 复制功能不工作**
- 确认浏览器支持 Clipboard API
- 检查是否为 HTTPS 连接（本地开发除外）
- 验证浏览器权限设置

**Q: 提示词优化功能失败**
- 检查 OpenAI API 密钥是否正确配置
- 确认 API 配额是否充足
- 验证网络连接和 API 端点 URL
- 检查上传的图片格式是否支持（如有图片）

### 日志查看
应用运行时会在控制台输出详细日志，包括：
- API 调用状态
- 文件保存结果
- 错误信息详情

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Google Gemini API](https://ai.google.dev/) - 强大的 AI 图片生成能力
- [Flask](https://flask.palletsprojects.com/) - 简洁的 Web 框架
- [Pillow](https://pillow.readthedocs.io/) - Python 图片处理库

---

**享受 AI 图片生成的乐趣！** 🎨✨