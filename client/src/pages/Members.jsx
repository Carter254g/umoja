import { useState, useEffect } from 'react';
import { Users, Shield, Crown, User, Phone, Calendar } from 'lucide-react';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const roleIcon = { admin: <Crown size={14} color="#d97706" />, committee: <Shield size={14} color="#60a5fa" />, member: <User size={14} color="#94a3b8" /> };
const roleColor = { admin: '#d97706', committee: '#60a5fa', member: '#94a3b8' };
const roleBg = { admin: 'rgba(217,119,6,0.1)', committee: 'rgba(96,165,250,0.1)', member: 'rgba(148,163,184,0.08)' };

const Members = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/communities/mine').then(res => {
      const c = res.data.communities || [];
      setCommunities(c);
      if (c.length > 0) fetchMembers(c[0].id);
      else setLoading(false);
    }).catch(console.error);
  }, []);

  const fetchMembers = async (communityId) => {
    try {
      setMembersLoading(true);
      setSelectedCommunity(communityId);
      const res = await api.get(`/communities/${communityId}/members`);
      setMembers(res.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMembersLoading(false);
      setLoading(false);
    }
  };

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  const selectedName = communities.find(c => c.id === selectedCommunity)?.name;

  return (
    <Layout>
      <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0 }}>Members</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Community member directory</p>
        </div>

        {/* Community Tabs */}
        {communities.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {communities.map(c => (
              <button key={c.id} onClick={() => fetchMembers(c.id)} style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: selectedCommunity === c.id ? '#16a34a' : '#111827',
                border: `1px solid ${selectedCommunity === c.id ? '#16a34a' : '#1e2d45'}`,
                color: selectedCommunity === c.id ? 'white' : '#94a3b8',
                transition: 'all 0.15s',
              }}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { label: 'Total Members', value: members.length, color: '#4ade80' },
              { label: 'Admins', value: members.filter(m => m.role === 'admin').length, color: '#d97706' },
              { label: 'Active', value: members.length, color: '#60a5fa' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '20px' }}>
                <p style={{ color, fontSize: '28px', fontWeight: 700, margin: '0 0 4px' }}>{value}</p>
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + List */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: 0 }}>
              {selectedName || 'Members'} ({filtered.length})
            </h2>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 14px', background: '#0d1424', border: '1px solid #1e2d45',
                borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', width: '220px',
              }}
            />
          </div>

          {loading || membersLoading ? (
            <p style={{ color: '#64748b', fontSize: '13px' }}>Loading members...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Users size={32} color="#1e2d45" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>No members found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map((member, i) => (
                <div key={member.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', background: '#0d1424',
                  border: '1px solid #1e2d45', borderRadius: '10px',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    background: `hsl(${(i * 47) % 360}, 40%, 25%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14px',
                  }}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0 }}>{member.name}</p>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: roleBg[member.role] || roleBg.member,
                        color: roleColor[member.role] || roleColor.member,
                      }}>
                        {roleIcon[member.role] || roleIcon.member}
                        {member.role}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} />{member.phone}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} />Joined {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Members;
