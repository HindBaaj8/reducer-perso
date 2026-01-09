import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPassif, deletePassif, payPassif } from '../features/Passifsslice';
import { formatCurrency, formatDate } from '../features/Helpers';
import { Plus, Trash2, DollarSign, AlertCircle } from 'lucide-react';

const Passifsmanager = () => {
  const dispatch = useDispatch();
  const { fournisseurs, dettes, tvaAPayer, items } = useSelector(state => state.passifs || {
    fournisseurs: 45000,
    dettes: 30000,
    tvaAPayer: 8000,
    items: []
  });

  const [formData, setFormData] = useState({
    type: 'fournisseurs',
    montant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.montant || !formData.description) {
      showToastMessage('Veuillez remplir tous les champs', 'error');
      return;
    }

    dispatch(addPassif(formData));
    showToastMessage('Passif ajouté avec succès', 'success');

    setFormData({
      type: 'fournisseurs',
      montant: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce passif ?')) {
      dispatch(deletePassif(id));
      showToastMessage('Passif supprimé', 'success');
    }
  };

  const handlePay = (id) => {
    const montant = prompt('Montant à payer :');
    if (montant && parseFloat(montant) > 0) {
      dispatch(payPassif({ id, montant: parseFloat(montant) }));
      showToastMessage('Paiement enregistré', 'success');
    }
  };

  const showToastMessage = (message, type) => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
  };

  const totalPassifs = fournisseurs + dettes + tvaAPayer;

  return (
    <div>
      {showToast.show && (
        <div className={`toast ${showToast.type}`}>
          {showToast.message}
        </div>
      )}

      {/* Vue d'ensemble */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card warning">
          <div className="kpi-label">
            <AlertCircle size={20} />
            📦 Fournisseurs
          </div>
          <div className="kpi-value">{formatCurrency(fournisseurs)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">
            <AlertCircle size={20} />
            💳 Dettes
          </div>
          <div className="kpi-value">{formatCurrency(dettes)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">
            <AlertCircle size={20} />
            📋 TVA à payer
          </div>
          <div className="kpi-value">{formatCurrency(tvaAPayer)}</div>
        </div>

        <div className="kpi-card danger">
          <div className="kpi-label">
            <AlertCircle size={20} />
            💰 Total Passifs
          </div>
          <div className="kpi-value">{formatCurrency(totalPassifs)}</div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="form-section">
        <h3>➕ Ajouter un Passif</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="fournisseurs">📦 Fournisseurs</option>
                <option value="dettes">💳 Dettes</option>
                <option value="tvaAPayer">📋 TVA à payer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Montant (MAD) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails du passif..."
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
            <Plus size={18} />
            Ajouter le Passif
          </button>
        </form>
      </div>

      {/* Liste des passifs */}
      <div className="table-section">
        <div className="table-header">
          <h3>📜 Liste des Passifs</h3>
        </div>

        {items && items.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...items].reverse().map(item => (
                <tr key={item.id}>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <span style={{ 
                      background: 'var(--warning)', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      {item.type === 'fournisseurs' && '📦 Fournisseurs'}
                      {item.type === 'dettes' && '💳 Dettes'}
                      {item.type === 'tvaAPayer' && '📋 TVA'}
                    </span>
                  </td>
                  <td>{item.description}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                    {formatCurrency(item.montant)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handlePay(item.id)}
                        style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}
                        title="Payer"
                      >
                        <DollarSign size={14} />
                        Payer
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <AlertCircle size={60} style={{ opacity: 0.3, margin: '0 auto 20px' }} />
            <h4>Aucun passif enregistré</h4>
            <p>Ajoutez votre premier passif ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Passifsmanager;