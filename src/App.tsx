import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SellerProvider } from './store/SellerContext';
import { AuthProvider } from './store/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { Overview } from './pages/Overview';
import { Setup } from './pages/Setup';
import { Credentials } from './pages/Credentials';
import { Import } from './pages/Import';
import { Pipeline } from './pages/Pipeline';
import { Dashboard } from './pages/Dashboard';
import { Insight } from './pages/Insight';

function App() {
  return (
    <AuthProvider>
      <SellerProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/seller/setup" element={<Setup />} />
              <Route path="/seller/credentials" element={<Credentials />} />
              <Route path="/seller/import" element={<Import />} />
              <Route path="/seller/dashboard" element={<Dashboard />} />
              <Route path="/seller/insights" element={<Insight />} />
              <Route path="/admin/pipeline" element={<Pipeline />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SellerProvider>
    </AuthProvider>
  );
}

export default App;
