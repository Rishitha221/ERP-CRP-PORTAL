import { useState, useEffect } from 'react';
import './Dashboard.css';
import api from '../services/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    pendingChallans: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      
      {loading ? (
        <div className="loading-state">Loading stats...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card glass-panel hover-lift">
            <h3>Total Customers</h3>
            <p className="stat-value">{stats.totalCustomers}</p>
          </div>
          <div className="stat-card glass-panel hover-lift">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
          <div className="stat-card glass-panel hover-lift">
            <h3>Pending Challans</h3>
            <p className="stat-value">{stats.pendingChallans}</p>
          </div>
          <div className="stat-card glass-panel hover-lift">
            <h3>Low Stock Items</h3>
            <p className="stat-value warning">{stats.lowStockItems}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
