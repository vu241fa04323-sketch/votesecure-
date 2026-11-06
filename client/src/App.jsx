import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Guard
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import VoterLayout from './layouts/VoterLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import VoterManagement from './pages/admin/VoterManagement';
import AddVoter from './pages/admin/AddVoter';
import EditVoter from './pages/admin/EditVoter';
import ElectionManagement from './pages/admin/ElectionManagement';
import CreateElection from './pages/admin/CreateElection';
import EditElection from './pages/admin/EditElection';
import PostManagement from './pages/admin/PostManagement';
import CandidateManagement from './pages/admin/CandidateManagement';
import AddCandidate from './pages/admin/AddCandidate';
import ResultsDashboard from './pages/admin/ResultsDashboard';
import AdminProfile from './pages/admin/AdminProfile';

// Voter Pages
import VoterLogin from './pages/voter/VoterLogin';
import VoterDashboard from './pages/voter/VoterDashboard';
import VoterElections from './pages/voter/VoterElections';
import VotingBooth from './pages/voter/VotingBooth';
import VotingHistory from './pages/voter/VotingHistory';
import VoterResults from './pages/voter/VoterResults';
import VoterProfile from './pages/voter/VoterProfile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public Portal Landing & Logins */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/voter/login" element={<VoterLogin />} />
          <Route path="/login" element={<Navigate to="/voter/login" replace />} />

          {/* Admin Management Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="voters" element={<VoterManagement />} />
            <Route path="voters/new" element={<AddVoter />} />
            <Route path="voters/:id/edit" element={<EditVoter />} />
            <Route path="elections" element={<ElectionManagement />} />
            <Route path="elections/new" element={<CreateElection />} />
            <Route path="elections/:id/edit" element={<EditElection />} />
            <Route path="posts" element={<PostManagement />} />
            <Route path="candidates" element={<CandidateManagement />} />
            <Route path="candidates/new" element={<AddCandidate />} />
            <Route path="results" element={<ResultsDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Voter Portal Routes */}
          <Route
            path="/voter"
            element={
              <ProtectedRoute requiredRole="voter">
                <VoterLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/voter/dashboard" replace />} />
            <Route path="dashboard" element={<VoterDashboard />} />
            <Route path="elections" element={<VoterElections />} />
            <Route path="vote/:electionId" element={<VotingBooth />} />
            <Route path="history" element={<VotingHistory />} />
            <Route path="results" element={<VoterResults />} />
            <Route path="profile" element={<VoterProfile />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
