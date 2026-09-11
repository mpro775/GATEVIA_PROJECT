export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  action?: React.ReactNode;
}) {
  if (!eyebrow && !title && !body) return null;
  return (
    <div className="section-heading" data-reveal-group="heading">
      <div>
        <span className="eyebrow" data-reveal="fade">{eyebrow || 'GATEVIA'}</span>
        {title && <h2 data-reveal="up" style={{ '--reveal-delay': '55ms' } as React.CSSProperties}>{title}</h2>}
      </div>
      {body && <p data-reveal="up" style={{ '--reveal-delay': '95ms' } as React.CSSProperties}>{body}</p>}
      {action && <div data-reveal="fade" style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>{action}</div>}
    </div>
  );
}
