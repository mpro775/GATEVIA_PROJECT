'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon, IconButton } from '@gatevia/ui';
import type { Language } from '@/lib/api';

export function LanguageMenu({ locale, languages, label, onSelect }: { locale: string; languages: Language[]; label: string; onSelect: (language: Language) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  if (languages.length < 2) return null;
  return (
    <div className="language-menu" ref={rootRef}>
      <IconButton ref={triggerRef} aria-label={label} aria-expanded={open} aria-controls="language-popover" onClick={() => setOpen((value) => !value)}>
        <Icon name="globe" />
      </IconButton>
      <div id="language-popover" className="language-popover" data-open={open} aria-hidden={!open}>
        <span className="language-popover__label">{label}</span>
        {languages.map((language) => {
          const current = language.code.toLowerCase() === locale.toLowerCase();
          return (
            <button key={language.code} type="button" tabIndex={open ? undefined : -1} aria-current={current ? 'true' : undefined} onClick={() => { setOpen(false); onSelect(language); }}>
              <Icon name={current ? 'check' : 'globe'} />
              <span>{language.nativeName}</span>
              <small>{language.code.toUpperCase()}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
