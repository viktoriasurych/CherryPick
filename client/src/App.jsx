import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProjectsPage from './pages/ProjectsPage';
import ProtectedRoute from './components/ProtectedRoute'; // <--- Імпорт

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<AuthPage />} />
      
      {/* Захищений маршрут */}
      <Route 
        path="/gallery" 
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;