
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import AppLayout from "./components/layout/appLayout";
import HomePage from "./features/feed/pages/homePage";
import GroupsPage from "./features/groups/pages/groupsPage";
import GroupPage from "./features/groups/pages/groupPage";
import AuthPage from "./features/auth/pages/authPage";
import InvitationPage from "./features/invitations/pages/invitationPage";
import ProfilePage from "./features/profile/pages/profilePage";


import { ThemeProvider } from "./features/theme/themeProvider";
import { AuthProvider } from "./features/auth/authProvider";
import ProtectedRoute from "./features/auth/components/protectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/invite/:token" element={<InvitationPage />} />
            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Outlet />
                  </AppLayout>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/:groupId" element={<GroupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
