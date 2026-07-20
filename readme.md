# MyBlog

这是我的个人博客项目，计划部署到 GitHub Pages。

## 技术栈

- HTML5
- CSS
- JavaScript

## 项目结构

- `index.html`：博客首页
- `posts.html`：文章列表
- `about.html`：关于页面
- `posts/`：Markdown 文章和文章详情页
- `posts/articles/articles.json`：文章清单与展示信息
- `css/`：样式文件
- `js/blog.js`：文章列表与 Markdown 渲染
- `js/`：其他 JavaScript 文件
- `images/`：图片资源

## 本地预览

Markdown 内容需要通过 HTTP 读取，不能直接使用 `file://` 预览。可以在项目目录运行：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。部署到 GitHub Pages 后可直接正常运行。

## 发布 Markdown 文章

1. 在 `posts/articles/` 中创建 Markdown 文件，并填写文章正文。
2. 在 `posts/articles/articles.json` 中增加标题、日期、摘要、标签和 Markdown 路径。
3. 将 `markdown` 设置为新文件路径，例如 `posts/articles/my-new-post.md`。

文章会自动出现在首页最新文章和文章列表中，详情页由 `posts/first-post.html` 作为通用阅读页面动态渲染，无需再手动创建文章 HTML。
