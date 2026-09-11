export function GatewayVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`gateway-visual${compact ? ' gateway-visual--compact' : ''}`}
      aria-hidden="true"
      data-reveal="scale"
    >
      <div className="gateway-visual__frame gateway-visual__frame--outer" />
      <div className="gateway-visual__frame gateway-visual__frame--inner" />
      <div className="gateway-visual__path" data-gateway-path="true">
        <span />
      </div>
      <span className="gateway-visual__point" />
    </div>
  );
}
