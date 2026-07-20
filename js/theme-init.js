(() => {
  const storageKey = "myblog-theme";
  const supportedThemes = ["light", "ayu-dark", "purple-cyan"];
  let theme = "light";

  try {
    const savedTheme = localStorage.getItem(storageKey);

    if (supportedThemes.includes(savedTheme)) {
      theme = savedTheme;
    }
  } catch {
    // 无法读取本地存储时使用默认浅色主题。
  }

  document.documentElement.dataset.theme = theme;
})();
