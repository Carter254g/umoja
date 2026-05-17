import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Vote, TrendingUp, Shield, ArrowRight, Plus, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{
    background: '#111827', border: '1px solid #1e2d45',
    borderRadius: '12px', padding: '20px',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color="#4ade80" />
      </div>
    </div>
    <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '13px', color: '#64748b' }}>{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proposalsRes, communitiesRes] = await Promise.all([
          api.get('/proposals'),
          api.get('/communities/mine'),
        ]);
        const p = proposalsRes.data.proposals || [];
        const c = communitiesRes.data.communities || [];
        setProposals(p);
        setCommunities(c);
        setStats({
          activeProposals: p.filter(x => x.status === 'active').length,
          expiringSoon: p.filter(x => {
            if (!x.deadline) return false;
            const diff = new Date(x.deadline) - new Date();
            return diff > 0 && diff < 86400000;
          }).length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const timeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    return d > 0 ? `${d}d left` : `${h}h left`;
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'white', margin: 0 }}>
              {greeting}, {user?.name} 👋
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
              Here is what is happening in your communities.
            </p>
          </div>
          <Button onClick={() => navigate('/proposals/new')}>
            <Plus size={15} style={{ marginRight: '6px' }} /> New Proposal
          </Button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <StatCard icon={Users} label="My Communities" value={loading ? '...' : communities.length} />
          <StatCard icon={Vote} label="Active Votes" value={loading ? '...' : stats?.activeProposals || 0} />
          <StatCard icon={TrendingUp} label="Total Proposals" value={loading ? '...' : proposals.length} />
          <StatCard icon={Shield} label="Expiring Soon" value={loading ? '...' : stats?.expiringSoon || 0} />
        </div>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

          {/* Recent Proposals */}
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>Recent Proposals</h2>
              <Link to="/proposals" style={{ color: '#4ade80', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            {loading ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>Loading...</p>
            ) : proposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Vote size={32} color="#1e2d45" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#64748b', fontSize: '14px' }}>No proposals yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {proposals.slice(0, 5).map(p => (
                  <Link key={p.id} to={`/proposals/${p.id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '10px',
                    background: '#0d1424', border: '1px solid #1e2d45',
                    transition: 'border-color 0.15s',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{p.community_name}</span>
                        {p.deadline && p.status === 'active' && (
                          <>
                            <span style={{ color: '#1e2d45' }}>•</span>
                            <span style={{ color: '#d97706', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} />{timeLeft(p.deadline)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px', flexShrink: 0 }}>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>{(p.yes_votes || 0) + (p.no_votes || 0)} votes</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: p.status === 'active' ? 'rgba(22,163,74,0.15)' : 'rgba(100,116,139,0.15)',
                        color: p.status === 'active' ? '#4ade80' : '#94a3b8',
                        border: `1px solid ${p.status === 'active' ? 'rgba(22,163,74,0.3)' : 'rgba(100,116,139,0.2)'}`,
                      }}>
                        {p.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* My Communities */}
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>My Communities</h2>
                <Link to="/communities" style={{ color: '#4ade80', fontSize: '13px' }}>View all</Link>
              </div>
              {communities.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No communities yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {communities.slice(0, 4).map(c => (
                    <Link key={c.id} to={`/communities/${c.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px', borderRadius: '10px', background: '#0d1424',
                      border: '1px solid #1e2d45',
                    }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '12px',
                      }}>
                        {c.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                        <p style={{ color: '#64748b', fontSize: '11px', margin: 0, textTransform: 'capitalize' }}>{c.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Blockchain card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(22,163,74,0.1), rgba(13,20,36,0.8))',
              border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color="#4ade80" />
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, margin: 0 }}>Secure by design</p>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>Powered by blockchain</p>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                Every vote and decision is recorded permanently on the blockchain. No one can alter the records — not even us.
              </p>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
