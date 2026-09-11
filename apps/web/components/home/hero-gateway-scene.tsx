export function HeroGatewayScene() {
  return (
    <div className="home-gateway" aria-hidden="true" data-reveal="home-scene">
      <div className="home-gateway__coordinates">
        <span>24° 42′</span>
        <span>GTV / KSA</span>
      </div>
      <div className="home-gateway__geometry">
        <div className="home-gateway__plane" />
        <div className="home-gateway__frame home-gateway__frame--outer" />
        <div className="home-gateway__frame home-gateway__frame--offset" />
        <div className="home-gateway__threshold" />
        <svg className="home-gateway__route" viewBox="0 0 720 500" focusable="false">
          <path className="home-gateway__route-shadow" d="M86 430 C205 402 248 334 334 294 C425 252 503 251 646 112" />
          <path className="home-gateway__route-line" d="M86 430 C205 402 248 334 334 294 C425 252 503 251 646 112" pathLength="1" />
        </svg>
        <span className="home-gateway__node home-gateway__node--entry" />
        <span className="home-gateway__node home-gateway__node--market" />
        <span className="home-gateway__node home-gateway__node--growth" />
        <span className="home-gateway__axis home-gateway__axis--one" />
        <span className="home-gateway__axis home-gateway__axis--two" />
      </div>
      <div className="home-gateway__indexes">
        <span>01</span>
        <span>02</span>
        <span>03</span>
      </div>
    </div>
  );
}
