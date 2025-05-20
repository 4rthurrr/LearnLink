import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileEditPage from '../pages/ProfileEditPage';
import PostDetailPage from '../pages/PostDetailPage';
import CreatePostPage from '../pages/CreatePostPage';
import EditPostPage from '../pages/EditPostPage';
import LearningPlanPage from '../pages/LearningPlanPage';
import CreateLearningPlanPage from '../pages/CreateLearningPlanPage';
import NotificationsPage from '../pages/NotificationsPage';
import AnalyticsDashboardPage from '../pages/AnalyticsDashboardPage';
import SearchPage from '../pages/SearchPage';
import NotFoundPage from '../pages/NotFoundPage';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import OAuth2RedirectHandler from '../components/auth/OAuth2RedirectHandler';

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/" /> : <LoginPage signup={true} />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<ProtectedRoute component={HomePage} />} />
        <Route path="profile/edit" element={<ProtectedRoute component={ProfileEditPage} />} />
        <Route path="profile/:userId" element={<ProtectedRoute component={ProfilePage} />} />
        <Route path="post/:postId" element={<ProtectedRoute component={PostDetailPage} />} />
        <Route path="create-post" element={<ProtectedRoute component={CreatePostPage} />} />
        <Route path="edit-post/:postId" element={<ProtectedRoute component={EditPostPage} />} />
        <Route path="learning-plan/:planId" element={<ProtectedRoute component={LearningPlanPage} />} />
        <Route path="learning-plan/:planId/edit" element={<ProtectedRoute component={CreateLearningPlanPage} />} />
        <Route path="create-learning-plan" element={<ProtectedRoute component={CreateLearningPlanPage} />} />
        <Route path="notifications" element={<ProtectedRoute component={NotificationsPage} />} />
        <Route path="analytics" element={<ProtectedRoute component={AnalyticsDashboardPage} />} />
        <Route path="search" element={<ProtectedRoute component={SearchPage} />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
