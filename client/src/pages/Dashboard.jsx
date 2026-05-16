import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout';
import { Card, CardHeader, CardTitle, Badge, Button } from '../components/ui';
import Avatar from '../components/ui/Avatar';
import api from '../utils/api';
import {
  Users, Vote, TrendingUp, Shield, Plus,
  ArrowRight, Clock, CheckCircle, XCircle
} from 'lucide-react';

const statusConfig = {
  active: { variant: 'active', icon: Clock, label: 'Active' },
  passed: { variant: 'passed', icon: CheckCircle, label: 'Passed' },
  failed: { variant: 'failed', icon: XCircle, label: 'Failed' },
  pending: { variant: 'pending', icon: Clock, label: 'Pending' },
  cancelled: { variant: 'default', icon: XCircle, label: 'Cancelled' },
};

const StatCard = ({ icon: Icon, label, value, color, bg, trend }) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
      {trend && (
        <span className="text-xs text-primary-400 font-medium">{trend}</span>
      )}
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-dark-400 text-sm mt-1">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, proposalsRes, communitiesRes] = await Promise.all([
          api.get('/notifications/stats'),
          api.get('/proposals'),
          api.get('/communities/mine'),
        ]);
        setStats(statsRes.data);
        setProposals(proposalsRes.data.proposals?.slice(0, 5) || []);
        setCommunities(communitiesRes.data.communities?.slice(0, 3) || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTimeLeft = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d left`;
    return `${hours}h left`;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-dark-400 mt-1">
              Here is what is happening in your communities.
            </p>
          </div>
          <Link to="/proposals/new">
            <Button variant="primary" className="hidden md:flex">
              <Plus size={16} />
              New Proposal
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="My Communities"
            value={loading ? '...' : communities.length}
            color="text-primary-400"
            bg="bg-primary-500/10"
          />
          <StatCard
            icon={Vote}
            label="Active Votes"
            value={loading ? '...' : stats?.activeProposals || 0}
            color="text-gold-400"
            bg="bg-gold-500/10"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Proposals"
            value={loading ? '...' : proposals.length}
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard
            icon={Shield}
            label="Expiring Soon"
            value={loading ? '...' : stats?.expiringSoon || 0}
            color="text-purple-400"
            bg="bg-purple-500/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Proposals</CardTitle>
                <Link to="/proposals">
                  <Button variant="ghost" size="sm">
                    View all <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardHeader>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-dark-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-12">
                  <Vote size={32} className="text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400 font-medium">No proposals yet</p>
                  <p className="text-dark-500 text-sm mt-1">Create your first proposal to get started</p>
                  <Link to="/proposals/new">
                    <Button variant="outline" size="sm" className="mt-4">
                      Create proposal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {proposals.map((proposal) => {
                    const config = statusConfig[proposal.status] || statusConfig.pending;
                    return (
                      <Link
                        key={proposal.id}
                        to={`/proposals/${proposal.id}`}
                        className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-all duration-200 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate group-hover:text-primary-300 transition-colors">
                            {proposal.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-dark-400 text-xs">{proposal.community_name}</p>
                            {proposal.deadline && proposal.status === 'active' && (
                              <>
                                <span className="text-dark-600">•</span>
                                <p className="text-gold-400 text-xs">{getTimeLeft(proposal.deadline)}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <p className="text-dark-400 text-xs hidden sm:block">
                            {(proposal.yes_votes || 0) + (proposal.no_votes || 0)} votes
                          </p>
                          <Badge variant={config.variant} size="sm">
                            {config.label}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Communities</CardTitle>
                <Link to="/communities">
                  <Button variant="ghost" size="sm">
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardHeader>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-14 bg-dark-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : communities.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={28} className="text-dark-600 mx-auto mb-2" />
                  <p className="text-dark-400 text-sm">No communities yet</p>
                  <Link to="/communities">
                    <Button variant="outline" size="sm" className="mt-3">
                      Join one
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {communities.map((community) => (
                    <Link
                      key={community.id}
                      to={`/communities/${community.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors group"
                    >
                      <Avatar name={community.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate group-hover:text-primary-300 transition-colors">
                          {community.name}
                        </p>
                        <p className="text-dark-400 text-xs capitalize">{community.role}</p>
                      </div>
                      <Badge variant={community.role === 'admin' ? 'gold' : 'default'} size="sm">
                        {community.role}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card className="bg-gradient-to-br from-primary-900/50 to-dark-800/50 border-primary-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Shield size={20} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Secure by design</p>
                  <p className="text-dark-400 text-xs">Powered by blockchain</p>
                </div>
              </div>
              <p className="text-dark-300 text-xs leading-relaxed">
                Every vote and decision is recorded permanently on the blockchain. No one can alter the records — not even us.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
