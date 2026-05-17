import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Users, CheckCircle, XCircle, MinusCircle, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const ProposalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [votes, setVotes] = useState([]);
  const [quorum, setQuorum] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [propRes, quorumRes, eligRes] = await Promise.all([
        api.get(`/proposals/${id}`),
        api.get(`/voting/${id}/quorum`),
        api.get(`/voting/${id}/eligibility`),
      ]);
      setProposal(propRes.data.proposal);
      setVotes(propRes.data.votes || []);
      setQuorum(quorumRes.data);
      setEligibility(eligRes.data);
      const myVote = propRes.data.votes?.find(v => v.voter_id === user?.id) || (eligRes.data.hasVoted ? { vote_type: eligRes.data.userVote } : null);
      if (myVote) setVoted(myVote.vote_type || myVote.choice); else if (eligRes.data.hasVoted) setVoted(eligRes.data.userVote);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      setVoting(true);
      setError('');
      await api.post('/voting/cast', { proposal_id: id, choice: voteType });
      setVoted(voteType);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const timeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Voting ended';
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h left`;
    return `${h}h left`;
  };

  const getPercent = (count, total) => total === 0 ? 0 : Math.round((count / total) * 100);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <p style={{ color: '#64748b' }}>Loading proposal...</p>
      </div>
    </Layout>
  );

  if (!proposal) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: '#64748b' }}>Proposal not found.</p>
      </div>
    </Layout>
  );

  const yesVotes = votes.filter(v => v.vote_type === 'yes').length;
  const noVotes = votes.filter(v => v.vote_type === 'no').length;
  const abstainVotes = votes.filter(v => v.vote_type === 'abstain').length;
  const totalVotes = votes.length;
  const isActive = proposal.status === 'active';
  const canVote = isActive && eligibility?.eligible && !voted;

  return (
    <Layout>
      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Back */}
        <button onClick={() => navigate('/proposals')} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', color: '#64748b',
          cursor: 'pointer', fontSize: '14px', padding: 0,
        }}>
          <ChevronLeft size={18} /> Back to Proposals
        </button>

        {/* Header Card */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: isActive ? 'rgba(22,163,74,0.15)' : 'rgba(100,116,139,0.15)',
                  color: isActive ? '#4ade80' : '#94a3b8',
                  border: `1px solid ${isActive ? 'rgba(22,163,74,0.3)' : 'rgba(100,116,139,0.2)'}`,
                }}>{proposal.status}</span>
                <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>{proposal.vote_type} majority</span>
              </div>
              <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>{proposal.title}</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                {proposal.community_name} · Proposed by {proposal.proposer_name}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontSize: '13px' }}>
                <Clock size={14} />{timeLeft(proposal.deadline)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                <Users size={14} />{totalVotes} votes cast
              </div>
            </div>
          </div>

          {proposal.description && (
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7, marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1e2d45' }}>
              {proposal.description}
            </p>
          )}

          {proposal.funds_involved && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: '8px' }}>
              <p style={{ color: '#d97706', fontSize: '13px', margin: 0 }}>
                💰 This proposal involves funds: <strong>KSh {proposal.fund_amount?.toLocaleString()}</strong>
                {proposal.fund_recipient && ` → ${proposal.fund_recipient}`}
              </p>
            </div>
          )}
        </div>

        {/* Vote Results */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 20px' }}>Vote Results</h2>

          {[
            { label: 'Yes', count: yesVotes, color: '#4ade80', bg: 'rgba(22,163,74,0.15)', icon: <CheckCircle size={16} color="#4ade80" /> },
            { label: 'No', count: noVotes, color: '#f87171', bg: 'rgba(248,113,113,0.15)', icon: <XCircle size={16} color="#f87171" /> },
            { label: 'Abstain', count: abstainVotes, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: <MinusCircle size={16} color="#94a3b8" /> },
          ].map(({ label, count, color, bg, icon }) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {icon}
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{label}</span>
                </div>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{count} ({getPercent(count, totalVotes)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#0d1424', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  background: color,
                  width: `${getPercent(count, totalVotes)}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}

          {quorum && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1e2d45' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Quorum ({quorum.quorumRequired}% required)</span>
                <span style={{ color: quorum.quorumReached ? '#4ade80' : '#d97706', fontSize: '12px', fontWeight: 600 }}>
                  {quorum.quorumReached ? '✓ Reached' : `${quorum.currentPercentage || 0}% / ${quorum.quorumRequired}%`}
                </span>
              </div>
              <div style={{ height: '6px', background: '#0d1424', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  background: quorum.quorumReached ? '#4ade80' : '#d97706',
                  width: `${Math.min(quorum.currentPercentage || 0, 100)}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Voting Action */}
        {isActive && (
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Cast Your Vote</h2>

            {voted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px' }}>
                <CheckCircle size={18} color="#4ade80" />
                <p style={{ color: '#4ade80', fontSize: '14px', margin: 0 }}>
                  You voted <strong>{voted}</strong> on this proposal.
                </p>
              </div>
            ) : !eligibility?.eligible ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px' }}>
                <AlertCircle size={18} color="#f87171" />
                <p style={{ color: '#f87171', fontSize: '14px', margin: 0 }}>
                  {eligibility?.reason || 'You are not eligible to vote on this proposal.'}
                </p>
              </div>
            ) : (
              <div>
                {error && (
                  <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { type: 'yes', label: '👍 Vote Yes', color: '#4ade80', border: 'rgba(22,163,74,0.4)', bg: 'rgba(22,163,74,0.1)' },
                    { type: 'no', label: '👎 Vote No', color: '#f87171', border: 'rgba(248,113,113,0.4)', bg: 'rgba(248,113,113,0.1)' },
                    { type: 'abstain', label: '🤐 Abstain', color: '#94a3b8', border: 'rgba(148,163,184,0.3)', bg: 'rgba(148,163,184,0.08)' },
                  ].map(({ type, label, color, border, bg }) => (
                    <button
                      key={type}
                      onClick={() => handleVote(type)}
                      disabled={voting}
                      style={{
                        padding: '14px', borderRadius: '10px', cursor: voting ? 'not-allowed' : 'pointer',
                        background: bg, border: `1px solid ${border}`,
                        color, fontSize: '14px', fontWeight: 600,
                        transition: 'all 0.15s', opacity: voting ? 0.6 : 1,
                      }}
                    >
                      {voting ? '...' : label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blockchain proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.1)', borderRadius: '10px' }}>
          <Shield size={14} color="#4ade80" />
          <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
            This proposal is recorded on the blockchain. All votes are tamper-proof and permanent.
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default ProposalDetail;
