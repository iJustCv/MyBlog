# Choooppy

Choooppy 是一个部署在 GitHub Pages 上的 Astro 静态个人博客。迁移保留了原站的布局、颜色、字体效果、动画和交互，文章改由 Astro Content Collections 自动管理。

## 技术栈

- Astro
- Astro Content Collections
- Markdown
- 原生 CSS 与 JavaScript
- GitHub Pages / GitHub Actions

## 本地运行

需要 Node.js 22.12 或更高版本。

```powershell
pnpm install
pnpm dev
```

默认访问 Astro 输出的本地地址。生产构建与预览：

```powershell
pnpm build
pnpm preview
```

## 发布文章

在 `src/content/blog/` 新建一个 Markdown 文件，例如 `my-new-post.md`：

```markdown
---
title: 文章标题
date: 2026-07-23
---

从这里开始写正文。
```

只需要 `title` 和 `date`。文件名会成为文章地址，摘要、阅读时间、列表、归档、目录和文章前后导航都在构建时自动生成。

标签可按需添加：

```yaml
tags: [Astro, 博客]
```

未完成的占位文章可以添加 `draft: true`，它会保留在列表与归档中并显示“内容准备中”，但不会生成详情页。

## GitHub Pages

工作流位于 `.github/workflows/deploy.yml`。推送到 `main` 后，GitHub Actions 会自动安装依赖、构建并部署 `dist/`。

首次使用时，在仓库 `Settings → Pages → Build and deployment → Source` 中选择 `GitHub Actions`。

当前配置保留现有自定义域名 `https://blog.choooppy.com/`，`public/CNAME` 会随构建产物一起部署。请保留现有 DNS 记录，并在 GitHub Pages 设置中启用 `Enforce HTTPS`。

如果将来取消自定义域名、改回 Project Pages 地址，需要删除 `public/CNAME`，把 `astro.config.mjs` 的 `site` 改为 `https://iJustCv.github.io`，并添加 `base: "/MyBlog"`。
