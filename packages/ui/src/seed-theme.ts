/**
 * @see https://v1-0.seed-design.io/react/getting-started/installation/manual
 */
export const seedThemeScript = `
try {
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  if ('addEventListener' in prefersDark) {
    prefersDark.addEventListener('change', apply);
  } else if ('addListener' in prefersDark) {
    prefersDark.addListener(apply);
  }

  if (prefersDark.matches) {
    document.documentElement.dataset.seedUserColorScheme = 'dark';
  } else {
    document.documentElement.dataset.seedUserColorScheme = 'light';
  }

  function apply() {
    document.documentElement.dataset.seedUserColorScheme = prefersDark.matches ? 'dark' : 'light';
  }
} catch (e) {}
`;
