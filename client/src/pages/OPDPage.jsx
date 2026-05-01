import React, { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime, statusColors } from '../utils/helpers';

function OPDModal({ onClose, onSaved }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient: '', doctor: '', chiefComplaint: '', diagnosis: '', treatment: '',
    vitals: { temperature: '', bloodPressure: '', pulse: '', weight: '', height: '', oxygenSaturation: '' },
    notes: '', status: 'waiting'
  });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/users?role=patient').then(r => setPatients(r.data.users));
    api.get('/doctors').then(r => setDoctors(r.data.doctors));
    if (user.role === 'doctor') setForm(f => ({ ...f, doctor: user._id }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/opd', form);
      toast.success('OPD record created');
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: '700', fontSize: '1.05rem' }}>🏥 New OPD Record</h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-control" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} required>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.phone || p.email}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select className="form-control" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} required disabled={user.role === 'doctor'}>
                  <option value="">Select doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chief Complaint *</label>
              <textarea className="form-control" rows={2} value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} required placeholder="Main reason for visit..." style={{ resize: 'vertical' }} />
            </div>

            <div style={{ padding: '14px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>📊 Vitals</div>
              <div className="grid-3" style={{ gap: '12px' }}>
                {[
                  ['temperature', 'Temperature (°F)'],
                  ['bloodPressure', 'Blood Pressure'],
                  ['pulse', 'Pulse (bpm)'],
                  ['oxygenSaturation', 'SpO2 (%)'],
                  ['weight', 'Weight (kg)'],
                  ['height', 'Height (cm)'],
                ].map(([key, label]) => (
                  <div key={key} className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>{label}</label>
                    <input className="form-control" placeholder="—" value={form.vitals[key]} onChange={e => setForm(f => ({ ...f, vitals: { ...f.vitals, [key]: e.target.value } }))} />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <textarea className="form-control" rows={2} value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Treatment</label>
                <textarea className="form-control" rows={2} value={form.treatment} onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="waiting">Waiting</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><div className="spinner spinner-sm" />Saving...</> : '💾 Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Derive OPD status from appointment time (client-side, mirrors server logic)
function deriveStatus(record) {
  if (!record.appointment || !record.appointment.date || !record.appointment.timeSlot) return record.status;
  const slot = record.appointment.timeSlot;
  const [time, meridiem] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const apptTime = new Date(record.appointment.date);
  apptTime.setHours(hours, minutes, 0, 0);
  const now = new Date();
  const diffMs = now - apptTime;
  if (diffMs < 0) return 'waiting';
  if (diffMs <= 60 * 60 * 1000) return 'in-progress';
  return 'completed';
}

export default function OPDPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const refreshRef = useRef(null);

  const canEdit = ['admin', 'doctor', 'nurse', 'receptionist'].includes(user?.role);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      const { data } = await api.get(`/opd?${params}`);
      setRecords(data.records);
    } catch { toast.error('Failed to load OPD records'); }
    finally { setLoading(false); }
  }, [statusFilter, dateFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Auto-refresh every 60 seconds to pick up status changes
  useEffect(() => {
    refreshRef.current = setInterval(() => { fetchRecords(); }, 60000);
    return () => clearInterval(refreshRef.current);
  }, [fetchRecords]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/opd/${id}`, { status });
      toast.success('Status updated');
      fetchRecords();
    } catch { toast.error('Failed to update'); }
  };

  // Apply client-side derived status for display
  const displayRecords = records.map(r => ({
    ...r,
    status: r.appointment ? deriveStatus(r) : r.status,
  }));

  const filtered = displayRecords.filter(r =>
    !search || r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.chiefComplaint?.toLowerCase().includes(search.toLowerCase())
  );

  // Re-filter after deriving status
  const finalFiltered = statusFilter
    ? filtered.filter(r => r.status === statusFilter)
    : filtered;

  const statusDot = { waiting: '#d97706', 'in-progress': '#1a56db', completed: '#059669' };

  // Count using derived statuses
  const counts = { waiting: 0, 'in-progress': 0, completed: 0 };
  displayRecords.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Outpatient Department (OPD)</h1><p>Manage outpatient visits and records</p></div>
        {canEdit && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ New OPD Visit</button>}
      </div>

      {/* Status summary */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['waiting', 'in-progress', 'completed'].map(s => (
          <div key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 18px', borderRadius: 'var(--radius)', border: `2px solid ${statusFilter === s ? statusDot[s] : 'var(--gray-100)'}`, cursor: 'pointer', transition: 'all 0.15s', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusDot[s] }} />
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--gray-900)' }}>{counts[s]}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'capitalize' }}>{s.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-input" style={{ flex: 1, maxWidth: '300px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search patient or complaint..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input className="form-control" type="date" style={{ width: '160px' }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        {(statusFilter || dateFilter) && <button onClick={() => { setStatusFilter(''); setDateFilter(''); }} className="btn btn-secondary btn-sm">Clear</button>}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : finalFiltered.length === 0 ? (
          <div className="empty-state"><div className="icon">🏥</div><h3>No OPD records found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Chief Complaint</th><th>Vitals</th><th>Appt. Time</th><th>Visit Time</th><th>Status</th>{canEdit && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {finalFiltered.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700', width: '30px', height: '30px', fontSize: '0.75rem' }}>{r.patient?.name?.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{r.patient?.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{r.patient?.gender} · {r.patient?.bloodGroup}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{r.doctor?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{r.doctor?.specialization}</div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.chiefComplaint}</div>
                      {r.diagnosis && <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '2px' }}>Dx: {r.diagnosis}</div>}
                    </td>
                    <td>
                      {r.vitals?.bloodPressure && <div style={{ fontSize: '0.75rem' }}>BP: {r.vitals.bloodPressure}</div>}
                      {r.vitals?.pulse && <div style={{ fontSize: '0.75rem' }}>Pulse: {r.vitals.pulse}</div>}
                      {r.vitals?.temperature && <div style={{ fontSize: '0.75rem' }}>Temp: {r.vitals.temperature}°F</div>}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                      {r.appointment ? (
                        <span style={{ background: 'var(--primary-50)', padding: '2px 8px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: '600', color: 'var(--primary)' }}>
                          {r.appointment.timeSlot}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{formatDateTime(r.visitDate)}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700', background: `${statusDot[r.status] || '#6b7280'}20`, color: statusDot[r.status] || '#6b7280' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusDot[r.status] || '#6b7280' }} />
                        {r.status.replace('-', ' ')}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status === 'waiting' && <button onClick={() => updateStatus(r._id, 'in-progress')} className="btn btn-primary btn-sm">Start</button>}
                          {r.status === 'in-progress' && <button onClick={() => updateStatus(r._id, 'completed')} className="btn btn-success btn-sm">Done</button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <OPDModal onClose={() => setShowModal(false)} onSaved={fetchRecords} />}
    </div>
  );
}