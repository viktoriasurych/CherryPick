import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
// 👇 1. ДОДАЙ ІМПОРТИ НОВИХ СТОРІНОК
import ProjectCreatePage from './pages/ProjectCreatePage'; 
import ProjectEditPage from './pages/ProjectEditPage';

import ProtectedRoute from './components/ProtectedRoute'; 
import SessionPage from './pages/SessionPage';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<AuthPage />} />
      
      {/* Список проєктів */}
      <Route 
        path="/projects" 
        element={
            <ProtectedRoute>
                <Layout>
                    <ProjectsPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* 👇 2. СТВОРЕННЯ (Ставимо ПЕРЕД :id, щоб не плуталось) */}
      <Route 
        path="/projects/new" 
        element={
            <ProtectedRoute>
                <Layout>
                    <ProjectCreatePage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* 👇 3. РЕДАГУВАННЯ */}
      <Route 
        path="/projects/:id/edit" 
        element={
            <ProtectedRoute>
                <Layout>
                    <ProjectEditPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* Деталі одного проєкту */}
      <Route 
        path="/projects/:id" 
        element={
            <ProtectedRoute>
                <Layout>
                    <ProjectDetailsPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* Сесія малювання (без Layout, як і було) */}
      <Route 
        path="/projects/:id/session" 
        element={
            <ProtectedRoute>
                 <SessionPage />
            </ProtectedRoute>
        } 
      />
     
    </Routes>
  );
}

export default App;