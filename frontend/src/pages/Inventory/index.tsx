import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';

const Inventory = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/inventory/logs');
        setLogs(res.data.logs);
      } catch (err) {
        toast.error('Failed to fetch inventory logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Logs</h1>
      </div>
      <div className="glass-panel table-container">
        {loading ? <div className="loading-state">Loading...</div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log.id}>
                    <td>{log.product.name} ({log.product.sku})</td>
                    <td><span className={`badge ${log.type.toLowerCase() === 'in' ? 'success' : 'danger'}`}>{log.type}</span></td>
                    <td>{log.quantity}</td>
                    <td>{log.reason || '-'}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="empty-state">No movement logs found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
