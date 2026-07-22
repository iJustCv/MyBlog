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

  const createTagList = (tags = []) => {
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

  const appendArticleLink = (heading, article) => {
    const href = getArticleUrl(article);
    if (href) heading.append(createLink(article.title, href));
    else {
      const text = document.createElement("span");
      text.textContent = article.title;
      heading.append(text);
    }
  };

  const createPostCard = (article) => {
    const card = document.createElement("article");
    card.className = `post-card${article.markdown ? "" : " is-draft"}`;
    const top = document.createElement("div");
    top.className = "post-card-top";
    const category = document.createElement("span");
    category.className = "post-category";
    category.textContent = article.category || article.tags?.[0] || "随笔";
    const date = document.createElement("time");
    date.dateTime = article.date;
    date.textContent = formatDate(article);
    top.append(category, date);
    const heading = document.createElement("h3");
    appendArticleLink(heading, article);
    const summary = document.createElement("p");
    summary.textContent = article.summary;
    const footer = document.createElement("div");
    footer.className = "post-card-footer";
    footer.append(createTagList(article.tags));
    if (article.markdown) footer.append(createLink("阅读全文 →", getArticleUrl(article), "read-more"));
    else {
      const draft = document.createElement("span");
      draft.className = "draft-label";
      draft.textContent = "即将发布";
      footer.append(draft);
    }
    card.append(top, heading, summary, footer);
    return card;
  };

  const createArticleItem = (article) => {
    const item = document.createElement("article");
    item.className = `article-item${article.markdown ? "" : " is-draft"}`;
    const dateBlock = document.createElement("div");
    dateBlock.className = "article-date-block";
    const parsed = new Date(`${article.date}T00:00:00`);
    dateBlock.innerHTML = `<strong>${String(parsed.getDate()).padStart(2, "0")}</strong><span>${String(parsed.getMonth() + 1).padStart(2, "0")} / ${parsed.getFullYear()}</span>`;
    const content = document.createElement("div");
    content.className = "article-item-content";
    const meta = document.createElement("div");
    meta.className = "article-item-meta";
    meta.textContent = article.category || article.tags?.[0] || "随笔";
    const heading = document.createElement("h2");
    appendArticleLink(heading, article);
    const summary = document.createElement("p");
    summary.textContent = article.summary;
    content.append(meta, heading, summary, createTagList(article.tags));
    if (!article.markdown) {
      const label = document.createElement("span");
      label.className = "draft-label";
      label.textContent = "内容准备中";
      content.append(label);
    }
    item.append(dateBlock, content);
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

  const renderLatestPosts = (articles) => {
    document.querySelectorAll("[data-latest-posts]").forEach((container) => container.replaceChildren(...articles.slice(0, 4).map(createPostCard)));
  };

  const renderArticleList = (articles) => {
    const container = document.querySelector("[data-article-list]");
    const controls = document.querySelector("[data-filter-controls]");
    if (!container) return;
    const categories = ["全部", ...new Set(articles.map((article) => article.category || "随笔"))];
    const requestedTag = new URLSearchParams(window.location.search).get("tag");
    const draw = (category, tag = "") => {
      const filtered = tag
        ? articles.filter((article) => (article.tags || []).includes(tag))
        : category === "全部" ? articles : articles.filter((article) => (article.category || "随笔") === category);
      container.replaceChildren(...filtered.map(createArticleItem));
      const result = document.querySelector("[data-filter-result]");
      if (result) result.textContent = `${tag ? `# ${tag}` : category} · ${filtered.length} 篇`;
    };
    if (controls) {
      controls.replaceChildren(...categories.map((category, index) => {
        const button = document.createElement("button");
        button.className = `filter-button${index === 0 ? " active" : ""}`;
        button.type = "button";
        button.textContent = category;
        button.setAttribute("aria-pressed", String(index === 0));
        button.addEventListener("click", () => {
          controls.querySelectorAll("button").forEach((item) => { item.classList.remove("active"); item.setAttribute("aria-pressed", "false"); });
          button.classList.add("active"); button.setAttribute("aria-pressed", "true"); draw(category);
        });
        return button;
      }));
    }
    draw("全部", requestedTag || "");
  };

  const renderWidgets = (articles) => {
    document.querySelectorAll("[data-recent-posts]").forEach((container) => {
      const available = articles.filter((article) => article.markdown).slice(0, 4);
      container.replaceChildren(...available.map((article) => {
        const row = createLink(article.title, getArticleUrl(article), "recent-item");
        const date = document.createElement("small"); date.textContent = article.date.slice(5).replace("-", "."); row.append(date); return row;
      }));
    });
    const tags = [...new Set(articles.flatMap((article) => article.tags || []))];
    document.querySelectorAll("[data-tag-cloud]").forEach((container) => {
      container.replaceChildren(...tags.map((tag) => {
        const link = createLink(`# ${tag}`, `${rootPath}posts.html?tag=${encodeURIComponent(tag)}`);
        link.title = `查看 ${tag} 相关文章`;
        return link;
      }));
    });
    document.querySelectorAll("[data-site-stats]").forEach((container) => {
      const values = container.querySelectorAll("strong");
      if (values[0]) values[0].textContent = articles.length;
      if (values[1]) values[1].textContent = tags.length;
    });
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
        const meta = document.createElement("p"); meta.textContent = `${article.category || "随笔"} · ${(article.tags || []).join(" / ")}`;
        content.append(title, meta); item.append(time, content); list.append(item);
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
    const breadcrumb = document.createElement("p"); breadcrumb.className = "article-breadcrumb"; breadcrumb.textContent = `首页 / ${article.category || "文章"}`;
    const title = document.createElement("h1"); title.textContent = article.title;
    const meta = document.createElement("div"); meta.className = "article-meta";
    const date = document.createElement("time"); date.dateTime = article.date; date.textContent = formatDate(article);
    const wordCount = getMarkdownBody(markdown).replace(/\s/g, "").length;
    const reading = document.createElement("span"); reading.textContent = `约 ${Math.max(1, Math.ceil(wordCount / 500))} 分钟阅读`;
    meta.append(date, reading, createTagList(article.tags)); header.append(breadcrumb, title, meta);
    const body = document.createElement("div"); body.className = "article-body"; body.append(renderMarkdown(markdown)); body.querySelector("p")?.classList.add("article-lead");
    const footer = document.createElement("footer"); footer.className = "article-footer";
    const note = document.createElement("div"); note.className = "article-end-note"; note.innerHTML = "<span>✦</span><strong>感谢阅读</strong><p>如果这篇文章对你有帮助，欢迎继续探索更多内容。</p>";
    const navigation = document.createElement("nav"); navigation.className = "post-navigation"; navigation.setAttribute("aria-label", "文章导航");
    const newer = articles.slice(0, articleIndex).reverse().find((item) => item.markdown);
    const older = articles.slice(articleIndex + 1).find((item) => item.markdown);
    if (newer) navigation.append(createLink(`← ${newer.title}`, getArticleUrl(newer)));
    if (older) navigation.append(createLink(`${older.title} →`, getArticleUrl(older)));
    footer.append(note, navigation); container.replaceChildren(header, body, footer); renderToc(body);
    document.title = `${article.title} - MyBlog`;
  };

  const loadBlog = async () => {
    const targets = document.querySelectorAll("[data-latest-posts], [data-article-list], [data-article-slug], [data-archive-list], [data-recent-posts], [data-tag-cloud], [data-site-stats]");
    if (!targets.length) return;
    try {
      const response = await fetch(manifestPath);
      if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
      const articles = await response.json();
      articles.sort((a, b) => b.date.localeCompare(a.date));
      renderLatestPosts(articles); renderArticleList(articles); renderWidgets(articles); renderArchive(articles); await renderArticlePage(articles);
    } catch (error) {
      console.error("博客内容加载失败：", error);
      document.querySelectorAll("[data-latest-posts], [data-article-list], [data-article-slug], [data-archive-list]").forEach((target) => setStatus(target, "文章加载失败，请通过本地静态服务器预览或稍后重试。", true));
    }
  };

  loadBlog();
})();
