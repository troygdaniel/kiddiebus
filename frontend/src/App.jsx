import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegisterChoice from './pages/RegisterChoice';
import RegisterParent from './pages/RegisterParent';
import RegisterOperator from './pages/RegisterOperator';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import RouteForm from './pages/RouteForm';
import Buses from './pages/Buses';
import Schools from './pages/Schools';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import AddChild from './pages/AddChild';
import CheckIn from './pages/CheckIn';
import Messages from './pages/Messages';
import SendNotification from './pages/SendNotification';
import TrackBus from './pages/TrackBus';
import Profile from './pages/Profile';

import './App.css';

function App() {
  const { initialize, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Kiddie Bus...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterChoice />}
        />
        <Route
          path="/register/parent"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterParent />}
        />
        <Route
          path="/register/operator"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterOperator />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Operator Routes */}
          <Route
            path="routes"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <RoutesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="routes/new"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <RouteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="routes/:id"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <RouteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="routes/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <RouteForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="buses"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <Buses />
              </ProtectedRoute>
            }
          />

          <Route
            path="schools"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <Schools />
              </ProtectedRoute>
            }
          />

          <Route
            path="students"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="students/new"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <StudentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="students/:id"
            element={
              <ProtectedRoute>
                <StudentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="students/:id/edit"
            element={
              <ProtectedRoute>
                <StudentForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="checkin"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <CheckIn />
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="my-children"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-children/add"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <AddChild />
              </ProtectedRoute>
            }
          />

          <Route
            path="track"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <TrackBus />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route path="messages" element={<Messages />} />
          <Route
            path="messages/new"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <SendNotification />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
