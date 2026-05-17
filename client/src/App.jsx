import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { PageLoader } from './components/ui/Spinner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Communities from './pages/Communities';
import Proposals from './pages/Proposals';
import NewProposal from './pages/NewProposal';
import ProposalDetail from './pages/ProposalDetail';
import Treasury from './pages/Treasury';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/communities" element={<PrivateRoute><Communities /></PrivateRoute>} />
          <Route path="/proposals/new" element={<PrivateRoute><NewProposal /></PrivateRoute>} />
          <Route path="/proposals/:id" element={<PrivateRoute><ProposalDetail /></PrivateRoute>} />
          <Route path="/proposals" element={<PrivateRoute><Proposals /></PrivateRoute>} />
          <Route path="/treasury" element={<PrivateRoute><Treasury /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
