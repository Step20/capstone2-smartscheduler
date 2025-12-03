import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppPage from "./pages/AppPage";
import DashboardPage from "./pages/DashboardPage";
import SchedulePage from "./pages/SchedulePage";
import PeoplePage from "./pages/PeoplePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AppointmentPage from "./pages/AppointmentPage";
import NotFoundPage from "./pages/NotFoundPage";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AIChatPage from "./pages/AIChatPage";

function isAuthenticated() {
  try {
    return !!auth.currentUser;
  } catch {
    return false;
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setChecked(true);
    });
    return () => unsub();
  }, []);

  if (!checked) return null;

  if (!authed) {
    // not authenticated -> go to signin
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Root -> go to signin (startup/no uid) */}
      <Route path="/" element={<Navigate to="/signin" replace />} />

      {/* Public auth routes */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Explicit no-uid tries -> show not-found */}
      <Route path="/dashboard" element={<Navigate to="/not-found" replace />} />
      <Route path="/schedule" element={<Navigate to="/not-found" replace />} />
      <Route path="/people" element={<Navigate to="/not-found" replace />} />
      <Route path="/analytics" element={<Navigate to="/not-found" replace />} />
      <Route path="/settings" element={<Navigate to="/not-found" replace />} />
      <Route path="/ai-chat" element={<Navigate to="/not-found" replace />} />

      {/* Protected routes under /:uid */}
      <Route
        path="/:uid"
        element={
          <PrivateRoute>
            <AppPage />
          </PrivateRoute>
        }
      >
        {/* default to dashboard for /:uid */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="ai-chat" element={<AIChatPage />} />
      </Route>

      <Route path=":uid/appointment" element={<AppointmentPage />} />

      {/* not-found page */}
      <Route path="/not-found" element={<NotFoundPage />} />

      {/* fallback -> goto signin */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

export default App;
