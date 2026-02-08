import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout, AuthLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthProvider } from '@/context/auth-context';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { ChangePasswordPage } from '@/pages/change-password';
import { ProfilePage } from '@/pages/profile';
import { UsersPage } from '@/pages/users';
import { RolesPage } from '@/pages/roles';
import { RoleDetailPage } from '@/pages/role-detail';
import { PermissionsPage } from '@/pages/permissions';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster position="top-right" />
        <AuthProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/roles" element={<RolesPage />} />
                <Route path="/roles/:id" element={<RoleDetailPage />} />
                <Route path="/permissions" element={<PermissionsPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
