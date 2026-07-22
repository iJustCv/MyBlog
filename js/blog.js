(() => {
  const rootPath = document.body.dataset.blogRoot || "";
  const manifestPath = `${rootPath}posts/articles/articles.json`;

  const createLink = (text, href, className = "") => {
    const link = document.createElement("a");
    link.textContent = text;
    link.href = href;
    if (className) link.className = className;
    return link;
  };

  const getArticleUrl = (article) => {
    if (!article.markdown) return "";
    const page = `${rootPath}posts/first-post.html`;
    return article.slug === "first-post" ? page : `${page}?article=${encodeURIComponent(article.slug)}`;
  };

  const formatDate = (article) => article.dateText || new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "long", day: "numeric"
  }).format(new Date(`${article.date}T00:00:00`));

  const appendArticleLink = (heading, article) => {
    const href = getArticleUrl(article);
    if (href) heading.append(createLink(article.title, href));
    else {
      const text = document.createElement("span");
      text.textContent = article.title;
      heading.append(text);
    }
  };

  const createArticleItem = (article) => {
    const item = document.createElement("article");
    item.className = `article-item${article.markdown ? "" : " is-draft"}`;
    const content = document.createElement("div");
    content.className = "article-item-content";
    const heading = document.createElement("h2");
    appendArticleLink(heading, article);
    const summary = document.createElement("p");
    summary.className = "article-summary";
    summary.textContent = article.summary;
    content.append(heading, summary);
    if (!article.markdown) {
      const label = document.createElement("span");
      label.className = "draft-label";
      label.textContent = "内容准备中";
      content.append(label);
    }
    const footer = document.createElement("footer");
    footer.className = "article-item-footer";
    const tags = document.createElement("ul");
    tags.className = "article-item-tags";
    tags.setAttribute("aria-label", "文章标签");
    (article.tags || []).forEach((tag) => {
      const tagItem = document.createElement("li");
      tagItem.textContent = tag;
      tags.append(tagItem);
    });
    const date = document.createElement("time");
    date.className = "article-item-date";
    date.dateTime = article.date;
    date.textContent = formatDate(article);
    footer.append(tags, date);
    item.append(content, footer);
    return item;
  };

  const setStatus = (container, message, isError = false) => {
    container.replaceChildren();
    const status = document.createElement("p");
    status.className = isError ? "content-status error" : "content-status";
    status.textContent = message;
    container.append(status);
  };

  const safeHref = (href) => /^(https?:\/\/|\.\.?\/|#)/.test(href) ? href : "";

  const appendInlineContent = (element, text) => {
    const pattern = /(!?\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g;
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
        const isImage = token.startsWith("!");
        const value = token.match(/^!?\[([^\]]+)\]\(([^)]+)\)$/);
        const href = safeHref(value[2].trim());
        if (isImage && href) {
          const image = document.createElement("img");
          image.src = href;
          image.alt = value[1];
          image.loading = "lazy";
          element.append(image);
        } else if (href) {
          const link = createLink(value[1], href);
          if (href.startsWith("http")) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
          element.append(link);
        } else element.append(document.createTextNode(value[1]));
      }
      lastIndex = match.index + token.length;
    }
    element.append(document.createTextNode(text.slice(lastIndex)));
  };

  const getMarkdownBody = (markdown) => markdown
    .replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/, "")
    .replace(/^#\s+[^\r\n]+\r?\n+/, "");

  const renderMarkdown = (markdown) => {
    const fragment = document.createDocumentFragment();
    const lines = getMarkdownBody(markdown).replace(/\r\n/g, "\n").split("\n");
    let index = 0;
    let headingIndex = 0;
    const isBlockStart = (line) => /^(#{2,6})\s+|^[-*]\s+|^\d+\.\s+|^>\s?|^```|^---+$/.test(line);

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) { index += 1; continue; }
      if (/^---+$/.test(line.trim())) { fragment.append(document.createElement("hr")); index += 1; continue; }
      if (line.startsWith("```")) {
        const language = line.slice(3).trim();
        const codeLines = [];
        index += 1;
        while (index < lines.length && !lines[index].startsWith("```")) { codeLines.push(lines[index]); index += 1; }
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = codeLines.join("\n");
        if (language) code.className = `language-${language.replace(/[^a-z0-9-]/gi, "")}`;
        pre.append(code); fragment.append(pre); index += 1; continue;
      }
      const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch) {
        const heading = document.createElement(`h${headingMatch[1].length}`);
        heading.id = `section-${headingIndex += 1}`;
        appendInlineContent(heading, headingMatch[2]);
        fragment.append(heading); index += 1; continue;
      }
      if (/^>\s?/.test(line)) {
        const quote = document.createElement("blockquote");
        const quoteLines = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) { quoteLines.push(lines[index].replace(/^>\s?/, "")); index += 1; }
        appendInlineContent(quote, quoteLines.join(" ")); fragment.append(quote); continue;
      }
      const listMatch = line.match(/^([-*]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const ordered = /\d+\./.test(listMatch[1]);
        const list = document.createElement(ordered ? "ol" : "ul");
        const expression = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
        while (index < lines.length && expression.test(lines[index])) {
          const item = document.createElement("li");
          appendInlineContent(item, lines[index].replace(expression, ""));
          list.append(item); index += 1;
        }
        fragment.append(list); continue;
      }
      const paragraphLines = [line.trim()];
      index += 1;
      while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) { paragraphLines.push(lines[index].trim()); index += 1; }
      const paragraph = document.createElement("p");
      appendInlineContent(paragraph, paragraphLines.join(" "));
      fragment.append(paragraph);
    }
    return fragment;
  };

  const renderArticleList = (articles) => {
    const container = document.querySelector("[data-article-list]");
    if (!container) return;
    const searchInput = document.querySelector("[data-article-search]");
    const searchClear = document.querySelector("[data-search-clear]");
    const result = document.querySelector("[data-search-result]");
    const requestedTag = new URLSearchParams(window.location.search).get("tag");
    const draw = (query = "") => {
      const keyword = query.trim().toLocaleLowerCase("zh-CN");
      const filtered = keyword ? articles.filter((article) => [
        article.title,
        article.summary,
        ...(article.tags || [])
      ].join(" ").toLocaleLowerCase("zh-CN").includes(keyword)) : articles;

      if (filtered.length) container.replaceChildren(...filtered.map(createArticleItem));
      else setStatus(container, `没有找到与“${query.trim()}”相关的文章。`);

      if (result) result.textContent = keyword ? `找到 ${filtered.length} 篇相关文章` : `全部 ${articles.length} 篇文章`;
      if (searchClear) searchClear.hidden = !keyword;
    };

    if (searchInput) {
      if (requestedTag) searchInput.value = requestedTag;
      searchInput.addEventListener("input", () => draw(searchInput.value));
      searchClear?.addEventListener("click", () => {
        searchInput.value = "";
        draw();
        searchInput.focus();
      });
    }
    draw(requestedTag || "");
  };

  const renderArchive = (articles) => {
    const container = document.querySelector("[data-archive-list]");
    if (!container) return;
    const count = document.querySelector("[data-archive-count]");
    if (count) count.textContent = articles.length;
    const groups = Object.groupBy ? Object.groupBy(articles, (article) => article.date.slice(0, 4)) : articles.reduce((result, article) => {
      const year = article.date.slice(0, 4); (result[year] ||= []).push(article); return result;
    }, {});
    const sections = Object.entries(groups).map(([year, items]) => {
      const section = document.createElement("section"); section.className = "archive-year";
      const heading = document.createElement("div"); heading.className = "archive-year-heading"; heading.innerHTML = `<h2>${year}</h2><span>${items.length} 篇</span>`;
      const list = document.createElement("div"); list.className = "archive-year-list";
      items.forEach((article) => {
        const item = document.createElement("article"); item.className = `archive-item${article.markdown ? "" : " is-draft"}`;
        const time = document.createElement("time"); time.dateTime = article.date; time.textContent = article.date.slice(5).replace("-", " / ");
        const content = document.createElement("div");
        const title = document.createElement("h3"); appendArticleLink(title, article);
        content.append(title); item.append(time, content); list.append(item);
      });
      section.append(heading, list); return section;
    });
    container.replaceChildren(...sections);
  };

  const renderToc = (body) => {
    const toc = document.querySelector("[data-article-toc]");
    if (!toc) return;
    const headings = [...body.querySelectorAll("h2, h3")];
    if (!headings.length) { toc.textContent = "本文暂无章节"; return; }
    toc.replaceChildren(...headings.map((heading) => {
      const link = createLink(heading.textContent, `#${heading.id}`, heading.tagName === "H3" ? "toc-sub" : "");
      return link;
    }));
  };

  const renderArticlePage = async (articles) => {
    const container = document.querySelector("[data-article-slug]");
    if (!container) return;
    const slug = new URLSearchParams(window.location.search).get("article") || container.dataset.articleSlug;
    const articleIndex = articles.findIndex((item) => item.slug === slug && item.markdown);
    const article = articles[articleIndex];
    if (!article) { setStatus(container, "没有找到这篇文章。", true); return; }
    const response = await fetch(`${rootPath}${article.markdown}`);
    if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
    const markdown = await response.text();
    const header = document.createElement("header"); header.className = "article-header";
    const title = document.createElement("h1"); title.textContent = article.title;
    const meta = document.createElement("div"); meta.className = "article-meta";
    const date = document.createElement("time"); date.dateTime = article.date; date.textContent = formatDate(article).replace(/\s/g, "");
    meta.append(date); header.append(title, meta);
    const body = document.createElement("div"); body.className = "article-body"; body.append(renderMarkdown(markdown)); body.querySelector("p")?.classList.add("article-lead");
    const footer = document.createElement("footer"); footer.className = "article-footer";
    const note = document.createElement("div"); note.className = "article-end-note"; note.innerHTML = "<span>✦</span><strong>感谢阅读</strong><p>如果这篇文章对你有帮助，欢迎继续探索更多内容。</p>";
    const navigation = document.createElement("nav"); navigation.className = "post-navigation"; navigation.setAttribute("aria-label", "文章导航");
    const newer = articles.slice(0, articleIndex).reverse().find((item) => item.markdown);
    const older = articles.slice(articleIndex + 1).find((item) => item.markdown);
    if (newer) navigation.append(createLink(`← ${newer.title}`, getArticleUrl(newer)));
    if (older) navigation.append(createLink(`${older.title} →`, getArticleUrl(older)));
    footer.append(note, navigation); container.replaceChildren(header, body, footer); renderToc(body);
    document.title = `${article.title} - choppy`;
  };

  const loadBlog = async () => {
    const targets = document.querySelectorAll("[data-article-list], [data-article-slug], [data-archive-list]");
    if (!targets.length) return;
    try {
      const response = await fetch(manifestPath);
      if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
      const articles = await response.json();
      articles.sort((a, b) => b.date.localeCompare(a.date));
      renderArticleList(articles); renderArchive(articles); await renderArticlePage(articles);
    } catch (error) {
      console.error("博客内容加载失败：", error);
      document.querySelectorAll("[data-article-list], [data-article-slug], [data-archive-list]").forEach((target) => setStatus(target, "文章加载失败，请通过本地静态服务器预览或稍后重试。", true));
    }
  };

  loadBlog();
})();
