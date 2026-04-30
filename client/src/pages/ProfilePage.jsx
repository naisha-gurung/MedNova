import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, getAvatarUrl, getInitials, bloodGroups, roleLabels } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    bloodGroup: user?.bloodGroup || '', address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const fileRef = useRef();
  const avatarUrl = preview || getAvatarUrl(user?.profilePicture);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append('profilePicture', file);
      const { data } = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setChangingPw(false); }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left - Avatar & Info */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--gray-100)' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', border: '4px solid var(--gray-100)' }}>
                    {getInitials(user?.name)}
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: '0', right: '0', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>📷</button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--gray-900)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '2px' }}>{user?.email}</div>
              <div style={{ marginTop: '10px' }}>
                <span className={`badge badge-primary`}>{roleLabels[user?.role] || user?.role}</span>
              </div>
              {user?.specialization && <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--gray-500)' }}>{user.specialization}</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: '16px' }}>
              {[
                { icon: '📞', label: 'Phone', value: user?.phone },
                { icon: '🩸', label: 'Blood Group', value: user?.bloodGroup },
                { icon: '🎂', label: 'Date of Birth', value: formatDate(user?.dateOfBirth) },
                { icon: '📍', label: 'Address', value: user?.address },
              ].filter(i => i.value).map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ fontSize: '1rem', width: '22px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: '600', textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)', fontWeight: '500' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Forms */}
        <div>
          {/* Edit Profile */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 style={{ fontWeight: '700', fontSize: '0.95rem' }}>Edit Information</h3>
            </div>
            <form onSubmit={handleSave} className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-control" type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                    <option value="">Select</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
                  <input className="form-control" placeholder="Name & Phone" value={form.emergencyContact} onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <><div className="spinner spinner-sm" />Saving...</> : '💾 Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight: '700', fontSize: '0.95rem' }}>🔒 Change Password</h3></div>
            <form onSubmit={handleChangePassword} className="card-body">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-control" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-control" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-control" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                </div>
              </div>
              <button type="submit" disabled={changingPw} className="btn btn-secondary">
                {changingPw ? <><div className="spinner spinner-sm" />Updating...</> : '🔑 Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
