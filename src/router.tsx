// src/router.tsx
import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/shell/AppLayout'
import NotFound from '@/pages/NotFound'
import CampaignList from '@/pages/campaigns/CampaignList'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/campaigns" replace /> },
      { path: 'campaigns', element: <CampaignList /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
