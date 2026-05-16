import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import api from '../utils/api';
import { Plus, Clock, Users, CheckCircle } from 'lucide-react';

const statusColor = { active: 'green', passed: 'blue', failed: 'red', pending: 'default' };

const Proposals = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/proposals')
      .then(res => setProposals(res.data.proposals || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter);

  const timeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    return d > 0 ? `${d}d left` : `${h}h left`;
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Proposals</h1>
            <p className="text-dark-300 text-sm mt-1">All proposals across your communities</p>
          </div>
          <Button onClick={() => navigate('/proposals/new')} className="flex items-center gap-2">
            <Plus size={16} /> New Proposal
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'passed', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle size={40} className="mx-auto text-dark-500 mb-3" />
            <p className="text-dark-300 text-sm">No proposals found.</p>
            <Button className="mt-4" onClick={() => navigate('/proposals/new')}>
              Create First Proposal
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <Card
                key={p.id}
                className="p-4 hover:border-primary-500/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/proposals/${p.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold text-sm">{p.title}</h3>
                    <Badge variant={statusColor[p.status] || 'default'}>{p.status}</Badge>
                  </div>
                  <p className="text-dark-400 text-xs mt-1">{p.community_name}</p>
                  {p.description && (
                    <p className="text-dark-400 text-xs mt-1 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-dark-400 text-xs flex items-center gap-1">
                      <Clock size={11} />{timeLeft(p.deadline)}
                    </span>
                    <span className="text-dark-400 text-xs flex items-center gap-1">
                      <Users size={11} />{p.vote_count || 0} votes
                    </span>
                    <span className="text-dark-400 text-xs capitalize">{p.vote_type}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Proposals;
