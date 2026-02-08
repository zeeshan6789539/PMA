import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout, AuthLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthProvider } from '@/context/auth-context';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { ChangePasswordPage } from '@/pages/change-password';
import { UsersPage } from '@/pages/users';
import { RolesPage } from '@/pages/roles';
import { PermissionsPage } from '@/pages/permissions';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/roles" element={<RolesPage />} />
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
