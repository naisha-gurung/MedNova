import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { bloodGroups } from '../utils/helpers';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', gender: '', dateOfBirth: '', bloodGroup: '', address: '' });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append('profilePicture', file);
      await register(fd);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleGoogle = async (credential) => {
    try {
      await googleLogin(credential);
      toast.success('Welcome to MedNova!');
      navigate('/dashboard');
    } catch { toast.error('Google signup failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '580px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '38px', height: '38px', background: 'var(--primary)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' }}>✚</div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--gray-900)' }}>MedNova</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--gray-900)', marginBottom: '8px' }}>Create your account</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign in</Link></p>
        </div>

        <div className="card">
          <div className="card-body">
            {/* Avatar upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px dashed var(--gray-300)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'border-color 0.2s', background: preview ? 'none' : 'var(--gray-50)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-300)'}
              >
                {preview ? <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.8rem' }}>📷</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '8px' }}>Click to upload profile photo</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" placeholder="Dr. John Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-control" type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                    <option value="">Select blood group</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-control" placeholder="City, State" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height: '46px', fontSize: '0.95rem', marginBottom: '16px' }}>
                {loading ? <><div className="spinner spinner-sm" />Creating account...</> : 'Create Account'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin onSuccess={({ credential }) => handleGoogle(credential)} onError={() => toast.error('Google signup failed')} theme="outline" size="large" text="signup_with" width="500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
