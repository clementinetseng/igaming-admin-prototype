// src/router.tsx
import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/shell/AppLayout'
import NotFound from '@/pages/NotFound'

// Lazy stubs for now; real pages come in later tasks
const CampaignListStub = () => <h1 className="text-2xl font-semibold">Campaigns (stub)</h1>

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/campaigns" replace /> },
      { path: 'campaigns', element: <CampaignListStub /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
