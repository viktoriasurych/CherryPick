import { Routes, Route, Navigate } from 'react-router-dom'; // 👈 ДОДАЛИ Navigate
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
  const { user } = useAuth(); // Дістаємо юзера

  return (
    <Routes>

      {/* 👇 ГОЛОВНА: Якщо є юзер -> кидаємо в Проєкти, якщо ні -> показуємо Лендінг */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/projects" replace /> : <HomePage />} 
      />

      {/* 👇 АВТОРИЗАЦІЯ: Якщо є юзер -> кидаємо в Проєкти */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/projects" replace /> : <AuthPage />} 
      />
      
      {/* ❌ ТУТ БУЛИ ДУБЛІКАТИ РОУТІВ, Я ЇХ ПРИБРАВ.
          Ми вже оголосили "/" та "/auth" вище з логікою перенаправлення.
      */}

      {/* ПРОФІЛЬ КОРИСТУВАЧА */}
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

      {/* 👇 НОВИЙ РОУТ: РЕДАГУВАННЯ */}
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
        path="/collections/:id"
        element={
            <ProtectedRoute>
                <Layout>
                    <CollectionDetailsPage />
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

      {/* СТАТИСТИКА */}
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