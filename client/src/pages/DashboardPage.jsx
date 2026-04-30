import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /><p style={{ color: 'var(--gray-400)' }}>Loading dashboard...</p></div>;

  const { stats = {}, recentAppointments = [], monthlyTrend = [] } = data || {};
  const trendData = monthlyTrend.map(m => ({ name: monthNames[m._id.month - 1], appointments: m.count }));

  const bedPct = stats.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  return (
    <div>
      {/* Welcome */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
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

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <StatCard icon="👥" label="Total Patients" value={stats.totalPatients} color="var(--primary)" sub="Registered" />
        <StatCard icon="👨‍⚕️" label="Active Doctors" value={stats.totalDoctors} color="var(--success)" />
        <StatCard icon="📅" label="Today's Appointments" value={stats.todayAppointments} color="var(--secondary)" sub={`${stats.confirmedAppointments} confirmed`} />
        <StatCard icon="🛏️" label="Beds Occupied" value={`${stats.occupiedBeds}/${stats.totalBeds}`} color="var(--warning)" sub={`${bedPct}% occupancy`} />
        <StatCard icon="🏥" label="OPD Today" value={stats.todayOPD} color="var(--info)" />
        <StatCard icon="💉" label="Active IPD" value={stats.activeIPD} color="#8b5cf6" />
        <StatCard icon="📦" label="Low Stock Items" value={stats.lowStockItems} color="var(--danger)" sub="Need reorder" />
        <StatCard icon="₹" label="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Chart */}
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

        {/* Bed Availability */}
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

      {/* Recent Appointments */}
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
                <tr>
                  <th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th><th>Fee</th>
                </tr>
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
                    <td>
                      <span className={`badge badge-${statusColors[appt.status] || 'gray'}`}>
                        {appt.status}
                      </span>
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
