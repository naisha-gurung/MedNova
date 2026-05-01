import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getAvatarUrl, getInitials } from '../utils/helpers';

export default function DoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors/specializations').then(r => setSpecializations(r.data.specializations));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (spec) params.set('specialization', spec);
    api.get(`/doctors?${params}`).then(r => setDoctors(r.data.doctors)).finally(() => setLoading(false));
  }, [search, spec]);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Our Doctors</h1><p>Find the right specialist for your needs</p></div>
      </div>

      <div className="filter-bar">
        <div className="search-input" style={{ flex: 1, maxWidth: '320px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: '200px' }} value={spec} onChange={e => setSpec(e.target.value)}>
          <option value="">All Specializations</option>
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : doctors.length === 0 ? (
        <div className="empty-state"><div className="icon">👨‍⚕️</div><h3>No doctors found</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {doctors.map(doc => {
            const avUrl = getAvatarUrl(doc.profilePicture);
            return (
              <div key={doc._id} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', height: '80px', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-30px', left: '24px' }}>
                    {avUrl ? (
                      <img src={avUrl} alt={doc.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.3rem', color: 'var(--primary)' }}>
                        {getInitials(doc.name)}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '40px 24px 24px' }}>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--gray-900)', marginBottom: '4px' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>{doc.specialization}</div>
                  {doc.department && <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '16px' }}>{doc.department}</div>}
                  {doc.gender && <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'capitalize' }}>{doc.gender}</div>}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--gray-100)', marginTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: '600', textTransform: 'uppercase' }}>Consultation Fee</div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>{formatCurrency(doc.consultationFee)}</div>
                    </div>
                    {['admin','doctor','nurse','patient','receptionist'].includes(user?.role) && (
                      <button onClick={() => navigate('/appointments')} className="btn btn-primary btn-sm">
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
