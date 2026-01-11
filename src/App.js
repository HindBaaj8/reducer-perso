import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from './features/Themeslice';
import { logout } from './features/Authslice';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Chargesmanager from './Components/Chargesmanager';
import Produitsmanager from './Components/Produitsmanager';
import Actifsmanager from './Components/Actifsmanager';
import Passifsmanager from './Components/Passifsmanager';
import Facturesmanager from './Components/Facturesmanager';
import { LogOut, User } from 'lucide-react';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated || false);
  const currentUser = useSelector(state => state.auth?.currentUser);
  
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
    { id: 'actifs', label: 'Actifs', emoji: '💰' },
    { id: 'passifs', label: 'Passifs', emoji: '💳' },
    { id: 'charges', label: 'Charges', emoji: '💸' },
    { id: 'produits', label: 'Produits', emoji: '💵' },
    { id: 'factures', label: 'Factures', emoji: '📄' },
  ];

  const handleMenuClick = (viewId) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
      dispatch(logout());
      setActiveView('dashboard');
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'actifs':
        return <Actifsmanager />;
      case 'passifs':
        return <Passifsmanager />;
      case 'charges':
        return <Chargesmanager />;
      case 'produits':
        return <Produitsmanager />;
      case 'factures':
        return <Facturesmanager />;
      default:
        return <Dashboard />;
    }
  };

  // 🔥 NOUVEAU: Si pas authentifié, montrer page login
  if (!isAuthenticated) {
    return <Login />;
  }

  // 🔥 Si authentifié, montrer l'app normale
  return (
    <div className="app-container">
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
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1>💼 ComptaApp</h1>
          <p>Gestion Comptable Pro</p>
        </div>

        {/* 🔥 NOUVEAU: Info utilisateur */}
        {currentUser && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            margin: '0 15px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              <User size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                {currentUser.nom}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                {currentUser.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
              </div>
            </div>
          </div>
        )}

        <nav>
          <ul className="sidebar-menu">
            {menuItems.map(item => {
              return (
                <li key={item.id}>
                  <button
                    className={activeView === item.id ? 'active' : ''}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <span>
                      <span role="img" aria-label={item.label}>{item.emoji}</span>
                      {' '}{item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="theme-toggle">
          <button onClick={() => dispatch(toggleTheme())}>
            {darkMode ? '☀️' : '🌙'}
            <span>{darkMode ? ' Mode Clair' : ' Mode Sombre'}</span>
          </button>
        </div>

        {/* 🔥 NOUVEAU: Bouton Déconnexion */}
        <div style={{ padding: '15px' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(231, 76, 60, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#c0392b'}
            onMouseOut={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.9)'}
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderView()}
      </main>

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

      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
    </div>
  );
}

export default App;