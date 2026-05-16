import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import api from '../utils/api';
import { FileText, ChevronLeft, Info } from 'lucide-react';

const VOTE_TYPES = [
  { value: 'simple', label: 'Simple Majority', desc: 'More than 50% must vote yes' },
  { value: 'super', label: 'Super Majority', desc: 'More than 66% must vote yes' },
  { value: 'unanimous', label: 'Unanimous', desc: 'All members must vote yes' },
];

const NewProposal = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    community_id: '',
    title: '',
    description: '',
    vote_type: 'simple',
    duration_days: 7,
    funds_involved: false,
    fund_amount: '',
    fund_recipient: '',
    contract_id: 0,
  });

  useEffect(() => {
    api.get('/communities/mine').then(res => {
      setCommunities(res.data.communities || []);
      if (res.data.communities?.length === 1) {
        setForm(f => ({ ...f, community_id: res.data.communities[0].id }));
      }
    }).catch(console.error);
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.community_id) return setError('Please select a community');
    if (!form.title.trim()) return setError('Title is required');
    if (form.funds_involved && !form.fund_amount) return setError('Fund amount is required');
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/proposals', {
        ...form,
        fund_amount: form.funds_involved ? parseFloat(form.fund_amount) : null,
        fund_recipient: form.funds_involved ? form.fund_recipient : null,
      });
      navigate(`/proposals/${res.data.proposal.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-dark-400 hover:text-white transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">New Proposal</h1>
            <p className="text-dark-300 text-sm mt-0.5">Submit a proposal for your community to vote on</p>
          </div>
        </div>

        <Card className="p-6 space-y-5">

          {/* Community */}
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">Community *</label>
            <select
              value={form.community_id}
              onChange={e => set('community_id', e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="">Select a community</option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">Proposal Title *</label>
            <input
              type="text"
              placeholder="e.g. Raise monthly contribution to KSh 500"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 text-white placeholder-dark-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">Description</label>
            <textarea
              placeholder="Explain the proposal in detail..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              className="w-full bg-dark-800 border border-dark-600 text-white placeholder-dark-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          {/* Vote Type */}
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">Vote Type *</label>
            <div className="grid grid-cols-1 gap-2">
              {VOTE_TYPES.map(vt => (
                <button
                  key={vt.value}
                  onClick={() => set('vote_type', vt.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    form.vote_type === vt.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-600 bg-dark-800 hover:border-dark-500'
                  }`}
                >
                  <div className="text-white text-sm font-medium">{vt.label}</div>
                  <div className="text-dark-400 text-xs mt-0.5">{vt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">
              Voting Duration: {form.duration_days} {form.duration_days === 1 ? 'day' : 'days'}
            </label>
            <input
              type="range" min={1} max={30}
              value={form.duration_days}
              onChange={e => set('duration_days', parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-dark-500 text-xs mt-1">
              <span>1 day</span><span>1 week</span><span>30 days</span>
            </div>
          </div>

          {/* Funds Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('funds_involved', !form.funds_involved)}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.funds_involved ? 'bg-primary-600' : 'bg-dark-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.funds_involved ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-white text-sm">This proposal involves funds</span>
            </label>
          </div>

          {/* Fund Fields */}
          {form.funds_involved && (
            <div className="space-y-4 p-4 bg-dark-800 rounded-lg border border-dark-600">
              <div className="flex items-center gap-2 text-gold-400 text-xs">
                <Info size={13} />
                Funds will be held in the smart contract until the vote passes
              </div>
              <div>
                <label className="text-dark-300 text-xs mb-1.5 block">Amount (KSh) *</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.fund_amount}
                  onChange={e => set('fund_amount', e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 text-white placeholder-dark-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="text-dark-300 text-xs mb-1.5 block">Recipient Phone (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 0712345678"
                  value={form.fund_recipient}
                  onChange={e => set('fund_recipient', e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 text-white placeholder-dark-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button className="flex-1 flex items-center justify-center gap-2" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner size="sm" /> : <><FileText size={15} /> Submit Proposal</>}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default NewProposal;
