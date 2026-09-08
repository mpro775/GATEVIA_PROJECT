import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`gv-button ${className}`} {...props} />;
}

export function Card({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={`gv-card ${className}`} {...props} />;
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  return <span className={`gv-badge gv-badge--${tone}`}>{children}</span>;
}

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return <label className="gv-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}{error && <small className="gv-field__error" role="alert">{error}</small>}</label>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input className="gv-input" {...props} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="gv-input gv-textarea" {...props} />; }

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <section className="gv-state"><div className="gv-state__mark" aria-hidden="true">◇</div><h2>{title}</h2><p>{description}</p></section>;
}

export function ErrorState({ title, description, requestId }: { title: string; description: string; requestId?: string }) {
  return <section className="gv-state gv-state--error" role="alert"><div className="gv-state__mark" aria-hidden="true">!</div><h2>{title}</h2><p>{description}</p>{requestId && <code>{requestId}</code>}</section>;
}

export function Skeleton({ width = '100%' }: { width?: string }) { return <span className="gv-skeleton" style={{ width }} aria-hidden="true" />; }

export function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage?: (page: number) => void }) {
  return <nav className="gv-pagination" aria-label="Pagination"><Button disabled={page <= 1} onClick={() => onPage?.(page - 1)}>Previous</Button><span>{page} / {pageCount}</span><Button disabled={page >= pageCount} onClick={() => onPage?.(page + 1)}>Next</Button></nav>;
}
