import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TrendingPage from './pages/TrendingPage'
import CategoriesPage from './pages/CategoriesPage'
import ClassifiedsPage from './pages/ClassifiedsPage'
import ProfilesPage from './pages/ProfilesPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/classifieds" element={<ClassifiedsPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  )
}

export default App
