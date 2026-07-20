(() => {
  const rootPath = document.body.dataset.blogRoot || "";
  const manifestPath = `${rootPath}posts/articles/articles.json`;

  const createLink = (text, href, className = "") => {
    const link = document.createElement("a");
    link.textContent = text;
    link.href = href;

    if (className) {
      link.className = className;
    }

    return link;
  };

  const getArticleUrl = (article) => {
    if (!article.markdown) {
      return "#";
    }

    const articlePage = `${rootPath}posts/first-post.html`;
    return article.slug === "first-post" ? articlePage : `${articlePage}?article=${encodeURIComponent(article.slug)}`;
  };

  const createTagList = (tags) => {
    const list = document.createElement("ul");
    list.className = "tag-list";
    list.setAttribute("aria-label", "文章标签");

    tags.forEach((tag) => {
      const item = document.createElement("li");
      item.textContent = tag;
      list.append(item);
    });

    return list;
  };

  const createPostCard = (article) => {
    const card = document.createElement("article");
    card.className = "post-card";

    const heading = document.createElement("h3");
    heading.append(createLink(article.title, getArticleUrl(article)));

    const date = document.createElement("time");
    date.dateTime = article.date;
    date.textContent = article.dateText;

    const summary = document.createElement("p");
    summary.textContent = article.summary;

    card.append(heading, date, summary, createTagList(article.tags), createLink("阅读全文", getArticleUrl(article), "read-more"));
    return card;
  };

  const createArticleItem = (article) => {
    const item = document.createElement("article");
    item.className = "article-item";

    const heading = document.createElement("h2");
    heading.append(createLink(article.title, getArticleUrl(article)));

    const date = document.createElement("time");
    date.dateTime = article.date;
    date.textContent = article.dateText;

    const summary = document.createElement("p");
    summary.textContent = article.summary;

    item.append(heading, date, summary, createTagList(article.tags), createLink("阅读全文", getArticleUrl(article), "read-more"));
    return item;
  };

  const setStatus = (container, message, isError = false) => {
    container.replaceChildren();
    const status = document.createElement("p");
    status.className = isError ? "content-status error" : "content-status";
    status.textContent = message;
    container.append(status);
  };

  const appendInlineContent = (element, text) => {
    const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      element.append(document.createTextNode(text.slice(lastIndex, match.index)));
      const token = match[0];

      if (token.startsWith("`")) {
        const code = document.createElement("code");
        code.textContent = token.slice(1, -1);
        element.append(code);
      } else if (token.startsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = token.slice(2, -2);
        element.append(strong);
      } else {
        const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        const href = linkMatch[2].trim();

        if (/^(https?:\/\/|\.\.?\/|#)/.test(href)) {
          element.append(createLink(linkMatch[1], href));
        } else {
          element.append(document.createTextNode(linkMatch[1]));
        }
      }

      lastIndex = match.index + token.length;
    }

    element.append(document.createTextNode(text.slice(lastIndex)));
  };

  const getMarkdownBody = (markdown) => {
    const withoutFrontMatter = markdown.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/, "");
    return withoutFrontMatter.replace(/^#\s+[^\r\n]+\r?\n+/, "");
  };

  const renderMarkdown = (markdown) => {
    const fragment = document.createDocumentFragment();
    const lines = getMarkdownBody(markdown).replace(/\r\n/g, "\n").split("\n");
    let index = 0;
    let headingIndex = 0;

    while (index < lines.length) {
      const line = lines[index];

      if (!line.trim()) {
        index += 1;
        continue;
      }

      if (line.startsWith("```")) {
        const language = line.slice(3).trim();
        const codeLines = [];
        index += 1;

        while (index < lines.length && !lines[index].startsWith("```")) {
          codeLines.push(lines[index]);
          index += 1;
        }

        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = codeLines.join("\n");

        if (language) {
          code.className = `language-${language.replace(/[^a-z0-9-]/gi, "")}`;
        }

        pre.append(code);
        fragment.append(pre);
        index += 1;
        continue;
      }

      const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch) {
        const heading = document.createElement(`h${headingMatch[1].length}`);
        heading.id = `section-${headingIndex += 1}`;
        appendInlineContent(heading, headingMatch[2]);
        fragment.append(heading);
        index += 1;
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        const list = document.createElement("ul");

        while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
          const item = document.createElement("li");
          appendInlineContent(item, lines[index].replace(/^[-*]\s+/, ""));
          list.append(item);
          index += 1;
        }

        fragment.append(list);
        continue;
      }

      const paragraphLines = [line.trim()];
      index += 1;

      while (index < lines.length && lines[index].trim() && !/^(#{2,6})\s+|^[-*]\s+|^```/.test(lines[index])) {
        paragraphLines.push(lines[index].trim());
        index += 1;
      }

      const paragraph = document.createElement("p");
      appendInlineContent(paragraph, paragraphLines.join(" "));
      fragment.append(paragraph);
    }

    return fragment;
  };

  const renderLatestPosts = (articles) => {
    const container = document.querySelector("[data-latest-posts]");
    if (!container) return;

    container.replaceChildren(...articles.slice(0, 3).map(createPostCard));
  };

  const renderArticleList = (articles) => {
    const container = document.querySelector("[data-article-list]");
    if (!container) return;

    container.replaceChildren(...articles.map(createArticleItem));
  };

  const renderArticlePage = async (articles) => {
    const container = document.querySelector("[data-article-slug]");
    if (!container) return;

    const querySlug = new URLSearchParams(window.location.search).get("article");
    const slug = querySlug || container.dataset.articleSlug;
    const article = articles.find((item) => item.slug === slug && item.markdown);

    if (!article) {
      setStatus(container, "没有找到这篇文章。", true);
      return;
    }

    const response = await fetch(`${rootPath}${article.markdown}`);
    if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
    const markdown = await response.text();

    const header = document.createElement("header");
    header.className = "article-header";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "BLOG";

    const title = document.createElement("h1");
    title.textContent = article.title;

    const meta = document.createElement("div");
    meta.className = "article-meta";
    const date = document.createElement("time");
    date.dateTime = article.date;
    date.textContent = article.dateText;
    meta.append(date, createTagList(article.tags));
    header.append(eyebrow, title, meta);

    const body = document.createElement("div");
    body.className = "article-body";
    body.append(renderMarkdown(markdown));
    body.querySelector("p")?.classList.add("article-lead");

    const footer = document.createElement("footer");
    footer.className = "article-footer";
    footer.append(createLink("← 返回文章列表", `${rootPath}posts.html`, "back-link"));

    container.replaceChildren(header, body, footer);
    document.title = `${article.title} - MyBlog`;
  };

  const loadBlog = async () => {
    const targets = document.querySelectorAll("[data-latest-posts], [data-article-list], [data-article-slug]");
    if (!targets.length) return;

    try {
      const response = await fetch(manifestPath);
      if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
      const articles = await response.json();
      articles.sort((first, second) => second.date.localeCompare(first.date));

      renderLatestPosts(articles);
      renderArticleList(articles);
      await renderArticlePage(articles);
    } catch (error) {
      console.error("博客内容加载失败：", error);
      targets.forEach((target) => setStatus(target, "文章加载失败，请通过本地静态服务器预览或稍后重试。", true));
    }
  };

  loadBlog();
})();
