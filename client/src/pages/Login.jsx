import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { Shield, Phone, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const steps = {
  PHONE: 'phone',
  OTP: 'otp',
  PROFILE: 'profile',
};

const Login = () => {
  const [step, setStep] = useState(steps.PHONE);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', {
        phone,
        name: name || undefined,
      });
      setIsNewUser(res.data.isNewUser);
      setOtpSent(true);
      setStep(steps.OTP);
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

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { phone });
      setError('');
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f172a 60%, #052e16 100%)' }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #16a34a 0%, transparent 50%), radial-gradient(circle at 75% 75%, #d97706 0%, transparent 50%)'
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-green">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">Umoja</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Community<br />
              governance<br />
              <span className="text-primary-400">reimagined.</span>
            </h1>
            <p className="text-dark-300 text-lg leading-relaxed max-w-md">
              Transparent voting, secure treasury management, and tamper-proof decisions for every community in Kenya.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { value: '2M+', label: 'Community orgs in Kenya' },
              { value: '100%', label: 'Tamper-proof records' },
              { value: 'Free', label: 'Always free to use' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-primary-400">{value}</p>
                <p className="text-dark-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">Umoja</span>
          </div>

          {step === steps.PHONE && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
              <p className="text-dark-400 mb-8">Enter your phone number to get started.</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestOTP} className="space-y-5">
                <Input
                  label="Phone number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  icon={Phone}
                  required
                />
                <Input
                  label="Your name (new users only)"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Carter Obara"
                  hint="Leave blank if you already have an account"
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  size="lg"
                >
                  Continue
                  <ArrowRight size={16} />
                </Button>
              </form>

              <p className="text-dark-500 text-xs text-center mt-8">
                By continuing you agree to our terms of service. Your phone number is used for verification only.
              </p>
            </div>
          )}

          {step === steps.OTP && (
            <div className="animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center mb-6">
                <Phone size={24} className="text-primary-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Verify your number</h2>
              <p className="text-dark-400 mb-8">
                We sent a 6-digit code to <span className="text-white font-medium">{phone}</span>
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <Input
                  label="Verification code"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="text-2xl tracking-widest text-center font-mono"
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  size="lg"
                  disabled={otp.length !== 6}
                >
                  Verify and Continue
                  <CheckCircle size={16} />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-dark-400 text-sm">
                  Did not receive the code?{' '}
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-primary-400 hover:text-primary-300 font-medium"
                  >
                    Resend
                  </button>
                </p>
                <button
                  onClick={() => setStep(steps.PHONE)}
                  className="text-dark-500 hover:text-dark-300 text-sm mt-2"
                >
                  Change phone number
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
