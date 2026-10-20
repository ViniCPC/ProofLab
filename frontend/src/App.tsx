import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingLayout } from '@/layouts/LandingLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const AppRoutes = lazy(() => import('@/layouts/AppRoutes'))

function PageFallback() {
  return (
    <div className="flex h-48 items-center justify-center">
      <span className="size-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return <BrowserRouter><Suspense fallback={<PageFallback />}><Routes><Route element={<LandingLayout />}><Route index element={<HomePage />} /></Route><Route path="/*" element={<AppRoutes />} /></Routes></Suspense></BrowserRouter>
}
