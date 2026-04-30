import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency } from '../utils/helpers';

const categories = ['tablet','capsule','syrup','injection','ointment','drops','inhaler','other'];

function ItemModal({ item, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState(item || { name:'',genericName:'',category:'tablet',manufacturer:'',quantity:0,unit:'units',purchasePrice:0,sellingPrice:0,reorderLevel:10,expiryDate:'',description:'' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (item?._id) {
        await api.put(`/inventory/${item._id}`, form);
        toast.success('Medicine updated');
      } else {
        await api.post('/inventory', form);
        toast.success('Medicine added to inventory');
      }
      onSaved();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{item?._id ? '✏️ Edit' : '➕ Add'} Medicine</h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Medicine Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Generic Name</label>
                <input className="form-control" value={form.genericName} onChange={e => setForm(f => ({ ...f, genericName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {categories.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Manufacturer</label>
                <input className="form-control" value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input className="form-control" type="number" min={0} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-control" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Price (₹)</label>
                <input className="form-control" type="number" min={0} value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (₹)</label>
                <input className="form-control" type="number" min={0} value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input className="form-control" type="number" min={0} value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input className="form-control" type="date" value={form.expiryDate ? form.expiryDate.split('T')[0] : ''} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><div className="spinner spinner-sm" />Saving...</> : '💾 Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [lowStock, setLowStock] = useState(false);

  const canEdit = ['admin','pharmacist'].includes(user?.role);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (catFilter) params.set('category', catFilter);
      if (lowStock) params.set('lowStock', 'true');
      const { data } = await api.get(`/inventory?${params}`);
      setItems(data.items);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  }, [search, catFilter, lowStock]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Medicine removed');
      fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  const isLow = (item) => item.quantity <= item.reorderLevel;
  const isExpiring = (item) => item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Inventory</h1><p>Manage medicines and medical supplies</p></div>
        {canEdit && <button onClick={() => setModal({})} className="btn btn-primary">+ Add Medicine</button>}
      </div>

      <div className="filter-bar">
        <div className="search-input" style={{ flex: 1, maxWidth: '300px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: '150px' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)', cursor: 'pointer' }}>
          <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)} />
          Low Stock Only
        </label>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty-state"><div className="icon">📦</div><h3>No medicines found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Purchase Price</th><th>Selling Price</th><th>Expiry</th><th>Status</th>{canEdit && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</div>
                      {item.genericName && <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{item.genericName}</div>}
                      {item.manufacturer && <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{item.manufacturer}</div>}
                    </td>
                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{item.category}</span></td>
                    <td>
                      <span style={{ fontWeight: '700', color: isLow(item) ? 'var(--danger)' : 'var(--gray-800)' }}>
                        {item.quantity} {item.unit}
                      </span>
                      {isLow(item) && <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: '600' }}>⚠ Low Stock</div>}
                    </td>
                    <td>{formatCurrency(item.purchasePrice)}</td>
                    <td>{formatCurrency(item.sellingPrice)}</td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: isExpiring(item) ? 'var(--warning)' : 'var(--gray-600)' }}>
                        {formatDate(item.expiryDate)}
                        {isExpiring(item) && ' ⚠'}
                      </span>
                    </td>
                    <td>
                      {isLow(item) ? <span className="badge badge-danger">Low</span> : <span className="badge badge-success">OK</span>}
                    </td>
                    {canEdit && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setModal(item)} className="btn btn-secondary btn-sm">Edit</button>
                          <button onClick={() => handleDelete(item._id)} className="btn btn-danger btn-sm">Delete</button>
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

      {modal !== null && <ItemModal item={modal._id ? modal : null} onClose={() => setModal(null)} onSaved={fetchItems} />}
    </div>
  );
}
