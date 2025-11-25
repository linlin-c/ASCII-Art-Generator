# 图片转ASCII字符画
## 简介
ASCIIart-generator是一个轻量级的前端项目，用户上传图片（支持JPG/PNG格式），项目会将其转换为由点阵符号组成的字符画文本。这样的文本可以很方便地在steam留言板/其他聊天框中复制使用。
## 核心功能
- **ASCII 生成**
   - 可调整宽度：1-60 字符
   - 多个预设字符集：
     - 默认（盲文混合）：⢠⢉⠾⠃⠈⠱⣞⡿
     - 块字符：░▒▓█
     - 自定义字符

- **高级选项**
   - 反转颜色方案
   - steam留言板模式（将自动生成<1000个字节的字符）

## 在线版
已发布GitHub Pages：[ASCII Art生成器](https://linlin-c.github.io/ASCII-Art-Generator/)

## 快速开始
### 安装依赖
```bash
npm install
```

```bash
npx tsc
```

### 启动本地服务器

```bash
python -m http.server 8000 --directory public
```

### 访问应用

打开浏览器访问：`http://localhost:8000`
