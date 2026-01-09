import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTransaction, deleteTransaction } from '../features/Actifsslice';
import { formatCurrency, formatDate, exportToPDF } from '../features/Helpers';
import { Plus, Trash2, Download, TrendingUp, TrendingDown } from 'lucide-react';

const Actifsmanager = () => {
  const dispatch = useDispatch();
  const { caisse, banque, clients, transactions } = useSelector(state => state.actifs || {
    caisse: 50000,
    banque: 150000,
    clients: 80000,
    transactions: []
  });

  const [formData, setFormData] = useState({
    type: 'entree',
    montant: '',
    compte: 'caisse',
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

    const montant = parseFloat(formData.montant);
    const solde = formData.compte === 'caisse' ? caisse : formData.compte === 'banque' ? banque : clients;

    if (formData.type === 'sortie' && montant > solde) {
      showToastMessage(`Solde insuffisant dans ${formData.compte}`, 'error');
      return;
    }

    dispatch(addTransaction(formData));
    showToastMessage(`Transaction ${formData.type === 'entree' ? 'ajoutée' : 'effectuée'} avec succès`, 'success');

    setFormData({
      type: 'entree',
      montant: '',
      compte: 'caisse',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette transaction ?')) {
      dispatch(deleteTransaction(id));
      showToastMessage('Transaction annulée', 'success');
    }
  };

  const showToastMessage = (message, type) => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleExportPDF = () => {
    const data = transactions.map(t => ({
      Date: formatDate(t.date),
      Type: t.type === 'entree' ? 'Entrée' : 'Sortie',
      Compte: t.compte,
      Description: t.description,
      Montant: formatCurrency(t.montant),
    }));
    exportToPDF(data, 'Historique des Transactions');
    showToastMessage('Export PDF réussi', 'success');
  };

  return (
    <div>
      {showToast.show && (
        <div className={`toast ${showToast.type}`}>
          {showToast.message}
        </div>
      )}

      {/* Soldes actuels */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card">
          <div className="kpi-label">💰 Caisse</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{formatCurrency(caisse)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">🏦 Banque</div>
          <div className="kpi-value" style={{ color: 'var(--secondary)' }}>{formatCurrency(banque)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">👥 Clients (Créances)</div>
          <div className="kpi-value" style={{ color: 'var(--info)' }}>{formatCurrency(clients)}</div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-label">📊 Total Actifs</div>
          <div className="kpi-value">{formatCurrency(caisse + banque + clients)}</div>
        </div>
      </div>

      {/* Formulaire de transaction */}
      <div className="form-section">
        <h3>➕ Nouvelle Transaction</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Type de transaction *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="entree">💵 Entrée</option>
                <option value="sortie">💸 Sortie</option>
              </select>
            </div>

            <div className="form-group">
              <label>Compte *</label>
              <select
                value={formData.compte}
                onChange={(e) => setFormData({ ...formData, compte: e.target.value })}
                required
              >
                <option value="caisse">💰 Caisse ({formatCurrency(caisse)})</option>
                <option value="banque">🏦 Banque ({formatCurrency(banque)})</option>
                <option value="clients">👥 Clients ({formatCurrency(clients)})</option>
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
                placeholder="Détails de la transaction..."
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
            <Plus size={18} />
            Enregistrer la transaction
          </button>
        </form>
      </div>

      {/* Historique */}
      <div className="table-section">
        <div className="table-header">
          <h3>📜 Historique des Transactions</h3>
          <button className="btn btn-success" onClick={handleExportPDF}>
            <Download size={16} />
            Exporter PDF
          </button>
        </div>

        {transactions && transactions.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Compte</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...transactions].reverse().map(transaction => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    {transaction.type === 'entree' ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <TrendingUp size={16} />
                        Entrée
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <TrendingDown size={16} />
                        Sortie
                      </span>
                    )}
                  </td>
                  <td>
                    {transaction.compte === 'caisse' && '💰 Caisse'}
                    {transaction.compte === 'banque' && '🏦 Banque'}
                    {transaction.compte === 'clients' && '👥 Clients'}
                  </td>
                  <td>{transaction.description}</td>
                  <td style={{ 
                    color: transaction.type === 'entree' ? 'var(--success)' : 'var(--danger)', 
                    fontWeight: 'bold' 
                  }}>
                    {transaction.type === 'entree' ? '+' : '-'}{formatCurrency(transaction.montant)}
                  </td>
                  <td>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(transaction.id)}
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h4>Aucune transaction</h4>
            <p>Commencez par enregistrer votre première transaction</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Actifsmanager;