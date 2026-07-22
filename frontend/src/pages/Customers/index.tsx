import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, MoreVertical } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialForm = {
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gst: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
    notes: ''
  };
  
  const [formData, setFormData] = useState(initialForm);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data.customers);
    } catch (err) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
      };
      await api.post('/customers', payload);
      toast.success('Customer added successfully');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers CRM</h1>
          <p className="text-muted mt-1">Manage your customer relationships and details.</p>
        </div>
        <button className="btn-primary hover-lift" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          New Customer
        </button>
      </div>

      <div className="glass-panel table-container">
        <div className="table-actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name, company or mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading CRM data...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Info</th>
                <th>Business Details</th>
                <th>Contact</th>
                <th>Type / Status</th>
                <th>Follow Up</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div className="fw-bold text-main">{c.name}</div>
                      <div className="text-muted small">Added: {new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div>{c.businessName || '-'}</div>
                      <div className="text-muted small">{c.gst ? `GST: ${c.gst}` : ''}</div>
                    </td>
                    <td>
                      <div>{c.mobile}</div>
                      <div className="text-muted small">{c.email}</div>
                    </td>
                    <td>
                      <div style={{marginBottom: '4px'}}><span className={`badge ${c.customerType.toLowerCase()}`}>{c.customerType}</span></div>
                      <div><span className={`status-dot ${c.status.toLowerCase()}`}>{c.status}</span></div>
                    </td>
                    <td>
                      <div className={c.followUpDate && new Date(c.followUpDate) < new Date() ? 'text-danger fw-bold' : ''}>
                        {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : 'None'}
                      </div>
                    </td>
                    <td className="actions-cell text-right">
                      <button className="action-btn edit hover-scale" title="Edit"><Edit size={16} /></button>
                      <button className="action-btn delete hover-scale" title="Delete" onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-state">No customers found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large glass-panel animate-scale-in">
            <div className="modal-header">
              <h2>Add New Customer</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="e.g. +91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Business Name</label>
                  <input value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="e.g. Acme Corp" />
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input value={formData.gst} onChange={e => setFormData({...formData, gst: e.target.value})} placeholder="Optional GSTIN" />
                </div>
                <div className="form-group">
                  <label>Customer Type</label>
                  <select value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})}>
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input type="date" value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Billing Address</label>
                <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full physical address..."></textarea>
              </div>
              
              <div className="form-group full-width">
                <label>Additional Notes</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any special requirements or history..."></textarea>
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
