(() => {
  const root = document.documentElement;
  const themeSwitcher = document.querySelector(".theme-switcher");
  const themeIcon = themeSwitcher?.querySelector(".theme-switcher-icon");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");
  const storageKey = "choooppy-theme";

  const applyTheme = (theme, save = false) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    const isDark = nextTheme === "dark";
    if (themeIcon) themeIcon.textContent = isDark ? "☀" : "☾";
    if (themeSwitcher) {
      themeSwitcher.setAttribute("aria-label", isDark ? "切换浅色模式" : "切换深色模式");
      themeSwitcher.title = isDark ? "切换浅色模式" : "切换深色模式";
    }
    if (save) {
      try { localStorage.setItem(storageKey, nextTheme); } catch { /* 当前页面仍可使用主题。 */ }
    }
  };

  applyTheme(root.dataset.theme);
  themeSwitcher?.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true));
  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.querySelector("[aria-hidden='true']").textContent = open ? "×" : "☰";
    navMenu?.classList.toggle("open", open);
  });
  navMenu?.addEventListener("click", (event) => {
    if (!event.target.closest("a") || !navToggle) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("open");
  });

  const article = document.querySelector(".article-content");
  const progress = document.querySelector("[data-reading-progress]");
  if (article && progress) {
    const updateReadingProgress = () => {
      const distance = Math.max(article.offsetHeight - window.innerHeight, 1);
      const percent = Math.min(100, Math.max(0, ((window.scrollY - article.offsetTop + 96) / distance) * 100));
      progress.style.width = `${percent}%`;
    };
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    updateReadingProgress();
  }
  document.querySelectorAll("[data-current-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

  const searchInput = document.querySelector("[data-article-search]");
  const searchClear = document.querySelector("[data-search-clear]");
  const searchResult = document.querySelector("[data-search-result]");
  const searchEmpty = document.querySelector("[data-search-empty]");
  const articleItems = [...document.querySelectorAll("[data-article-item]")];
  const drawSearch = (query = "") => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");
    let visible = 0;
    articleItems.forEach((item) => {
      const match = !keyword || item.dataset.searchText.includes(keyword);
      item.hidden = !match;
      if (match) visible += 1;
    });
    if (searchClear) searchClear.hidden = !keyword;
    if (searchEmpty) {
      searchEmpty.hidden = visible !== 0;
      searchEmpty.textContent = `没有找到与“${query.trim()}”相关的文章。`;
    }
    if (searchResult) searchResult.textContent = keyword ? `找到 ${visible} 篇相关文章` : `全部 ${articleItems.length} 篇文章`;
  };
  if (searchInput) {
    const requestedTag = new URLSearchParams(location.search).get("tag") || "";
    searchInput.value = requestedTag;
    searchInput.addEventListener("input", () => drawSearch(searchInput.value));
    searchClear?.addEventListener("click", () => { searchInput.value = ""; drawSearch(); searchInput.focus(); });
    drawSearch(requestedTag);
  }
})();
