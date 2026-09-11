export function GatewayVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`gateway-visual${compact ? ' gateway-visual--compact' : ''}`}
      aria-hidden="true"
    >
      <div className="gateway-visual__frame gateway-visual__frame--outer" />
      <div className="gateway-visual__frame gateway-visual__frame--inner" />
      <div className="gateway-visual__path">
        <span />
      </div>
      <span className="gateway-visual__point" />
    </div>
  );
}
