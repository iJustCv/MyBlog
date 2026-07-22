# MyBlog

一个部署在 GitHub Pages 上的纯静态个人博客。视觉设计借鉴 Stellar 的简洁、留白与知识库式布局，并加入克制的紫色、青色和星空元素。

## 技术栈

- HTML5
- CSS3
- 原生 JavaScript
- GitHub Pages

项目不依赖 Hexo、Node.js 构建流程或前端框架。

## 项目结构

- `index.html`：博客首页
- `posts.html`：文章列表与分类筛选
- `archive.html`：按年份展示的文章归档
- `about.html`：关于页面
- `posts/first-post.html`：所有 Markdown 文章共用的阅读页面
- `posts/*.md`：Markdown 文章
- `posts/articles/articles.json`：文章清单与展示信息
- `css/style.css`：全站布局、组件、响应式与深色模式
- `js/blog.js`：文章列表、归档、侧边栏与 Markdown 渲染
- `js/main.js`：导航、主题切换、阅读进度与返回顶部
- `js/theme-init.js`：页面加载前初始化主题
- `images/`：图片资源

## 本地预览

Markdown 和 JSON 内容通过 `fetch` 读取，因此不能直接使用 `file://` 打开。请在项目目录运行静态服务器：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## 发布 Markdown 文章

1. 在 `posts/` 中创建 Markdown 文件，例如 `posts/my-new-post.md`。
2. 在 `posts/articles/articles.json` 中新增一条记录：

```json
{
  "slug": "my-new-post",
  "title": "文章标题",
  "date": "2026-07-22",
  "dateText": "2026 年 7 月 22 日",
  "summary": "文章摘要",
  "category": "技术",
  "tags": ["JavaScript", "Web"],
  "markdown": "posts/my-new-post.md"
}
```

文章会自动出现在首页、文章列表、侧边栏和归档页面中。阅读页继续由 `posts/first-post.html` 动态渲染，不需要为每篇文章创建 HTML。

如果 `markdown` 为 `null`，文章会显示为“即将发布”，不会产生空链接。

## 主题与响应式

- 默认跟随系统浅色或深色偏好。
- 用户手动切换后会将选择保存在浏览器本地。
- 桌面端采用侧边栏、主内容、组件栏布局。
- 平板和手机端自动合并为单栏，并提供折叠导航。

## GitHub Pages

项目保留 `.nojekyll`，所有资源均使用兼容 GitHub Project Pages 的相对路径。继续将仓库分支配置为 GitHub Pages 发布源即可，无需额外构建步骤。
