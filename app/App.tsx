import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import IndexPage from './pages/IndexPage'
import MeetingsPage from './pages/MeetingsPage'
import LoginPage from './pages/LoginPage'
import MeetingDetailPage from './pages/MeetingDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/meetings/:id" element={<MeetingDetailPage />} />
      </Routes>
    </Layout>
  )
}