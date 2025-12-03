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

  // while we are waiting for the auth state, render nothing (or a loader)
  if (!checked) {
    return null;
  }

  if (!authed) {
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Routes>
        {/* Protected app routes (layout + inner pages) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppPage />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path=":uid/dashboard" element={<DashboardPage />} />
          <Route path=":uid/schedule" element={<SchedulePage />} />
          <Route path=":uid/people" element={<PeoplePage />} />
          <Route path=":uid/analytics" element={<AnalyticsPage />} />
          <Route path=":uid/settings" element={<SettingsPage />} />
          <Route path=":uid/ai-chat" element={<AIChatPage />} />
        </Route>

        {/* public auth routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* appointment: require auth in this example */}
        <Route path=":uid/appointment" element={<AppointmentPage />} />

        {/* explicit not-found page */}
        <Route path="/not-found" element={<NotFoundPage />} />

        {/* catch-all -> redirect to not-found */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </>
  );
}

export default App;
