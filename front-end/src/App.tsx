import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout, AuthLayout } from '@/components/layout';
import { AuthProvider } from '@/context/auth-context';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { ChangePasswordPage } from '@/pages/change-password';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
