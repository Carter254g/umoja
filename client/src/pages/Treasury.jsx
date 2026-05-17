import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Plus, ArrowDownLeft, ArrowUpRight, Users } from 'lucide-react';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const Treasury = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContribute, setShowContribute] = useState(false);
  const [form, setForm] = useState({ community_id: '', amount: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/treasury');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!form.community_id || !form.amount) return setError('Community and amount are required');
    try {
      setSubmitting(true);
      setError('');
      await api.post('/treasury/contribute', form);
      setShowContribute(false);
      setForm({ community_id: '', amount: '', description: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (amount) => `KSh ${parseFloat(amount || 0).toLocaleString()}`;

  return (
    <Layout>
      <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0 }}>Treasury</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Community funds and contributions</p>
          </div>
          <button onClick={() => setShowContribute(!showContribute)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            border: 'none', color: 'white', fontSize: '14px', fontWeight: 600,
          }}>
            <Plus size={16} /> Add Contribution
          </button>
        </div>

        {/* Total Balance */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(13,20,36,0.8))',
          border: '1px solid rgba(22,163,74,0.25)', borderRadius: '12px', padding: '28px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={26} color="#4ade80" />
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px' }}>Total Balance Across Communities</p>
            <p style={{ color: 'white', fontSize: '32px', fontWeight: 700, margin: 0 }}>
              {loading ? '...' : fmt(data?.totalBalance)}
            </p>
          </div>
        </div>

        {/* Contribute Form */}
        {showContribute && (
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Add Contribution</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select
                value={form.community_id}
                onChange={e => setForm({ ...form, community_id: e.target.value })}
                style={{ padding: '10px 12px', background: '#0d1424', border: '1px solid #1e2d45', borderRadius: '8px', color: 'white', fontSize: '13px' }}
              >
                <option value="">Select community</option>
                {data?.communities?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount (KSh)"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                style={{ padding: '10px 12px', background: '#0d1424', border: '1px solid #1e2d45', borderRadius: '8px', color: 'white', fontSize: '13px' }}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ padding: '10px 12px', background: '#0d1424', border: '1px solid #1e2d45', borderRadius: '8px', color: 'white', fontSize: '13px' }}
              />
              {error && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowContribute(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#0d1424', border: '1px solid #1e2d45', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
                  Cancel
                </button>
                <button onClick={handleContribute} disabled={submitting} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  {submitting ? 'Adding...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Community Balances */}
        {!loading && data?.communities?.length > 0 && (
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Community Balances</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.communities.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0d1424', border: '1px solid #1e2d45', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px' }}>
                      {c.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{c.name}</p>
                      <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>{c.transaction_count} transactions · {c.role}</p>
                    </div>
                  </div>
                  <p style={{ color: '#4ade80', fontSize: '15px', fontWeight: 700, margin: 0 }}>{fmt(c.balance)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Recent Transactions</h2>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '13px' }}>Loading...</p>
          ) : data?.transactions?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <TrendingUp size={32} color="#1e2d45" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>No transactions yet</p>
              <p style={{ color: '#4a6fa5', fontSize: '12px', marginTop: '4px' }}>Contributions will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#0d1424', border: '1px solid #1e2d45', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowDownLeft size={16} color="#4ade80" />
                    </div>
                    <div>
                      <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{tx.description || 'Contribution'}</p>
                      <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>{tx.contributor_name} · {tx.community_name} · {new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p style={{ color: '#4ade80', fontSize: '14px', fontWeight: 600, margin: 0 }}>+{fmt(tx.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Treasury;
