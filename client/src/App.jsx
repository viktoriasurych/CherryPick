import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import HomePage from './pages/HomePage'; 
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import ProjectCreatePage from './pages/projects/ProjectCreatePage'; 
import ProjectEditPage from './pages/projects/ProjectEditPage';
import StatsPage from './pages/stats/StatsPage';

import CollectionsPage from './pages/collections/CollectionsPage';
import CollectionDetailsPage from './pages/collections/CollectionDetailsPage';
import CollectionEditPage from './pages/collections/CollectionEditPage';
import SavedCollectionsPage from './pages/collections/SavedCollectionsPage';

import ProfilePage from './pages/profile/ProfilePage';
import ProfileEditPage from './pages/profile/ProfileEditPage';
import StickyNotesPage from './pages/notes/StickyNotesPage';

import SessionPage from './pages/session/SessionPage'; 

import ProtectedRoute from './components/shared/ProtectedRoute'; 
import Layout from './components/layouts/Layout';

import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
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
      <Route 
        path="/user/:id"
        element={
            <Layout>
                <ProfilePage />
            </Layout>
        } 
      />

      <Route 
        path="/collections/:id"
        element={
            <Layout>
                <CollectionDetailsPage />
            </Layout>
        } 
      />

      <Route 
        path="/session"
        element={
            <ProtectedRoute>
              <Layout><SessionPage /></Layout>
                
            </ProtectedRoute>
        } 
      />

      <Route 
        path="/projects/:id/session" 
        element={
            <ProtectedRoute>
                 <Layout><SessionPage /></Layout>
            </ProtectedRoute>
        } 
      />

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

<Route path="*" element={<NotFoundPage />} />
      
    </Routes>
  );
}

export default App;