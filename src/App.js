import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from './features/Themeslice';
import Dashboard from './Components/Dashboard';
import ChargesManager from './Components/Chargesmanager';
import ProduitsManager from './Components/Produitsmanager';
import ActifsManager from './Components/Actifsmanager';
import Passifsmanager from './Components/Passifsmanager';

import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  CreditCard,
  Moon, 
  Sun,
  Menu,
  X
} from 'lucide-react';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Appliquer le thème
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '📊' },
    { id: 'actifs', label: 'Actifs', icon: Wallet, emoji: '💰' },
    { id: 'passifs', label: 'Passifs', icon: CreditCard, emoji: '💳' },
    { id: 'charges', label: 'Charges', icon: TrendingDown, emoji: '💸' },
    { id: 'produits', label: 'Produits', icon: TrendingUp, emoji: '💵' },
  ];

  const handleMenuClick = (viewId) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render la vue active
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'actifs':
        return <ActifsManager />;
      case 'passifs':
        return <Passifsmanager />;
      case 'charges':
        return <ChargesManager />;
      case 'produits':
        return <ProduitsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          background: 'linear-gradient(135deg, #2980b9, #3498db)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          display: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1>💼 ComptaApp</h1>
          <p>Gestion Comptable Pro</p>
        </div>

        <nav>
          <ul className="sidebar-menu">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={activeView === item.id ? 'active' : ''}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <Icon size={20} />
                    <span>{item.emoji} {item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="theme-toggle">
          <button onClick={() => dispatch(toggleTheme())}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'none'
          }}
        />
      )}

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;