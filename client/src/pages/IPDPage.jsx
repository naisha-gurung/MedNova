import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime, formatCurrency } from '../utils/helpers';

function AdmitModal({ onClose, onSaved }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: user.role === 'doctor' ? user._id : '', bed: '', admissionReason: '', diagnosis: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users?role=patient').then(r => setPatients(r.data.users));
    api.get('/doctors').then(r => setDoctors(r.data.doctors));
    api.get('/ipd/beds?isOccupied=false').then(r => setBeds(r.data.beds));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/ipd', form);
      toast.success('Patient admitted successfully');
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Admission failed'); }
    finally { setSaving(false); }
  };

  const selectedBed = beds.find(b => b._id === form.bed);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: '700', fontSize: '1.05rem' }}>🛏️ Admit Patient</h2>
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
              <label className="form-label">Bed * <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: '500' }}>({beds.length} available)</span></label>
              <select className="form-control" value={form.bed} onChange={e => setForm(f => ({ ...f, bed: e.target.value }))} required>
                <option value="">Select available bed</option>
                {beds.map(b => <option key={b._id} value={b._id}>{b.bedNumber} — {b.ward} Ward ({b.type}) — ₹{b.dailyCharge}/day</option>)}
              </select>
            </div>

            {selectedBed && (
              <div style={{ display: 'flex', gap: '12px', background: 'var(--success-light)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>🛏️</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--success)' }}>Bed {selectedBed.bedNumber} — {selectedBed.ward}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--success)' }}>{selectedBed.type} · {formatCurrency(selectedBed.dailyCharge)}/day</div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Admission Reason *</label>
              <textarea className="form-control" rows={2} value={form.admissionReason} onChange={e => setForm(f => ({ ...f, admissionReason: e.target.value }))} required placeholder="Primary reason for admission..." style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Initial Diagnosis</label>
                <input className="form-control" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
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
              {saving ? <><div className="spinner spinner-sm" />Admitting...</> : '🛏️ Admit Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DischargeModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState({ totalBill: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const days = record ? Math.max(1, Math.ceil((Date.now() - new Date(record.admissionDate)) / (1000 * 60 * 60 * 24))) : 0;
  const suggestedBill = record?.bed?.dailyCharge ? days * record.bed.dailyCharge : 0;

  useEffect(() => { if (suggestedBill) setForm(f => ({ ...f, totalBill: suggestedBill })); }, [suggestedBill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/ipd/${record._id}/discharge`, form);
      toast.success('Patient discharged successfully');
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Discharge failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: '700', fontSize: '1.05rem' }}>🏠 Discharge Patient</h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius)', marginBottom: '18px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>{record?.patient?.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                Admitted: {formatDate(record?.admissionDate)} · {days} day{days !== 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>Bed: {record?.bed?.bedNumber} — {record?.bed?.ward}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Total Bill (₹) *</label>
              <input className="form-control" type="number" min={0} value={form.totalBill} onChange={e => setForm(f => ({ ...f, totalBill: e.target.value }))} required />
              {suggestedBill > 0 && <div className="form-error" style={{ color: 'var(--gray-400)' }}>Suggested: {formatCurrency(suggestedBill)} ({days} days × {formatCurrency(record?.bed?.dailyCharge)}/day)</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Discharge Notes</label>
              <textarea className="form-control" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><div className="spinner spinner-sm" />Processing...</> : '✅ Confirm Discharge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IPDPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('patients');
  const [showAdmit, setShowAdmit] = useState(false);
  const [dischargeRecord, setDischargeRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState('admitted');

  const canAdmit = ['admin', 'doctor', 'nurse', 'receptionist'].includes(user?.role);
  const canDischarge = ['admin', 'doctor'].includes(user?.role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ipdRes, bedRes] = await Promise.all([
        api.get(`/ipd?status=${statusFilter}`),
        api.get('/ipd/beds')
      ]);
      setRecords(ipdRes.data.records);
      setBeds(bedRes.data.beds);
    } catch { toast.error('Failed to load IPD data'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.isOccupied).length;
  const availableBeds = totalBeds - occupiedBeds;

  const bedTypeColors = { general: 'var(--gray-500)', 'semi-private': 'var(--info)', private: 'var(--primary)', icu: 'var(--danger)', emergency: 'var(--warning)' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Inpatient Department (IPD)</h1><p>Manage admitted patients and bed allocation</p></div>
        {canAdmit && <button onClick={() => setShowAdmit(true)} className="btn btn-primary">+ Admit Patient</button>}
      </div>

      {/* Bed summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Beds', value: totalBeds, color: 'var(--primary)', icon: '🛏️' },
          { label: 'Occupied', value: occupiedBeds, color: 'var(--danger)', icon: '🔴' },
          { label: 'Available', value: availableBeds, color: 'var(--success)', icon: '🟢' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', background: 'var(--gray-100)', borderRadius: 'var(--radius)', padding: '4px', width: 'fit-content' }}>
        {[['patients', '👤 Patients'], ['beds', '🛏️ Bed Map']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', background: tab === key ? 'white' : 'transparent', color: tab === key ? 'var(--gray-900)' : 'var(--gray-500)', boxShadow: tab === key ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'patients' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['admitted', 'under-treatment', 'discharged'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>{s.replace('-', ' ')}</button>
            ))}
          </div>

          <div className="card">
            {loading ? (
              <div className="loading-container"><div className="spinner" /></div>
            ) : records.length === 0 ? (
              <div className="empty-state"><div className="icon">🛏️</div><h3>No {statusFilter} patients</h3></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Patient</th><th>Doctor</th><th>Bed</th><th>Admission Reason</th><th>Admitted</th><th>Status</th><th>Bill</th>{canDischarge && <th>Actions</th>}</tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="avatar avatar-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700', width: '30px', height: '30px', fontSize: '0.75rem' }}>{r.patient?.name?.charAt(0)}</div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{r.patient?.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{r.patient?.bloodGroup} · {r.patient?.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{r.doctor?.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{r.doctor?.specialization}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{r.bed?.bedNumber}</span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{r.bed?.ward} — {r.bed?.type}</div>
                        </td>
                        <td style={{ maxWidth: '200px', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.admissionReason}</td>
                        <td style={{ fontSize: '0.82rem' }}>{formatDate(r.admissionDate)}</td>
                        <td>
                          <span className={`badge badge-${r.status === 'admitted' ? 'primary' : r.status === 'under-treatment' ? 'warning' : 'gray'}`} style={{ textTransform: 'capitalize' }}>
                            {r.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700' }}>{r.totalBill ? formatCurrency(r.totalBill) : '—'}</td>
                        {canDischarge && (
                          <td>
                            {r.status !== 'discharged' && (
                              <button onClick={() => setDischargeRecord(r)} className="btn btn-warning btn-sm" style={{ background: 'var(--warning-light)', color: 'var(--warning)', border: '1.5px solid var(--warning)' }}>
                                Discharge
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'beds' && (
        <div>
          {['General', 'Semi-Private', 'Private', 'ICU', 'Emergency'].map(ward => {
            const wardBeds = beds.filter(b => b.ward === ward);
            if (!wardBeds.length) return null;
            return (
              <div key={ward} style={{ marginBottom: '24px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{ward} Ward</span>
                  <span style={{ fontSize: '0.75rem', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: '100px', color: 'var(--gray-500)' }}>
                    {wardBeds.filter(b => !b.isOccupied).length}/{wardBeds.length} available
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                  {wardBeds.map(bed => (
                    <div key={bed._id} style={{
                      padding: '14px', borderRadius: 'var(--radius)', textAlign: 'center',
                      border: `2px solid ${bed.isOccupied ? 'var(--danger)' : 'var(--success)'}`,
                      background: bed.isOccupied ? 'var(--danger-light)' : 'var(--success-light)',
                      cursor: 'default',
                    }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🛏️</div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: bed.isOccupied ? 'var(--danger)' : 'var(--success)' }}>{bed.bedNumber}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', color: bed.isOccupied ? 'var(--danger)' : 'var(--success)', marginTop: '2px' }}>
                        {bed.isOccupied ? 'Occupied' : 'Available'}
                      </div>
                      {bed.currentPatient && <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bed.currentPatient.name}</div>}
                      <div style={{ fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '2px' }}>₹{bed.dailyCharge}/day</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdmit && <AdmitModal onClose={() => setShowAdmit(false)} onSaved={fetchData} />}
      {dischargeRecord && <DischargeModal record={dischargeRecord} onClose={() => setDischargeRecord(null)} onSaved={fetchData} />}
    </div>
  );
}
