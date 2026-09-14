export default function AdminLoading() {
  return (
    <main className="admin-content" aria-busy="true">
      <div className="page-title">
        <div style={{ width: 'min(440px, 100%)' }}>
          <div className="gv-skeleton" style={{ height: '2rem', width: '55%', borderRadius: '.4rem' }} />
          <div className="gv-skeleton" style={{ height: '.9rem', width: '80%', borderRadius: '.3rem', marginTop: '.65rem' }} />
        </div>
      </div>
      <div className="panel" style={{ minHeight: 220 }}>
        <div className="gv-skeleton" style={{ height: '1rem', width: '100%', borderRadius: '.3rem' }} />
        <div className="gv-skeleton" style={{ height: '1rem', width: '84%', borderRadius: '.3rem', marginTop: '.8rem' }} />
        <div className="gv-skeleton" style={{ height: '1rem', width: '92%', borderRadius: '.3rem', marginTop: '.8rem' }} />
      </div>
    </main>
  );
}
