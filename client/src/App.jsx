import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectCreatePage from './pages/ProjectCreatePage'; 
import ProjectEditPage from './pages/ProjectEditPage';

// 👇 ВИПРАВЛЕНІ ІМПОРТИ
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailsPage from './pages/CollectionDetailsPage';
import CollectionEditPage from './pages/CollectionEditPage';

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

      {/* Створення проєкту */}
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

      {/* Редагування проєкту */}
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

      {/* Деталі проєкту */}
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

      {/* --- КОЛЕКЦІЇ --- */}
      
      {/* Список всіх колекцій */}
      <Route 
        path="/collections"
        element={
            <ProtectedRoute>
                <Layout>
                    <CollectionsPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* Перегляд однієї колекції */}
      <Route 
        path="/collections/:id"
        element={
            <ProtectedRoute>
                <Layout>
                    <CollectionDetailsPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* Редагування колекції (додали цей роут!) */}
      <Route 
        path="/collections/:id/edit"
        element={
            <ProtectedRoute>
                <Layout>
                    <CollectionEditPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* Сесія малювання */}
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