import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockType, setStockType] = useState('IN');
  const [stockQty, setStockQty] = useState('');
  const [stockReason, setStockReason] = useState('');

  const initialForm = { name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStock: '', location: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.products);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        currentStock: parseInt(formData.currentStock) || 0,
        minStock: parseInt(formData.minStock) || 0
      });
      toast.success('Product added successfully');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await api.post('/inventory/movement', {
        productId: selectedProduct.id,
        quantity: parseInt(stockQty),
        type: stockType,
        reason: stockReason
      });
      toast.success(`Stock recorded successfully`);
      setIsStockModalOpen(false);
      setStockQty('');
      setStockReason('');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const openStockModal = (product: any, type: string) => {
    setSelectedProduct(product);
    setStockType(type);
    setIsStockModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Inventory</h1>
          <p className="text-muted mt-1">Manage products, locations, and stock levels.</p>
        </div>
        <button className="btn-primary hover-lift" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="glass-panel table-container">
        {loading ? <div className="loading-state">Loading inventory...</div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock Level</th>
                <th>Location</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-bold text-main">{p.name}</div>
                      <div className="text-muted small">SKU: {p.sku}</div>
                    </td>
                    <td><span className="badge">{p.category || 'Uncategorized'}</span></td>
                    <td className="fw-bold">${p.unitPrice.toFixed(2)}</td>
                    <td>
                      <div className={p.currentStock <= p.minStock ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                        {p.currentStock} Units
                      </div>
                      <div className="text-muted small">Min: {p.minStock}</div>
                    </td>
                    <td>{p.location || '-'}</td>
                    <td className="actions-cell text-right" style={{gap: '0.5rem', justifyContent: 'flex-end'}}>
                      <button className="action-btn success hover-scale" title="Stock IN" onClick={() => openStockModal(p, 'IN')}><ArrowUpRight size={16} /></button>
                      <button className="action-btn warning hover-scale" title="Stock OUT" onClick={() => openStockModal(p, 'OUT')}><ArrowDownRight size={16} /></button>
                      <div style={{width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 4px'}}></div>
                      <button className="action-btn edit hover-scale" title="Edit"><Edit size={16} /></button>
                      <button className="action-btn delete hover-scale" title="Delete" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="empty-state">No products found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large glass-panel animate-scale-in">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Product Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ultra HD Monitor" />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. MON-4K-001" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Electronics" />
                </div>
                <div className="form-group">
                  <label>Unit Price ($) *</label>
                  <input required type="number" step="0.01" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Location / Bin</label>
                  <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Aisle 4, Shelf 2" />
                </div>
                <div className="form-group">
                  <label>Initial Stock *</label>
                  <input required type="number" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Minimum Stock Level</label>
                  <input required type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} placeholder="Alert threshold" />
                </div>
              </div>
              
              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {isStockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-scale-in">
            <div className="modal-header">
              <h2>Record Stock {stockType}</h2>
              <button className="close-btn" onClick={() => setIsStockModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleStockUpdate} className="modal-form">
              <p className="text-muted">Product: <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku})</p>
              
              <div className="form-group mt-1">
                <label>Quantity to {stockType === 'IN' ? 'Add' : 'Remove'} *</label>
                <input required type="number" min="1" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Reason / Reference (Optional)</label>
                <input value={stockReason} onChange={e => setStockReason(e.target.value)} placeholder={stockType === 'IN' ? "e.g. Supplier delivery" : "e.g. Damaged goods"} />
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
                <button type="submit" className={`btn-primary ${stockType === 'OUT' ? 'danger-bg' : 'success-bg'}`}>
                  Confirm {stockType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
