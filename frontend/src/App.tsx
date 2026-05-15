import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SolanaWalletProvider } from '@/components/wallet/WalletProvider'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ExploreResearchPage = lazy(() => import('@/pages/ExploreResearchPage'))
const ResearchDetailsPage = lazy(() => import('@/pages/ResearchDetailsPage'))
const CreateResearchPage = lazy(() => import('@/pages/CreateResearchPage'))

function PageFallback() {
  return (
    <div className="flex h-48 items-center justify-center">
      <span className="size-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <SolanaWalletProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExploreResearchPage />} />
              <Route path="research/:id" element={<ResearchDetailsPage />} />
              <Route path="create" element={<CreateResearchPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SolanaWalletProvider>
  )
}
