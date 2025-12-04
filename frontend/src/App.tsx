// App.tsx - React 애플리케이션의 기본 라우팅 및 레이아웃 구성
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { FormListPage } from './pages/FormListPage'
import { FormBuilderPage } from './pages/FormBuilderPage'

export const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/forms" replace />} />
        <Route path="/forms" element={<FormListPage />} />
        <Route path="/forms/new" element={<FormBuilderPage />} />
      </Routes>
    </AppLayout>
  )
}


