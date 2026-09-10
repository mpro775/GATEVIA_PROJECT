export function GatewayVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`gateway-visual${compact ? ' gateway-visual--compact' : ''}`}
      aria-hidden="true"
    >
      <span className="gateway-visual__index">01 / 03</span>
      <div className="gateway-visual__frame gateway-visual__frame--outer" />
      <div className="gateway-visual__frame gateway-visual__frame--inner" />
      <div className="gateway-visual__path">
        <span />
      </div>
      <span className="gateway-visual__point" />
      <span className="gateway-visual__label">KSA · 24.7° N</span>
    </div>
  );
}
