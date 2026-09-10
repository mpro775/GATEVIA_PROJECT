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
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow || 'GATEVIA'}</span>
        {title && <h2>{title}</h2>}
      </div>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}
