import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, statusColors } from '../utils/helpers';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change" style={{ color: 'var(--gray-400)' }}>{sub}</div>}
    </div>
  </div>
);

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Patient Dashboard ───────────────────────────────────────────────────────
function PatientDashboard({ user, data }) {
  const { stats = {}, recentAppointments = [], monthlyTrend = [] } = data;
  const trendData = monthlyTrend.map(m => ({ name: monthNames[m._id.month - 1], appointments: m.count }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p>Welcome to MedNova — your personal health portal.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <StatCard icon="📅" label="Total Appointments" value={stats.myTotalAppointments} color="var(--primary)" sub="All time" />
        <StatCard icon="⏳" label="Upcoming" value={stats.myUpcoming} color="var(--warning)" sub="Pending & confirmed" />
        <StatCard icon="✅" label="Confirmed" value={stats.myConfirmed} color="var(--success)" sub="Ready to visit" />
        <StatCard icon="💊" label="Prescriptions" value={stats.myPrescriptions} color="var(--secondary)" sub="Issued to you" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>📈 My Appointment History</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Last 6 months</span>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '0.82rem' }} />
                  <Line type="monotone" dataKey="appointments" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}><div className="icon">📊</div><p>No data yet</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>🩺 Quick Actions</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/appointments" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius)', background: 'var(--primary-50)', border: '1px solid var(--primary-light)', textDecoration: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📅</span>
              <div>
                <div>Book an Appointment</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '400' }}>Schedule a visit with a doctor</div>
              </div>
            </a>
            <a href="/doctors" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius)', background: 'var(--success-light, #f0fdf4)', border: '1px solid #bbf7d0', textDecoration: 'none', color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.4rem' }}>👨‍⚕️</span>
              <div>
                <div>Find a Doctor</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '400' }}>Browse our specialists</div>
              </div>
            </a>
            <a href="/prescriptions" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius)', background: '#fdf4ff', border: '1px solid #e9d5ff', textDecoration: 'none', color: '#7c3aed', fontWeight: '600', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.4rem' }}>💊</span>
              <div>
                <div>My Prescriptions</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '400' }}>View your medication history</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>🕐 My Recent Appointments</h3>
          <a href="/appointments" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>View all →</a>
        </div>
        {recentAppointments.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><h3>No appointments yet</h3><p>Book your first appointment above!</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th><th>Date & Time</th><th>Status</th><th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map(appt => (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--success-light, #f0fdf4)', color: 'var(--success)', fontWeight: '700' }}>
                          {appt.doctor?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{appt.doctor?.name || '—'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{appt.doctor?.specialization}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{formatDate(appt.date)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{appt.timeSlot}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${statusColors[appt.status] || 'gray'}`}>{appt.status}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(appt.consultationFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Doctor Dashboard ────────────────────────────────────────────────────────
function DoctorDashboard({ user, data }) {
  const { stats = {}, recentAppointments = [], monthlyTrend = [] } = data;
  const trendData = monthlyTrend.map(m => ({ name: monthNames[m._id.month - 1], appointments: m.count }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Dr. {user?.name?.split(' ')[0]} 👋
          </h1>
          <p>Here's your schedule and patient overview for today.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <StatCard icon="📅" label="Today's Appointments" value={stats.myTodayAppointments} color="var(--primary)" sub="Scheduled today" />
        <StatCard icon="⏳" label="Pending Approvals" value={stats.myPendingAppointments} color="var(--warning)" sub="Awaiting confirmation" />
        <StatCard icon="👥" label="Total Patients Seen" value={stats.myTotalPatients} color="var(--success)" sub="Unique patients" />
        <StatCard icon="💊" label="Prescriptions Issued" value={stats.myPrescriptions} color="var(--secondary)" sub="All time" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>📈 My Appointment Trend</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Last 6 months</span>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '0.82rem' }} />
                  <Line type="monotone" dataKey="appointments" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}><div className="icon">📊</div><p>No data yet</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>⚡ Quick Actions</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/appointments" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius)', background: 'var(--primary-50)', border: '1px solid var(--primary-light)', textDecoration: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📅</span>
              <div><div>Today's Schedule</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '400' }}>View your appointments</div></div>
            </a>
            <a href="/prescriptions" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius)', background: '#fdf4ff', border: '1px solid #e9d5ff', textDecoration: 'none', color: '#7c3aed', fontWeight: '600', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.4rem' }}>💊</span>
              <div><div>Write Prescription</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '400' }}>Issue new prescription</div></div>
            </a>
            <a href="/opd" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius)', background: '#eff6ff', border: '1px solid #bfdbfe', textDecoration: 'none', color: 'var(--info)', fontWeight: '600', fontSize: '0.9rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🏥</span>
              <div><div>OPD Queue</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '400' }}>View waiting patients</div></div>
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>🕐 Recent Appointments</h3>
          <a href="/appointments" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>View all →</a>
        </div>
        {recentAppointments.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><h3>No appointments yet</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Patient</th><th>Date & Time</th><th>Status</th><th>Fee</th></tr>
              </thead>
              <tbody>
                {recentAppointments.map(appt => (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700' }}>
                          {appt.patient?.name?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontWeight: '600' }}>{appt.patient?.name || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div>{formatDate(appt.date)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{appt.timeSlot}</div>
                    </td>
                    <td><span className={`badge badge-${statusColors[appt.status] || 'gray'}`}>{appt.status}</span></td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(appt.consultationFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin / Staff Dashboard ─────────────────────────────────────────────────
function AdminDashboard({ user, data }) {
  const { stats = {}, recentAppointments = [], monthlyTrend = [] } = data;
  const trendData = monthlyTrend.map(m => ({ name: monthNames[m._id.month - 1], appointments: m.count }));
  const bedPct = stats.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;
  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p>Here's what's happening at MedNova today.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {stats.lowStockItems > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--warning-light)', color: 'var(--warning)', padding: '8px 14px', borderRadius: 'var(--radius)', fontSize: '0.82rem', fontWeight: '600' }}>
              ⚠️ {stats.lowStockItems} low stock item{stats.lowStockItems > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <StatCard icon="👥" label="Total Patients" value={stats.totalPatients} color="var(--primary)" sub="Registered" />
        <StatCard icon="👨‍⚕️" label="Active Doctors" value={stats.totalDoctors} color="var(--success)" />
        <StatCard icon="📅" label="Today's Appointments" value={stats.todayAppointments} color="var(--secondary)" sub={`${stats.confirmedAppointments} confirmed`} />
        <StatCard icon="🛏️" label="Beds Occupied" value={`${stats.occupiedBeds}/${stats.totalBeds}`} color="var(--warning)" sub={`${bedPct}% occupancy`} />
        <StatCard icon="🏥" label="OPD Today" value={stats.todayOPD} color="var(--info)" />
        <StatCard icon="💉" label="Active IPD" value={stats.activeIPD} color="#8b5cf6" />
        <StatCard icon="📦" label="Low Stock Items" value={stats.lowStockItems} color="var(--danger)" sub="Need reorder" />
        {isAdmin && (
          <StatCard icon="₹" label="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="var(--success)" />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>📈 Appointment Trend</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Last 6 months</span>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '0.82rem' }} />
                  <Line type="monotone" dataKey="appointments" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}><div className="icon">📊</div><p>No data yet</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>🛏️ Bed Availability</h3>
          </div>
          <div className="card-body">
            {[
              { label: 'Available', value: stats.availableBeds, color: 'var(--success)', total: stats.totalBeds },
              { label: 'Occupied', value: stats.occupiedBeds, color: 'var(--danger)', total: stats.totalBeds },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gray-700)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', color: item.color, fontWeight: '700' }}>{item.value}/{item.total}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'var(--gray-100)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: item.color, width: `${item.total ? (item.value / item.total) * 100 : 0}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{bedPct}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Occupancy Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--gray-800)' }}>🕐 Recent Appointments</h3>
          <a href="/appointments" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>View all →</a>
        </div>
        {recentAppointments.length === 0 ? (
          <div className="empty-state"><div className="icon">📅</div><h3>No appointments yet</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th><th>Fee</th></tr>
              </thead>
              <tbody>
                {recentAppointments.map(appt => (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700' }}>
                          {appt.patient?.name?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontWeight: '600' }}>{appt.patient?.name || '—'}</span>
                      </div>
                    </td>
                    <td>{appt.doctor?.name || '—'}</td>
                    <td>
                      <div>{formatDate(appt.date)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{appt.timeSlot}</div>
                    </td>
                    <td><span className={`badge badge-${statusColors[appt.status] || 'gray'}`}>{appt.status}</span></td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(appt.consultationFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p style={{ color: 'var(--gray-400)' }}>Loading dashboard...</p>
    </div>
  );

  if (!data) return null;

  if (user?.role === 'patient') return <PatientDashboard user={user} data={data} />;
  if (user?.role === 'doctor') return <DoctorDashboard user={user} data={data} />;
  return <AdminDashboard user={user} data={data} />;
}