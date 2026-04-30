// src/components/shell/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Topbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
