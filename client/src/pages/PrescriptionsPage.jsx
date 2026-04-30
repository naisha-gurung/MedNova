import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

function PrescriptionModal({ onClose, onSaved }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ patient: '', appointment: '', diagnosis: '', notes: '', followUpDate: '', medicines: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users?role=patient').then(r => setPatients(r.data.users));
    api.get('/inventory').then(r => setInventory(r.data.items));
    if (user.role === 'doctor') {
      api.get('/appointments?status=confirmed').then(r => setAppointments(r.data.appointments));
    }
  }, [user.role]);

  const addMedicine = (external = false) => {
    setForm(f => ({
      ...f,
      medicines: [...f.medicines, { inventoryItem: '', medicineName: '', isExternal: external, dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const updateMed = (idx, field, value) => {
    setForm(f => {
      const meds = [...f.medicines];
      meds[idx] = { ...meds[idx], [field]: value };
      if (field === 'inventoryItem' && value) {
        const found = inventory.find(i => i._id === value);
        if (found) meds[idx].medicineName = found.name;
      }
      return { ...f, medicines: meds };
    });
  };

  const removeMed = (idx) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.medicines.length === 0) return toast.error('Add at least one medicine');
    setSaving(true);
    try {
      await api.post('/prescriptions', form);
      toast.success('Prescription created');
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: '700', fontSize: '1.05rem' }}>💊 New Prescription</h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ marginBottom: '0' }}>
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-control" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} required>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              {appointments.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Linked Appointment</label>
                  <select className="form-control" value={form.appointment} onChange={e => setForm(f => ({ ...f, appointment: e.target.value }))}>
                    <option value="">None</option>
                    {appointments.map(a => <option key={a._id} value={a._id}>{a.patient?.name} — {formatDate(a.date)} {a.timeSlot}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Diagnosis *</label>
                <textarea className="form-control" rows={2} value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} required style={{ resize: 'vertical' }} placeholder="Primary diagnosis..." />
              </div>
            </div>

            {/* Medicines */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="form-label" style={{ margin: 0 }}>Medicines *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => addMedicine(false)} className="btn btn-secondary btn-sm">+ From Inventory</button>
                  <button type="button" onClick={() => addMedicine(true)} className="btn btn-sm" style={{ background: 'var(--warning-light)', color: 'var(--warning)', border: '1.5px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>+ Other Medicine</button>
                </div>
              </div>

              {form.medicines.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '2px dashed var(--gray-200)', color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                  Click "From Inventory" or "Other Medicine" to add medicines
                </div>
              )}

              {form.medicines.map((med, idx) => (
                <div key={idx} style={{ background: med.isExternal ? 'rgba(217,119,6,0.04)' : 'var(--gray-50)', border: `1.5px solid ${med.isExternal ? 'var(--warning)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius)', padding: '14px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--gray-700)' }}>Medicine {idx + 1}</span>
                      {med.isExternal && <span style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '100px', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase' }}>Not in Inventory</span>}
                    </div>
                    <button type="button" onClick={() => removeMed(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '1.1rem' }}>✕</button>
                  </div>

                  <div className="grid-2" style={{ marginBottom: '0' }}>
                    {!med.isExternal ? (
                      <div className="form-group">
                        <label className="form-label">Select from Inventory</label>
                        <select className="form-control" value={med.inventoryItem} onChange={e => updateMed(idx, 'inventoryItem', e.target.value)} required>
                          <option value="">Choose medicine</option>
                          {inventory.map(i => <option key={i._id} value={i._id}>{i.name} ({i.quantity} {i.unit} left)</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label className="form-label">Medicine Name *</label>
                        <input className="form-control" placeholder="Enter medicine name" value={med.medicineName} onChange={e => updateMed(idx, 'medicineName', e.target.value)} required />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Dosage *</label>
                      <input className="form-control" placeholder="e.g. 500mg" value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Frequency *</label>
                      <select className="form-control" value={med.frequency} onChange={e => updateMed(idx, 'frequency', e.target.value)} required>
                        <option value="">Select frequency</option>
                        {['Once daily','Twice daily','3 times a day','4 times a day','Every 6 hours','Every 8 hours','Every 12 hours','As needed','Before meals','After meals','At bedtime'].map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration *</label>
                      <select className="form-control" value={med.duration} onChange={e => updateMed(idx, 'duration', e.target.value)} required>
                        <option value="">Select duration</option>
                        {['1 day','2 days','3 days','5 days','7 days','10 days','14 days','21 days','30 days','Ongoing'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Special Instructions</label>
                      <input className="form-control" placeholder="e.g. Take with food, avoid alcohol" value={med.instructions} onChange={e => updateMed(idx, 'instructions', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input className="form-control" type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <input className="form-control" placeholder="Any extra instructions..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><div className="spinner spinner-sm" />Saving...</> : '💊 Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewPrescription({ id, onClose }) {
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/prescriptions/${id}`).then(r => setRx(r.data.prescription)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="modal-overlay"><div className="modal"><div className="loading-container"><div className="spinner" /></div></div></div>
  );
  if (!rx) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px' }}>
        <div className="modal-header" style={{ background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>✚</span>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>MedNova</span>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Prescription</div>
          </div>
          <button onClick={onClose} className="btn btn-icon" style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid-2" style={{ marginBottom: '20px', padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: '700', textTransform: 'uppercase' }}>Patient</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{rx.patient?.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{rx.patient?.gender} · {rx.patient?.bloodGroup}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: '700', textTransform: 'uppercase' }}>Doctor</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{rx.doctor?.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{rx.doctor?.specialization}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: '700', textTransform: 'uppercase' }}>Date</div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{formatDate(rx.createdAt)}</div>
            </div>
            {rx.followUpDate && (
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: '700', textTransform: 'uppercase' }}>Follow-up</div>
                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--primary)' }}>{formatDate(rx.followUpDate)}</div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--primary-50)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Diagnosis</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray-800)', fontWeight: '500' }}>{rx.diagnosis}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💊 Prescribed Medicines</div>
            {rx.medicines.map((med, i) => (
              <div key={i} style={{ padding: '14px', border: `1.5px solid ${med.isExternal ? 'var(--warning)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius)', marginBottom: '8px', background: med.isExternal ? 'rgba(217,119,6,0.03)' : 'var(--white)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{med.medicineName}</div>
                  {med.isExternal && <span style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '100px', fontSize: '0.68rem', fontWeight: '700' }}>External</span>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                  <span>💊 <strong>Dosage:</strong> {med.dosage}</span>
                  <span>🔄 <strong>Frequency:</strong> {med.frequency}</span>
                  <span>📅 <strong>Duration:</strong> {med.duration}</span>
                </div>
                {med.instructions && <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>ℹ {med.instructions}</div>}
              </div>
            ))}
          </div>

          {rx.notes && (
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              <strong>Notes:</strong> {rx.notes}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
          <button onClick={() => window.print()} className="btn btn-primary">🖨 Print</button>
        </div>
      </div>
    </div>
  );
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [search, setSearch] = useState('');

  const canCreate = ['admin', 'doctor', 'nurse'].includes(user?.role);

  const fetchRx = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data.prescriptions);
    } catch { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRx(); }, [fetchRx]);

  const filtered = prescriptions.filter(rx =>
    !search ||
    rx.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    rx.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Prescriptions</h1><p>Digital prescription management</p></div>
        {canCreate && <button onClick={() => setShowCreate(true)} className="btn btn-primary">+ New Prescription</button>}
      </div>

      <div className="filter-bar">
        <div className="search-input" style={{ flex: 1, maxWidth: '320px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search by patient or diagnosis..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">💊</div><h3>No prescriptions found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Follow-up</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(rx => (
                  <tr key={rx._id}>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{rx.patient?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{rx.patient?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{rx.doctor?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{rx.doctor?.specialization}</div>
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rx.diagnosis}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {rx.medicines.slice(0, 2).map((m, i) => (
                          <span key={i} style={{ background: m.isExternal ? 'var(--warning-light)' : 'var(--primary-light)', color: m.isExternal ? 'var(--warning)' : 'var(--primary)', padding: '2px 7px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '600' }}>
                            {m.medicineName}
                          </span>
                        ))}
                        {rx.medicines.length > 2 && <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', padding: '2px 4px' }}>+{rx.medicines.length - 2} more</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{formatDate(rx.createdAt)}</td>
                    <td style={{ fontSize: '0.82rem', color: rx.followUpDate ? 'var(--primary)' : 'var(--gray-400)' }}>
                      {rx.followUpDate ? formatDate(rx.followUpDate) : '—'}
                    </td>
                    <td><span className={`badge badge-${rx.status === 'active' ? 'success' : 'gray'}`}>{rx.status}</span></td>
                    <td>
                      <button onClick={() => setViewId(rx._id)} className="btn btn-secondary btn-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <PrescriptionModal onClose={() => setShowCreate(false)} onSaved={fetchRx} />}
      {viewId && <ViewPrescription id={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}
