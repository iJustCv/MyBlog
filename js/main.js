(() => {
  const root = document.documentElement;
  const themeSwitcher = document.querySelector(".theme-switcher");
  const themeIcon = themeSwitcher?.querySelector(".theme-switcher-icon");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");
  const backToTop = document.querySelector(".back-to-top");
  const storageKey = "myblog-theme";

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
      try { localStorage.setItem(storageKey, nextTheme); } catch { /* 主题仍可在当前页面生效。 */ }
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

  const updateScrollUI = () => {
    const show = window.scrollY > 360;
    backToTop?.classList.toggle("visible", show);
    backToTop?.setAttribute("aria-hidden", String(!show));

    const article = document.querySelector(".article-content");
    const progress = document.querySelector("[data-reading-progress]");
    if (article && progress) {
      const start = article.offsetTop;
      const distance = Math.max(article.offsetHeight - window.innerHeight, 1);
      const percent = Math.min(100, Math.max(0, ((window.scrollY - start + 96) / distance) * 100));
      progress.style.width = `${percent}%`;
    }
  };

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.querySelectorAll("[data-current-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
})();
