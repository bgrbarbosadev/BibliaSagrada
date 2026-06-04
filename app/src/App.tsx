import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import VLibras from 'react-vlibras'
import ReaderPage from './pages/ReaderPage'

export default function App() {
  return (
    <>
      <VLibras position="bottom-right" avatar="icaro" />
      <BrowserRouter>
        <Routes>
          <Route path="/ler/:version/:book/:chapter" element={<ReaderPage />} />
          <Route path="*" element={<Navigate to="/ler/ARC/GEN/1" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
