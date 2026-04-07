import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { RequireAuth } from './routes/RequireAuth';

const TodosPage = lazy(async () => {
  const m = await import('./pages/TodosPage');
  return { default: m.TodosPage };
});
const AccountPage = lazy(async () => {
  const m = await import('./pages/AccountPage');
  return { default: m.AccountPage };
});
const NotesPage = lazy(async () => {
  const m = await import('./pages/NotesPage');
  return { default: m.NotesPage };
});
const ProfilePage = lazy(async () => {
  const m = await import('./pages/ProfilePage');
  return { default: m.ProfilePage };
});
const SearchPage = lazy(async () => {
  const m = await import('./pages/SearchPage');
  return { default: m.SearchPage };
});

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="app" element={<TodosPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="search" element={<SearchPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
