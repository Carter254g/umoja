import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Button, Card, CardHeader, CardTitle, Badge, Avatar, Spinner, PageLoader } from './components/ui';
import { Users, Vote, TrendingUp, Shield } from 'lucide-react';

const ComponentPreview = () => (
  <div className="min-h-screen bg-dark-950 p-8">
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-glow-green">
          <span className="text-white font-bold text-3xl">U</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Umoja</h1>
        <p className="text-dark-400">Decentralized Community Governance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="gold">Gold</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Badge variant="active">Active</Badge>
          <Badge variant="passed">Passed</Badge>
          <Badge variant="failed">Failed</Badge>
          <Badge variant="pending">Pending</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="gold">Gold</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatars</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4">
          <Avatar name="Carter Obara" size="2xl" />
          <Avatar name="Mary Wanjiku" size="xl" />
          <Avatar name="John Kamau" size="lg" />
          <Avatar name="Jane Mwangi" size="md" />
          <Avatar name="Peter Njoroge" size="sm" />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Communities', value: '1,247', color: 'text-primary-400' },
          { icon: Vote, label: 'Active Votes', value: '89', color: 'text-gold-400' },
          { icon: TrendingUp, label: 'Proposals', value: '3,421', color: 'text-blue-400' },
          { icon: Shield, label: 'Members', value: '28,934', color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} hover className="text-center">
            <Icon size={24} className={`${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-dark-400 text-sm">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Spinner size="lg" />
      </div>
    </div>
  </div>
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
          <Route path="/preview" element={<ComponentPreview />} />
          <Route path="/login" element={<div className="min-h-screen bg-dark-950 flex items-center justify-center"><p className="text-white">Login coming in Push 18</p></div>} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <div className="min-h-screen bg-dark-950 flex items-center justify-center"><p className="text-white">Dashboard coming soon</p></div>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/preview" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
