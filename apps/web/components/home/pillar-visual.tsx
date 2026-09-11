export function PillarVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="pillar-visual pillar-visual--gateway" aria-hidden="true">
        <svg viewBox="0 0 320 190" focusable="false">
          <path className="pillar-visual__muted" d="M36 166V42h116v124" />
          <path className="pillar-visual__accent" d="M74 166V75h112v91" pathLength="1" />
          <path className="pillar-visual__route" d="M18 166h132l82-58h70" pathLength="1" />
          <circle className="pillar-visual__node" cx="231" cy="108" r="6" />
        </svg>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="pillar-visual pillar-visual--path" aria-hidden="true">
        <svg viewBox="0 0 320 190" focusable="false">
          <path className="pillar-visual__plane" d="M22 153L109 48h186l-88 105H22Z" />
          <path className="pillar-visual__route" d="M34 142c54-4 61-65 119-65s67 54 137 26" pathLength="1" />
          <circle className="pillar-visual__node" cx="91" cy="96" r="5" />
          <circle className="pillar-visual__node pillar-visual__node--muted" cx="154" cy="77" r="5" />
          <circle className="pillar-visual__node" cx="230" cy="112" r="5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="pillar-visual pillar-visual--growth" aria-hidden="true">
      <svg viewBox="0 0 320 190" focusable="false">
        <path className="pillar-visual__muted" d="M34 154h72V82" />
        <path className="pillar-visual__route" d="M34 154h72V82h72V43m-72 39h108v72m-36-72h100" pathLength="1" />
        <circle className="pillar-visual__node" cx="106" cy="82" r="6" />
        <circle className="pillar-visual__node pillar-visual__node--muted" cx="178" cy="43" r="5" />
        <circle className="pillar-visual__node" cx="214" cy="154" r="5" />
        <circle className="pillar-visual__node" cx="278" cy="82" r="6" />
      </svg>
    </div>
  );
}
