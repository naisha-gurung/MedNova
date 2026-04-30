import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency, statusColors, getTodayString, timeSlots } from '../utils/helpers';

const StatusBadge = ({ status }) => <span className={`badge badge-${statusColors[status] || 'gray'}`}>{status}</span>;

function BookModal({ onClose, onBooked, currentUser }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ doctorId: '', patientId: currentUser.role === 'patient' ? currentUser._id : '', date: '', timeSlot: '', reason: '', type: 'opd' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data.doctors));
    if (currentUser.role !== 'patient') {
      api.get('/users?role=patient').then(r => setPatients(r.data.users));
    }
  }, [currentUser.role]);

  useEffect(() => {
    if (form.doctorId && form.date) {
      api.get(`/appointments/slots?doctorId=${form.doctorId}&date=${form.date}`)
        .then(r => setSlots(r.data.available));
    }
  }, [form.doctorId, form.date]);

  useEffect(() => {
    if (form.doctorId) {
      const doc = doctors.find(d => d._id === form.doctorId);
      setSelectedDoctor(doc);
    }
  }, [form.doctorId, doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/appointments', form);
      toast.success('Appointment booked! Proceeding to payment...');
      // Simulate payment
      setTimeout(async () => {
        await api.post(`/appointments/${data.appointment._id}/pay`);
        toast.success('Payment confirmed! Appointment is confirmed.');
        onBooked();
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: '700', fontSize: '1.05rem' }}>📅 Book Appointment</h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {currentUser.role !== 'patient' && (
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-control" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} required>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.email}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Doctor *</label>
              <select className="form-control" value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value, timeSlot: '' }))} required>
                <option value="">Select doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization} ({formatCurrency(d.consultationFee)})</option>)}
              </select>
            </div>

            {selectedDoctor && (
              <div style={{ background: 'var(--primary-50)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Consultation Fee</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>{formatCurrency(selectedDoctor.consultationFee)}</span>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-control" type="date" min={getTodayString()} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value, timeSlot: '' }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time Slot *</label>
                <select className="form-control" value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))} required disabled={!form.doctorId || !form.date}>
                  <option value="">Select slot</option>
                  {slots.map(s => <option key={s} value={s}>{s}</option>)}
                  {form.doctorId && form.date && slots.length === 0 && <option disabled>No slots available</option>}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Type</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="opd">OPD</option><option value="ipd">IPD</option><option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Visit *</label>
              <textarea className="form-control" rows={3} placeholder="Briefly describe symptoms or reason..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required style={{ resize: 'vertical' }} />
            </div>

            {selectedDoctor && (
              <div style={{ background: 'var(--warning-light)', padding: '12px', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--warning)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                💳 <span>A payment of <strong>{formatCurrency(selectedDoctor.consultationFee)}</strong> will be processed to confirm your appointment.</span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><div className="spinner spinner-sm" />Processing...</> : '💳 Pay & Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ status: '', date: '' });
  const [search, setSearch] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.date) params.set('date', filter.date);
      const { data } = await api.get(`/appointments?${params}`);
      setAppointments(data.appointments);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success('Status updated');
      fetchAppointments();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const filtered = appointments.filter(a =>
    !search || a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const canBook = ['admin','doctor','nurse','patient','receptionist'].includes(user?.role);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Appointments</h1>
          <p>Manage and track all patient appointments</p>
        </div>
        {canBook && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Book Appointment</button>}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input" style={{ flex: 1, maxWidth: '300px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: '160px' }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          {['pending','confirmed','completed','cancelled','no-show'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
        </select>
        <input className="form-control" type="date" style={{ width: '160px' }} value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
        {(filter.status || filter.date) && <button onClick={() => setFilter({ status: '', date: '' })} className="btn btn-secondary btn-sm">Clear</button>}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><h3>No appointments found</h3><p>Book a new appointment to get started.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Fee</th><th>Payment</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(appt => (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700', width: '30px', height: '30px', fontSize: '0.75rem' }}>{appt.patient?.name?.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{appt.patient?.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{appt.patient?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{appt.doctor?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{appt.doctor?.specialization}</div>
                    </td>
                    <td>{formatDate(appt.date)}</td>
                    <td><span style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: '600' }}>{appt.timeSlot}</span></td>
                    <td><span className="badge badge-info">{appt.type}</span></td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(appt.consultationFee)}</td>
                    <td><span className={`badge badge-${statusColors[appt.paymentStatus] || 'gray'}`}>{appt.paymentStatus}</span></td>
                    <td><StatusBadge status={appt.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['admin','doctor','nurse'].includes(user?.role) && appt.status === 'confirmed' && (
                          <button onClick={() => handleStatusUpdate(appt._id, 'completed')} className="btn btn-success btn-sm">Done</button>
                        )}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button onClick={() => handleCancel(appt._id)} className="btn btn-danger btn-sm">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <BookModal onClose={() => setShowModal(false)} onBooked={fetchAppointments} currentUser={user} />}
    </div>
  );
}
