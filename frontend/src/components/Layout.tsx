import type { ReactNode } from 'react'

interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode
  main: ReactNode
  footer: ReactNode
}

export function Layout({ header, sidebar, main, footer }: LayoutProps) {
  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      {header}

      {/* Body: sidebar + main */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        {/* Sidebar */}
        <aside
          className="shrink-0 overflow-y-auto border-r border-border-subtle p-4"
          style={{
            width: '300px',
            background: 'var(--bg-secondary)',
          }}
        >
          {sidebar}
        </aside>

        {/* Main visualization area */}
        <main
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
          style={{ minWidth: 0 }}
        >
          {main}
        </main>
      </div>

      {/* Footer */}
      {footer}
    </div>
  )
}
