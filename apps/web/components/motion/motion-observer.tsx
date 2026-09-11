'use client';

import { useEffect } from 'react';

const SELECTOR = '[data-reveal]:not(.is-revealed)';

export function MotionObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealImmediately = (scope: ParentNode = document) => {
      scope.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => element.classList.add('is-revealed'));
    };

    if (reduced.matches || !('IntersectionObserver' in window)) {
      revealImmediately();
      root.classList.add('motion-ready');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const observe = (scope: ParentNode = document) => {
      scope.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => observer.observe(element));
    };

    observe();
    root.classList.add('motion-ready');
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(SELECTOR)) observer.observe(node);
          observe(node);
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      root.classList.remove('motion-ready');
    };
  }, []);

  return null;
}
