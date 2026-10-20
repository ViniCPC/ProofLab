import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'

const ExploreResearchPage = lazy(() => import('@/pages/ExploreResearchPage'))
const ResearchDetailsPage = lazy(() => import('@/pages/ResearchDetailsPage'))
const CreateResearchPage = lazy(() => import('@/pages/CreateResearchPage'))
const DemoPage = lazy(() => import('@/pages/DemoPage'))

function PageFallback() { return <div className="flex min-h-48 items-center justify-center"><span className="size-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" /></div> }

export default function AppRoutes() {
  return <Suspense fallback={<PageFallback />}><Routes><Route element={<AppShell />}><Route path="explore" element={<ExploreResearchPage />} /><Route path="research/:id" element={<ResearchDetailsPage />} /><Route path="create" element={<CreateResearchPage />} /><Route path="demo" element={<DemoPage />} /></Route></Routes></Suspense>
}
