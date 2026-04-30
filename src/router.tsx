// src/router.tsx
import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/shell/AppLayout'
import NotFound from '@/pages/NotFound'
import CampaignList from '@/pages/campaigns/CampaignList'
import CampaignForm from '@/pages/campaigns/CampaignForm'
import CampaignDetail from '@/pages/campaigns/CampaignDetail'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/campaigns" replace /> },
      { path: 'campaigns', element: <CampaignList /> },
      { path: 'campaigns/new', element: <CampaignForm /> },
      { path: 'campaigns/:id/edit', element: <CampaignForm /> },
      { path: 'campaigns/:id', element: <CampaignDetail /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
