# GitHub 发布指南

## 🚀 将项目发布到 GitHub

### 前置条件

- 已安装 Git
- 有 GitHub 账户
- 项目已初始化完成

## 📋 步骤

### 1. 初始化 Git 仓库（如果尚未初始化）

```bash
cd d:\Program\ASCIIart-generator
git init
git add .
git commit -m "Initial commit: ASCII Art Generator"
```

### 2. 在 GitHub 创建新仓库

1. 访问 https://github.com/new
2. 输入仓库名称：`ASCIIart-generator`
3. 选择 "Public"（如果想让任何人都能访问）
4. 不选择 "Add README"（我们已经有了）
5. 点击 "Create repository"

### 3. 添加远程仓库并推送

```bash
cd d:\Program\ASCIIart-generator

# 添加远程仓库（替换 USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/USERNAME/ASCIIart-generator.git

# 重命名分支为 main（如果需要）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 4. 启用 GitHub Pages

#### 使用 GitHub 界面：

1. 在 GitHub 上打开仓库
2. 点击 "Settings" 选项卡
3. 左侧菜单选择 "Pages"
4. 在 "Source" 部分：
   - 选择分支：`main`
   - 选择目录：`/ (root)`
5. 点击 "Save"

#### 使用命令行（可选）：

```bash
# GitHub CLI（如果已安装）
gh repo edit --enable-pages --pages-branch=main
```

### 5. 等待部署

- GitHub Pages 会自动部署您的应用
- 通常需要 1-2 分钟
- 查看 "Pages" 设置页面查看部署状态
- 一旦完成，你会看到一个绿色的链接

### 6. 访问你的应用

部署完成后，访问：
```
https://USERNAME.github.io/ASCIIart-generator
```

## 📝 后续更新

### 更新代码步骤

```bash
# 编辑文件...

# 提交更改
git add .
git commit -m "描述你做了什么"

# 推送到 GitHub
git push origin main
```

GitHub Pages 会自动重新部署（通常需要 1-2 分钟）。

## 🔒 常见设置

### 添加 LICENSE

推荐添加 MIT 许可证：

```bash
# 创建 LICENSE 文件
# 内容参考：https://opensource.org/licenses/MIT
git add LICENSE
git commit -m "Add MIT License"
git push origin main
```

### 更新 package.json

更新项目信息：

```json
{
  "name": "ascii-art-generator",
  "version": "1.0.0",
  "description": "Convert images to ASCII art - Static web app",
  "homepage": "https://username.github.io/ASCIIart-generator",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/ASCIIart-generator.git"
  }
}
```

## 🎨 SEO 优化（可选）

在 `index.html` 中添加元标签：

```html
<meta name="description" content="Convert your images to ASCII art with customizable width and character sets">
<meta name="keywords" content="ASCII, art, generator, image, conversion">
<meta property="og:title" content="ASCII Art Generator">
<meta property="og:description" content="Convert images to ASCII art">
<meta property="og:type" content="website">
<meta property="og:url" content="https://username.github.io/ASCIIart-generator">
```

## ✅ 检查清单

部署前请确保：

- [ ] TypeScript 代码已编译（`dist/` 目录存在）
- [ ] 本地测试无误
- [ ] `.gitignore` 已配置正确
- [ ] 所有必要的文件都已提交
- [ ] GitHub 仓库已创建
- [ ] GitHub Pages 已启用
- [ ] 访问链接正常工作

## 🐛 故障排除

### "404 Not Found" 错误

- 检查仓库是否是 Public
- 检查 GitHub Pages 是否已启用
- 等待 1-2 分钟再试

### 样式或脚本不加载

- 确保 `dist/` 目录已提交到 Git
- 清除浏览器缓存（Ctrl+F5）
- 检查浏览器控制台的错误信息

### 代码更改未显示

- 确保已执行 `npm run build` 编译 TypeScript
- 确保已 `git push` 推送到 GitHub
- 等待 1-2 分钟让 GitHub Pages 重新部署
- 清除浏览器缓存

## 📚 有用的链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Git 基本教程](https://git-scm.com/book)
- [Markdown 语法](https://docs.github.com/en/get-started/writing-on-github)

## 🎉 完成！

你的 ASCII Art 生成器现在已发布到互联网上！你可以与任何人分享链接。

---

**需要帮助？** 查看 README.md 或 SETUP_GUIDE.md 文件。
