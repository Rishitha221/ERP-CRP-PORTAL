import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Printer } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const Challans = () => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create Challan State
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');

  const fetchChallans = async () => {
    try {
      const res = await api.get('/challans');
      setChallans(res.data.challans);
    } catch (err) {
      toast.error('Failed to fetch challans');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products')
      ]);
      setCustomers(custRes.data.customers);
      setProducts(prodRes.data.products);
    } catch (err) {
      toast.error('Failed to load customers and products');
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const handleCreateNew = () => {
    fetchFormOptions();
    setIsCreating(true);
  };

  const handleAddItem = () => {
    if (!selectedProduct || !itemQuantity) return;
    const product = products.find((p: any) => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    // Check if already in items
    if (items.find(i => i.productId === product.id)) {
      toast.error('Product already added');
      return;
    }

    setItems([...items, {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.unitPrice,
      quantity: parseInt(itemQuantity),
      total: product.unitPrice * parseInt(itemQuantity)
    }]);
    
    setSelectedProduct('');
    setItemQuantity('1');
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleSaveChallan = async (status: string) => {
    if (!selectedCustomer) return toast.error('Please select a customer');
    if (items.length === 0) return toast.error('Please add at least one item');
    
    try {
      await api.post('/challans', {
        customerId: parseInt(selectedCustomer),
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        status: status
      });
      toast.success(`Challan saved as ${status}`);
      setIsCreating(false);
      setSelectedCustomer('');
      setItems([]);
      fetchChallans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save challan');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Mark challan as ${newStatus}?`)) return;
    try {
      await api.patch(`/challans/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchChallans();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (isCreating) {
    const totalQty = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const grandTotal = items.reduce((acc, curr) => acc + curr.total, 0);

    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Create Sales Challan</h1>
            <p className="text-muted mt-1">Generate a new delivery challan for a customer.</p>
          </div>
          <button className="btn-secondary" onClick={() => setIsCreating(false)}>Back to List</button>
        </div>

        <div className="glass-panel" style={{padding: '2rem'}}>
          <div className="form-group" style={{maxWidth: '400px', marginBottom: '2rem'}}>
            <label>Select Customer *</label>
            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} required>
              <option value="">-- Choose Customer --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
              ))}
            </select>
          </div>

          <div style={{border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem'}}>
            <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Add Products</h3>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
              <div className="form-group" style={{flex: 2}}>
                <label>Product</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                  <option value="">-- Select Product --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku}) - ${p.unitPrice} - Stock: {p.currentStock}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Quantity</label>
                <input type="number" min="1" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} />
              </div>
              <button type="button" className="btn-primary" onClick={handleAddItem} style={{marginBottom: '2px'}}>Add to List</button>
            </div>

            {items.length > 0 && (
              <table className="data-table mt-4">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th className="text-right">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.productId}>
                      <td>
                        <div className="fw-bold">{item.name}</div>
                        <div className="text-muted small">{item.sku}</div>
                      </td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td className="fw-bold">${item.total.toFixed(2)}</td>
                      <td className="text-right">
                        <button className="action-btn delete" onClick={() => handleRemoveItem(item.productId)}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{background: 'var(--bg-main)'}}>
                    <td colSpan={2} className="fw-bold text-right">Grand Totals:</td>
                    <td className="fw-bold">{totalQty} Units</td>
                    <td className="fw-bold text-main" colSpan={2}>${grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
            <button className="btn-secondary" onClick={() => handleSaveChallan('DRAFT')}>Save as Draft</button>
            <button className="btn-primary success-bg" onClick={() => handleSaveChallan('CONFIRMED')}>Confirm Challan</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Challans</h1>
          <p className="text-muted mt-1">Manage product deliveries and dispatches.</p>
        </div>
        <button className="btn-primary hover-lift" onClick={handleCreateNew}>
          <Plus size={18} /> Create Challan
        </button>
      </div>
      <div className="glass-panel table-container">
        {loading ? <div className="loading-state">Loading challans...</div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan Info</th>
                <th>Customer Details</th>
                <th>Quantities</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.length > 0 ? (
                challans.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div className="fw-bold text-main">{c.challanNumber}</div>
                      <div className="text-muted small">{new Date(c.createdAt).toLocaleString()}</div>
                    </td>
                    <td>
                      <div className="fw-bold">{c.customer.name}</div>
                      <div className="text-muted small">{c.customer.mobile}</div>
                    </td>
                    <td><span className="badge">{c.totalQuantity} items</span></td>
                    <td>
                      <span className={`badge ${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    <td className="actions-cell text-right" style={{gap: '0.5rem', justifyContent: 'flex-end'}}>
                      {c.status === 'DRAFT' && (
                        <button className="action-btn success hover-scale" title="Confirm" onClick={() => handleUpdateStatus(c.id, 'CONFIRMED')}>Confirm</button>
                      )}
                      {c.status === 'CONFIRMED' && (
                        <button className="action-btn warning hover-scale" title="Cancel" onClick={() => handleUpdateStatus(c.id, 'CANCELLED')}>Cancel</button>
                      )}
                      <div style={{width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 4px'}}></div>
                      <button className="action-btn edit hover-scale" title="Print (Mock)"><Printer size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="empty-state">No sales challans found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Challans;
