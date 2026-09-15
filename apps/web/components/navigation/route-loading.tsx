export function RouteLoading() {
  return (
    <div className="route-loading" aria-busy="true">
      <span className="route-loading__bar" aria-hidden="true" />
      <section className="route-loading__hero" aria-hidden="true">
        <div className="container-wide route-loading__hero-grid">
          <div className="route-loading__copy">
            <span className="route-loading__line route-loading__line--eyebrow" />
            <span className="route-loading__line route-loading__line--title" />
            <span className="route-loading__line route-loading__line--title route-loading__line--short" />
            <span className="route-loading__line route-loading__line--body" />
            <span className="route-loading__line route-loading__line--body route-loading__line--short" />
          </div>
          <span className="route-loading__media" />
        </div>
      </section>
      <section className="route-loading__content" aria-hidden="true">
        <div className="container-wide route-loading__cards">
          <span /><span /><span />
        </div>
      </section>
    </div>
  );
}
