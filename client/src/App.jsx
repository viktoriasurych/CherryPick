import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import Layout from './components/Layout';// <--- Імпорт

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<AuthPage />} />
      
    <Route 
    path="/projects" 
    element={
        <ProtectedRoute>
            <Layout> {/* <--- ТУТ */}
                      <ProjectsPage />
                  </Layout> {/* <--- І ТУТ */}
        </ProtectedRoute>
    } 
    />
    <Route 
    path="/projects/:id" 
    element={
        <ProtectedRoute>
            <Layout> {/* <--- ТУТ ТЕЖ */}
                      <ProjectDetailsPage />
                  </Layout>
        </ProtectedRoute>
    } 
    />
     
      
    </Routes>
  );
}

export default App;