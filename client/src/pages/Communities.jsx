import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import api from '../utils/api';
import { Users, Plus, Search, Globe, TrendingUp, ChevronRight } from 'lucide-react';

const Communities = () => {
  const navigate = useNavigate();
  const [myCommunities, setMyCommunities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('mine');
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', quorum_percentage: 51 });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mine, all] = await Promise.all([
        api.get('/communities/mine'),
        api.get('/communities'),
      ]);
      setMyCommunities(mine.data.communities || []);
      setAllCommunities(all.data.communities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      setJoining(id);
      await api.post(`/communities/${id}/join`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return setError('Community name is required');
    try {
      setCreating(true);
      setError('');
      await api.post('/communities', form);
      setShowCreate(false);
      setForm({ name: '', description: '', quorum_percentage: 51 });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  const myIds = new Set(myCommunities.map(c => c.id));
  const filtered = (tab === 'mine' ? myCommunities : allCommunities).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const getRoleBadge = (role) => {
    if (role === 'admin') return <Badge variant="gold">Admin</Badge>;
    if (role === 'committee') return <Badge variant="blue">Committee</Badge>;
    return <Badge variant="default">Member</Badge>;
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Communities</h1>
            <p className="text-dark-300 text-sm mt-1">Manage and discover communities</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus size={16} />
            New Community
          </Button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 text-white placeholder-dark-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('mine')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'mine' ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white'}`}
            >
              My Communities ({myCommunities.length})
            </button>
            <button
              onClick={() => setTab('explore')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'explore' ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white'}`}
            >
              Explore All ({allCommunities.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Users size={40} className="mx-auto text-dark-500 mb-3" />
            <p className="text-dark-300 text-sm">
              {tab === 'mine' ? "You haven't joined any communities yet." : "No communities found."}
            </p>
            {tab === 'mine' && (
              <Button variant="outline" className="mt-4" onClick={() => setTab('explore')}>
                Explore Communities
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(community => {
              const isMember = myIds.has(community.id);
              return (
                <Card
                  key={community.id}
                  className="p-4 flex items-center gap-4 hover:border-primary-500/40 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/communities/${community.id}`)}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-gold-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getInitials(community.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold text-sm truncate">{community.name}</h3>
                      {isMember && getRoleBadge(community.role)}
                    </div>
                    {community.description && (
                      <p className="text-dark-400 text-xs mt-0.5 truncate">{community.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-dark-400 text-xs flex items-center gap-1">
                        <Users size={11} />{community.member_count || 0} members
                      </span>
                      <span className="text-dark-400 text-xs flex items-center gap-1">
                        <TrendingUp size={11} />{community.proposal_count || 0} proposals
                      </span>
                      <span className="text-dark-400 text-xs flex items-center gap-1">
                        <Globe size={11} />{community.quorum_percentage || 51}% quorum
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {isMember ? (
                      <ChevronRight size={18} className="text-dark-500 group-hover:text-primary-400 transition-colors" />
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleJoin(community.id)} disabled={joining === community.id}>
                        {joining === community.id ? <Spinner size="sm" /> : 'Join'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setError(''); }} title="Create Community">
        <div className="space-y-4">
          <div>
            <label className="text-dark-300 text-xs mb-1 block">Community Name *</label>
            <input
              type="text"
              placeholder="e.g. Mama Mboga Chama"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 text-white placeholder-dark-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="text-dark-300 text-xs mb-1 block">Description</label>
            <textarea
              placeholder="What is this community about?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-dark-800 border border-dark-600 text-white placeholder-dark-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="text-dark-300 text-xs mb-1 block">Quorum: {form.quorum_percentage}%</label>
            <input
              type="range" min={1} max={100}
              value={form.quorum_percentage}
              onChange={e => setForm({ ...form, quorum_percentage: parseInt(e.target.value) })}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-dark-500 text-xs mt-1">
              <span>1%</span><span>Simple majority (51%)</span><span>100%</span>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setError(''); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreate} disabled={creating}>
              {creating ? <Spinner size="sm" /> : 'Create Community'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Communities;
