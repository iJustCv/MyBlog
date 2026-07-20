(() => {
  const root = document.documentElement;
  const themeSwitcher = document.querySelector(".theme-switcher");
  const themeSwitcherIcon = themeSwitcher?.querySelector(".theme-switcher-icon");
  const backToTop = document.querySelector(".back-to-top");
  const storageKey = "myblog-theme";
  const themes = [
    { value: "light", label: "浅色", icon: "☀" },
    { value: "ayu-dark", label: "Ayu 深色", icon: "☾" },
    { value: "purple-cyan", label: "紫青", icon: "✦" }
  ];
  const supportedThemes = new Set(themes.map((theme) => theme.value));

  const applyTheme = (theme, shouldSave = false) => {
    const nextTheme = supportedThemes.has(theme) ? theme : "light";

    root.dataset.theme = nextTheme;

    const currentIndex = themes.findIndex((theme) => theme.value === nextTheme);
    const currentTheme = themes[currentIndex];
    const followingTheme = themes[(currentIndex + 1) % themes.length];

    if (themeSwitcherIcon) {
      themeSwitcherIcon.textContent = currentTheme.icon;
    }

    if (themeSwitcher) {
      themeSwitcher.setAttribute("aria-label", `当前主题：${currentTheme.label}。切换到 ${followingTheme.label}`);
      themeSwitcher.title = `切换到 ${followingTheme.label}`;
    }

    if (!shouldSave) {
      return;
    }

    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch {
      // 页面仍可切换主题，即使浏览器阻止本地存储。
    }
  };

  applyTheme(root.dataset.theme);

  themeSwitcher?.addEventListener("click", () => {
    const currentIndex = themes.findIndex((theme) => theme.value === root.dataset.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme.value, true);
  });

  const updateBackToTop = () => {
    if (!backToTop) {
      return;
    }

    const shouldShow = window.scrollY > 320;
    backToTop.classList.toggle("visible", shouldShow);
    backToTop.setAttribute("aria-hidden", String(!shouldShow));
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
