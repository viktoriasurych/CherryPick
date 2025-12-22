import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import HomePage from './pages/HomePage'; 
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectCreatePage from './pages/ProjectCreatePage'; 
import ProjectEditPage from './pages/ProjectEditPage';
import StatsPage from './pages/StatsPage';

import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailsPage from './pages/CollectionDetailsPage';
import CollectionEditPage from './pages/CollectionEditPage';
import SavedCollectionsPage from './pages/SavedCollectionsPage';

import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import StickyNotesPage from './pages/StickyNotesPage';

// 👇 Твоя єдина сторінка для таймера
import SessionPage from './pages/SessionPage'; 

import ProtectedRoute from './components/ProtectedRoute'; 
import Layout from './components/Layout';

function App() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* --- ПУБЛІЧНІ РОУТИ --- */}

      <Route 
        path="/" 
        element={user ? <Navigate to="/projects" replace /> : <HomePage />} 
      />

      <Route 
        path="/auth" 
        element={user ? <Navigate to="/projects" replace /> : <AuthPage />} 
      />

      <Route 
        path="/forgot-password" 
        element={user ? <Navigate to="/projects" replace /> : <ForgotPasswordPage />} 
      />
      
      <Route 
        path="/reset-password" 
        element={user ? <Navigate to="/projects" replace /> : <ResetPasswordPage />} 
      />

      {/* Публічний профіль (доступний без входу, але в Layout) */}
      <Route 
        path="/user/:id"
        element={
            <Layout>
                <ProfilePage />
            </Layout>
        } 
      />

      {/* Публічна колекція */}
      <Route 
        path="/collections/:id"
        element={
            <Layout>
                <CollectionDetailsPage />
            </Layout>
        } 
      />


      {/* --- ПРИВАТНІ РОУТИ --- */}

      {/* 👇 1. ГЛОБАЛЬНИЙ СЕАНС (З меню зліва) */}
      {/* Без <Layout>, бо там свій повноекранний дизайн */}
      <Route 
        path="/session"
        element={
            <ProtectedRoute>
              <Layout><SessionPage /></Layout>
                
            </ProtectedRoute>
        } 
      />

      {/* 👇 2. СЕАНС КОНКРЕТНОЇ КАРТИНИ (Старт з проєкту) */}
      {/* Теж веде на SessionPage, але передає ID в URL */}
      <Route 
        path="/projects/:id/session" 
        element={
            <ProtectedRoute>
                 <Layout><SessionPage /></Layout>
            </ProtectedRoute>
        } 
      />

      {/* --- Інші сторінки в Layout --- */}

      <Route 
        path="/notes"
        element={
            <ProtectedRoute>
                <Layout>
                    <StickyNotesPage />
                </Layout>
            </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile"
        element={
            <ProtectedRoute>
                <Layout>
                    <ProfilePage />
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

      {/* Проєкти */}
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

      {/* Колекції */}
      <Route 
        path="/saved"
        element={
            <ProtectedRoute>
                <Layout>
                    <SavedCollectionsPage />
                </Layout>
            </ProtectedRoute>
        } 
      />

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
      
    </Routes>
  );
}

export default App;