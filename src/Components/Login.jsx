import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, register } from '../features/Authslice';
import { LogIn, UserPlus, Lock, User, Mail } from 'lucide-react';


const Login = () => {
  const dispatch = useDispatch();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nom: '',
    email: '',
  });
  const [error, setError] = useState('');

    const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
        setError('Veuillez remplir tous les champs');
        return;
    }

    dispatch(login({
        username: formData.username,
        password: formData.password
    }));
    };


  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password || !formData.nom || !formData.email) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Vérifier si username existe
    const users = JSON.parse(localStorage.getItem('comptaApp_users') || '[]');
    if (users.find(u => u.username === formData.username)) {
      setError('Ce nom d\'utilisateur existe déjà');
      return;
    }

    // S'inscrire
    dispatch(register(formData));
    
    // Connexion automatique après inscription
    setTimeout(() => {
      dispatch(login({ username: formData.username, password: formData.password }));
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💼 ComptaApp</h1>
          <p>Gestion Comptable Professionnelle</p>
        </div>

        <div className="login-tabs">
          <button 
            className={!isRegister ? 'active' : ''}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            <LogIn size={18} />
            Connexion
          </button>
          <button 
            className={isRegister ? 'active' : ''}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            <UserPlus size={18} />
            Inscription
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {!isRegister ? (
          // FORMULAIRE CONNEXION
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>
                <User size={18} />
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Entrez votre username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Entrez votre mot de passe"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-submit">
              <LogIn size={18} />
              Se connecter
            </button>

            <div className="info-box">
              <strong>👤 Compte de test:</strong><br />
              Username: <code>admin</code><br />
              Password: <code>admin123</code>
            </div>
          </form>
        ) : (
          // FORMULAIRE INSCRIPTION
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>
                <User size={18} />
                Nom complet
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Mohammed Alami"
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="exemple@email.com"
              />
            </div>

            <div className="form-group">
              <label>
                <User size={18} />
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choisissez un username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn-submit">
              <UserPlus size={18} />
              S'inscrire
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;