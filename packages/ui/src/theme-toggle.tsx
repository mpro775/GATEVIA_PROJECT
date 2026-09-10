'use client';

import { useEffect, useState } from 'react';
import type { Theme } from '@gatevia/contracts';
import { Icon } from './icons';

const COOKIE = 'gatevia_theme';

export function ThemeToggle({
  labels = { light: 'Use light mode', dark: 'Use dark mode' },
}: {
  labels?: Record<Theme, string>;
}) {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'light' ? 'light' : 'dark');
  }, []);
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.cookie = `${COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    setTheme(next);
    window.dispatchEvent(new CustomEvent('gatevia:theme', { detail: next }));
  };
  return (
    <button
      type="button"
      className="gv-theme-toggle"
      onClick={toggle}
      aria-label={labels[theme === 'dark' ? 'light' : 'dark']}
      aria-pressed={theme === 'light'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
