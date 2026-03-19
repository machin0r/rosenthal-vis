export function Header() {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b border-border-subtle animate-fade-in-up stagger-1"
      style={{ opacity: 0 }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo mark */}
        <div
          className="shrink-0 w-8 h-8 rounded flex items-center justify-center"
          style={{ background: '#F5F0EB', border: '1px solid #E0D8D0' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="10" rx="6" ry="3.5" stroke="#C05030" strokeWidth="1.2" />
            <line x1="9" y1="1" x2="9" y2="6.5" stroke="#C05030" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="9" cy="10" r="1.5" fill="#C05030" />
          </svg>
        </div>

        <div className="min-w-0">
          <h1
            className="font-sans font-semibold text-text-primary truncate"
            style={{ fontSize: '15px', letterSpacing: '0.02em' }}
          >
            LPBF Melt Pool Explorer
          </h1>
          <p className="text-text-muted truncate" style={{ fontSize: '11px' }}>
            Rosenthal moving point-source · analytical solution
          </p>
        </div>
      </div>
    </header>
  )
}
