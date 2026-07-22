import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Home, Users, Package, Archive, FileText, Menu, X } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Archive size={20} /> },
    { name: 'Sales Challans', path: '/challans', icon: <FileText size={20} /> },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>ERP Portal</h2>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link to={item.path} key={item.name} className={`nav-item hover-lift ${isActive ? 'active' : ''}`}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn hover-lift">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar glass-panel">
          <button className="menu-btn hover-scale" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Menu />
          </button>
          <div className="user-profile">
            <div className="avatar">AD</div>
            <span>Admin User</span>
          </div>
        </header>
        
        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
