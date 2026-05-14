import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout';
import { Card, CardHeader, CardTitle, Badge, Button } from './components/ui';
import { PageLoader } from './components/ui/Spinner';
import { Users, Vote, TrendingUp, Shield, Plus } from 'lucide-react';
import Login from './pages/Login';

const DashboardPreview = () => (
  <Layout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning, Carter</h1>
          <p className="text-dark-400 mt-1">Here is what is happening in your communities.</p>
        </div>
        <Button variant="primary" className="hidden md:flex">
          <Plus size={16} />
          New Proposal
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Communities', value: '3', color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: Vote, label: 'Active Votes', value: '2', color: 'text-gold-400', bg: 'bg-gold-500/10' },
          { icon: TrendingUp, label: 'Proposals', value: '12', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Shield, label: 'Members', value: '47', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-dark-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Proposals</CardTitle>
          <Badge variant="active">2 Active</Badge>
        </CardHeader>
        <div className="space-y-3">
          {[
            { title: 'Raise monthly contribution to KES 1,500', community: 'Mama Mboga Chama', status: 'active', votes: '14/20' },
            { title: 'Emergency loan for Mary Wanjiku', community: 'Mama Mboga Chama', status: 'passed', votes: '18/20' },
            { title: 'Annual general meeting date', community: 'Eastleigh Traders SACCO', status: 'pending', votes: '3/15' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors cursor-pointer">
              <div>
                <p className="text-white font-medium text-sm">{p.title}</p>
                <p className="text-dark-400 text-xs mt-1">{p.community}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <p className="text-dark-400 text-xs">{p.votes} votes</p>
                <Badge variant={p.status}>{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </Layout>
);

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
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPreview />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
