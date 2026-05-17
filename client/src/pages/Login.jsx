import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { Shield, Phone, ArrowRight, CheckCircle, Users, Vote, Wallet } from 'lucide-react';

const Login = () => {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', { phone, name });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Vote size={20} color="#4ade80" />, title: 'Transparent Voting', desc: 'Every vote recorded on blockchain' },
    { icon: <Wallet size={20} color="#d97706" />, title: 'Secure Treasury', desc: 'Funds released only on passing votes' },
    { icon: <Users size={20} color="#60a5fa" />, title: 'Community First', desc: 'Built for chamas, SACCOs & more' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080f1a' }}>

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', background: 'linear-gradient(135deg, #0a1628 0%, #0d2010 100%)',
        borderRight: '1px solid #1e2d45',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(22,163,74,0.4)' }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '20px', margin: 0, letterSpacing: '0.02em' }}>Umoja</p>
            <p style={{ color: '#4a6fa5', fontSize: '12px', margin: 0 }}>Governance Platform</p>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ color: 'white', fontSize: '42px', fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Community<br />governance<br /><span style={{ color: '#4ade80' }}>reimagined.</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7, margin: '0 0 48px', maxWidth: '380px' }}>
          Transparent voting, secure treasury management, and tamper-proof decisions for every community in Kenya.
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0 }}>{title}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '32px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #1e2d45' }}>
          {[['2M+', 'Community orgs'], ['100%', 'Tamper-proof'], ['Free', 'Always']].map(([val, label]) => (
            <div key={label}>
              <p style={{ color: '#4ade80', fontSize: '20px', fontWeight: 700, margin: 0 }}>{val}</p>
              <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Form */}
      <div style={{ width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px' }}>
        <div style={{ width: '100%' }}>

          {step === 'phone' ? (
            <>
              <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 700, margin: '0 0 8px' }}>Welcome back</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px' }}>Enter your phone number to get started.</p>

              <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Phone number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4a6fa5' }} />
                    <input
                      type="tel"
                      placeholder="0712 345 678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      style={{ width: '100%', padding: '13px 14px 13px 42px', background: '#111827', border: '1px solid #1e2d45', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Your name <span style={{ color: '#4a6fa5' }}>(new users only)</span></label>
                  <input
                    type="text"
                    placeholder="Leave blank if you already have an account"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '13px 14px', background: '#111827', border: '1px solid #1e2d45', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {error && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>}

                <button type="submit" disabled={loading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: 'white', fontSize: '15px', fontWeight: 600,
                  boxShadow: '0 0 20px rgba(22,163,74,0.3)',
                  opacity: loading ? 0.7 : 1, marginTop: '8px',
                }}>
                  {loading ? 'Sending OTP...' : <> Continue <ArrowRight size={16} /></>}
                </button>
              </form>

              <p style={{ color: '#4a6fa5', fontSize: '12px', textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
                By continuing you agree to our terms of service.<br />Your phone number is used for verification only.
              </p>
            </>
          ) : (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <CheckCircle size={24} color="#4ade80" />
              </div>
              <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 700, margin: '0 0 8px' }}>Check your phone</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px' }}>
                We sent a 6-digit code to <strong style={{ color: 'white' }}>{phone}</strong>
              </p>

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }}>OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    style={{ width: '100%', padding: '13px 14px', background: '#111827', border: '1px solid #1e2d45', borderRadius: '10px', color: 'white', fontSize: '20px', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.3em', textAlign: 'center' }}
                  />
                </div>

                {error && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>}

                <button type="submit" disabled={loading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: 'white', fontSize: '15px', fontWeight: 600,
                  boxShadow: '0 0 20px rgba(22,163,74,0.3)',
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Verifying...' : <> Verify & Sign In <ArrowRight size={16} /></>}
                </button>

                <button type="button" onClick={() => setStep('phone')} style={{ background: 'none', border: 'none', color: '#4a6fa5', fontSize: '13px', cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                  ← Back to phone number
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
