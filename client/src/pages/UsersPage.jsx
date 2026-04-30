import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatDate, getAvatarUrl, getInitials, roleColors, roleLabels, bloodGroups, departments, specializations } from '../utils/helpers';

function UserModal({ user: editUser, onClose, onSaved }) {
  const [form, setForm] = useState(editUser || {
    name: '', email: '', password: '', role: 'patient', phone: '', gender: '',
    specialization: '', consultationFee: 0, department: '', bloodGroup: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!editUser?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        const { password, ...data } = form;
        await api.put(`/users/${editUser._id}`, data);
        toast.success('User updated');
      } else {
        if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
        await api.post('/users', form);
        toast.success('User created');
      }
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{isEdit ? '✏️ Edit User' : '➕ Create User'}</h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required disabled={isEdit} />
              </div>
              {!isEdit && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
                  {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
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

              {form.role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select className="form-control" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}>
                      <option value="">Select specialization</option>
                      {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (₹)</label>
                    <input className="form-control" type="number" min={0} value={form.consultationFee} onChange={e => setForm(f => ({ ...f, consultationFee: Number(e.target.value) }))} />
                  </div>
                </>
              )}

              {['doctor', 'nurse', 'pharmacist', 'receptionist', 'worker'].includes(form.role) && (
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-control" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}

              {form.role === 'patient' && (
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                    <option value="">Select</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><div className="spinner spinner-sm" />Saving...</> : `💾 ${isEdit ? 'Update' : 'Create'} User`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/users?${params}&limit=50`);
      setUsers(data.users);
      setTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/users/${id}/toggle-status`);
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error('Failed to toggle status'); }
  };

  // Role count summary
  const roleCounts = Object.keys(roleLabels).reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>User Management</h1><p>Manage all users and their roles ({total} total)</p></div>
        <button onClick={() => setModal({})} className="btn btn-primary">+ Add User</button>
      </div>

      {/* Role summary */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setRoleFilter('')} className={`btn btn-sm ${!roleFilter ? 'btn-primary' : 'btn-secondary'}`}>All ({total})</button>
        {Object.entries(roleLabels).map(([role, label]) => (
          <button key={role} onClick={() => setRoleFilter(roleFilter === role ? '' : role)} className={`btn btn-sm ${roleFilter === role ? 'btn-primary' : 'btn-secondary'}`}>
            {label} ({roleCounts[role] || 0})
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-input" style={{ flex: 1, maxWidth: '320px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><div className="icon">👥</div><h3>No users found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>User</th><th>Role</th><th>Contact</th><th>Department</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const avUrl = getAvatarUrl(u.profilePicture);
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {avUrl ? (
                            <img src={avUrl} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)' }} />
                          ) : (
                            <div className="avatar avatar-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700', width: '36px', height: '36px' }}>{getInitials(u.name)}</div>
                          )}
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge badge-${roleColors[u.role] || 'gray'}`}>{roleLabels[u.role]}</span></td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{u.phone || '—'}</div>
                        {u.specialization && <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{u.specialization}</div>}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{u.department || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{formatDate(u.createdAt)}</td>
                      <td>
                        <span className={`badge badge-${u.isActive ? 'success' : 'danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setModal(u)} className="btn btn-secondary btn-sm">Edit</button>
                          <button onClick={() => handleToggle(u._id)} className="btn btn-sm" style={{ background: u.isActive ? 'var(--warning-light)' : 'var(--success-light)', color: u.isActive ? 'var(--warning)' : 'var(--success)', border: `1.5px solid ${u.isActive ? 'var(--warning)' : 'var(--success)'}`, borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(u._id, u.name)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && <UserModal user={modal._id ? modal : null} onClose={() => setModal(null)} onSaved={fetchUsers} />}
    </div>
  );
}
