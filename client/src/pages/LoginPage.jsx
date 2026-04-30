import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleGoogle = async (credential) => {
    try {
      await googleLogin(credential);
      toast.success('Welcome to MedNova!');
      navigate('/dashboard');
    } catch { toast.error('Google login failed'); }
  };

  const demoLogin = (email) => setForm({ email, password: 'password123' });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e8f0fe 100%)', display: 'flex', alignItems: 'stretch' }}>
      {/* Left Panel */}
      <div style={{ flex: '1', background: 'var(--gray-900)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(26,86,219,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '42px', height: '42px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>✚</div>
            <span style={{ color: 'white', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>MedNova</span>
          </div>

          <h1 style={{ color: 'white', fontSize: '2.4rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            Compassionate care,<br /><span style={{ color: 'var(--accent)' }}>powered by precision.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '360px', marginBottom: '48px' }}>
            Manage your hospital operations seamlessly — appointments, patients, prescriptions, and more in one unified platform.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '📅', text: 'Smart appointment scheduling' },
              { icon: '💊', text: 'Digital prescriptions & inventory' },
              { icon: '🛏️', text: 'Real-time bed management' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: '0 0 480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 50px', background: 'white' }}>
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--gray-900)', marginBottom: '8px' }}>Sign in</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register here</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--primary-50)', borderRadius: 'var(--radius)', border: '1px solid var(--primary-light)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Quick Demo Login</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[['Admin','admin@mednova.com'],['Doctor','doctor1@mednova.com'],['Patient','patient@mednova.com'],['Pharmacist','pharmacist@mednova.com']].map(([label, email]) => (
              <button key={email} onClick={() => demoLogin(email)} style={{ padding: '4px 10px', borderRadius: '100px', border: '1px solid var(--primary-light)', background: 'white', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@hospital.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input className="form-control" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingRight: '44px' }} />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '12px', top: '32px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.85rem' }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height: '46px', fontSize: '0.95rem', marginBottom: '16px' }}>
            {loading ? <><div className="spinner spinner-sm" />Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', fontWeight: '500' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin onSuccess={({ credential }) => handleGoogle(credential)} onError={() => toast.error('Google login failed')} theme="outline" size="large" width="380" />
        </div>
      </div>
    </div>
  );
}
