(() => {
  const storageKey = "choooppy-theme";
  const legacyStorageKey = "myblog-theme";
  let theme;

  try {
    const savedTheme = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
    } else if (savedTheme === "ayu-dark" || savedTheme === "purple-cyan") {
      theme = "dark";
    }
  } catch {
    // 本地存储不可用时跟随系统设置。
  }

  if (!theme) {
    theme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.documentElement.dataset.theme = theme;
})();
