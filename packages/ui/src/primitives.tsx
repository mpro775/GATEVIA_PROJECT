import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      className={`gv-button gv-button--${variant} gv-button--${size} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="gv-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function IconButton({
  className = '',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: ButtonSize }) {
  return (
    <button className={`gv-icon-button gv-icon-button--${size} ${className}`.trim()} {...props} />
  );
}

export function Card({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={`gv-card ${className}`.trim()} {...props} />;
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}) {
  return <span className={`gv-badge gv-badge--${tone}`}>{children}</span>;
}

export function Field({
  label,
  error,
  children,
  hint,
  required,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="gv-field">
      <span className="gv-field__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
      {hint && <small>{hint}</small>}
      {error && (
        <small className="gv-field__error" role="alert">
          {error}
        </small>
      )}
    </label>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`gv-input ${className}`.trim()} {...props} />;
}
export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`gv-input gv-textarea ${className}`.trim()} {...props} />;
}
export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`gv-input gv-select ${className}`.trim()} {...props} />;
}
export function Checkbox({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="gv-choice">
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
export function Radio({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="gv-choice">
      <input type="radio" {...props} />
      <span>{label}</span>
    </label>
  );
}
export function Accordion({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`gv-accordion ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="gv-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="gv-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  );
}
export function Dropdown({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`gv-dropdown ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
export function Tabs({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`gv-tabs ${className}`.trim()} role="tablist" {...props}>
      {children}
    </div>
  );
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="gv-state">
      <span className="gv-state__mark" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
export function ErrorState({
  title,
  description,
  requestId,
}: {
  title: string;
  description: string;
  requestId?: string;
}) {
  return (
    <section className="gv-state gv-state--error" role="alert">
      <span className="gv-state__mark" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {requestId && <code>{requestId}</code>}
    </section>
  );
}
export function Skeleton({ width = '100%' }: { width?: string }) {
  return <span className="gv-skeleton" style={{ width }} aria-hidden="true" />;
}
export function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage?: (page: number) => void;
}) {
  return (
    <nav className="gv-pagination" aria-label="Pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage?.(page - 1)}>
        Previous
      </Button>
      <span>
        {page} / {pageCount}
      </span>
      <Button variant="secondary" disabled={page >= pageCount} onClick={() => onPage?.(page + 1)}>
        Next
      </Button>
    </nav>
  );
}
