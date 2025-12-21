import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import HomePage from './pages/HomePage'; 
import AuthPage from './pages/AuthPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectCreatePage from './pages/ProjectCreatePage'; 
import ProjectEditPage from './pages/ProjectEditPage';
import StatsPage from './pages/StatsPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailsPage from './pages/CollectionDetailsPage';
import CollectionEditPage from './pages/CollectionEditPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import SessionPage from './pages/SessionPage';
import Layout from './components/Layout';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* --- ПУБЛІЧНІ РОУТИ (Доступні всім) --- */}

      {/* Головна: Якщо залогінений - в проєкти, якщо ні - лендінг */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/projects" replace /> : <HomePage />} 
      />

      {/* Авторизація */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/projects" replace /> : <AuthPage />} 
      />

      {/* 👇 ВАЖЛИВО: Публічний перегляд профілю (без ProtectedRoute) */}
      <Route 
        path="/user/:id"
        element={
            <Layout> {/* Layout залишаємо, щоб була шапка/навігація */}
                <ProfilePage />
            </Layout>
        } 
      />

      {/* 👇 ВАЖЛИВО: Публічний перегляд колекції (без ProtectedRoute) */}
      <Route 
        path="/collections/:id"
        element={
            <Layout>
                <CollectionDetailsPage />
            </Layout>
        } 
      />


      {/* --- ПРИВАТНІ РОУТИ (Тільки для своїх) --- */}

      {/* "Мій профіль" (тут можуть бути особисті дані, тому protected) */}
      <Route 
        path="/profile"
        element={
            <ProtectedRoute>
                <Layout>
                    <ProfilePage /> {/* Або переадресація на /user/my-id */}
                </Layout>
            </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile/edit"
        element={
            <ProtectedRoute>
                <Layout>
                    <ProfileEditPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

      {/* Проєкти - це робочий простір, він закритий */}
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

      {/* Список своїх колекцій - закритий */}
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

      {/* Редагування колекції - закрите */}
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

      <Route 
        path="/stats"
        element={
            <ProtectedRoute>
                <Layout>
                    <StatsPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

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