import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCharge, updateCharge, deleteCharge } from '../features/Chargesslice';
import { addTransaction } from '../features/Actifsslice';
import { Plus, Edit2, Trash2, Download, Search } from 'lucide-react';
import { formatCurrency, formatDate, exportToPDF, exportToCSV } from '../features/Helpers';

const Chargesmanager = () => {
  const dispatch = useDispatch();
  const charges = useSelector(state => state.charges?.items || []);
  const categories = useSelector(state => state.charges?.categories || ['Loyer', 'Salaire', 'Eau', 'Électricité', 'Transport', 'Achats', 'Autre']);
  const { caisse, banque } = useSelector(state => state.actifs || { caisse: 0, banque: 0 });

  const [formData, setFormData] = useState({
    categorie: '',
    montant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    comptePaye: 'caisse',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.categorie || !formData.montant) {
      showToastMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const montant = parseFloat(formData.montant);
    const soldeDisponible = formData.comptePaye === 'caisse' ? caisse : banque;

    if (montant > soldeDisponible) {
      showToastMessage(`Solde insuffisant dans ${formData.comptePaye}`, 'error');
      return;
    }

    if (editingId) {
      dispatch(updateCharge({ id: editingId, ...formData }));
      showToastMessage('Charge modifiée avec succès', 'success');
      setEditingId(null);
    } else {
      dispatch(addCharge(formData));
      dispatch(addTransaction({
        type: 'sortie',
        montant: formData.montant,
        compte: formData.comptePaye,
        description: `Charge: ${formData.categorie} - ${formData.description}`,
        date: formData.date,
      }));
      showToastMessage('Charge ajoutée avec succès', 'success');
    }

    setFormData({
      categorie: '',
      montant: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      comptePaye: 'caisse',
    });
  };

  const handleEdit = (charge) => {
    setFormData(charge);
    setEditingId(charge.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) {
      dispatch(deleteCharge(id));
      showToastMessage('Charge supprimée', 'success');
    }
  };

  const showToastMessage = (message, type) => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
  };

  // Filtrage et recherche
  const filteredCharges = useMemo(() => {
    return charges.filter(charge => {
      const matchSearch = charge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charge.categorie.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategorie = !filterCategorie || charge.categorie === filterCategorie;
      const matchDate = !filterDate || charge.date.startsWith(filterDate);
      return matchSearch && matchCategorie && matchDate;
    });
  }, [charges, searchTerm, filterCategorie, filterDate]);

  const totalCharges = filteredCharges.reduce((sum, charge) => sum + parseFloat(charge.montant), 0);

  const handleExportPDF = () => {
    const data = filteredCharges.map(charge => ({
      Date: formatDate(charge.date),
      Catégorie: charge.categorie,
      Description: charge.description,
      Montant: formatCurrency(charge.montant),
      'Payé par': charge.comptePaye,
    }));
    exportToPDF(data, 'Liste des Charges');
    showToastMessage('Export PDF réussi', 'success');
  };

  const handleExportCSV = () => {
    const data = filteredCharges.map(charge => ({
      Date: formatDate(charge.date),
      Categorie: charge.categorie,
      Description: charge.description,
      Montant: charge.montant,
      PayePar: charge.comptePaye,
    }));
    exportToCSV(data, 'charges');
    showToastMessage('Export CSV réussi', 'success');
  };

  return (
    <div>
      {showToast.show && (
        <div className={`toast ${showToast.type}`}>
          {showToast.message}
        </div>
      )}

      {/* Formulaire */}
      <div className="form-section">
        <h3>{editingId ? '✏️ Modifier une Charge' : '➕ Ajouter une Charge'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Catégorie *</label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                required
              >
                <option value="">Sélectionner...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
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

            <div className="form-group">
              <label>Payé par *</label>
              <select
                value={formData.comptePaye}
                onChange={(e) => setFormData({ ...formData, comptePaye: e.target.value })}
                required
              >
                <option value="caisse">💰 Caisse ({formatCurrency(caisse)})</option>
                <option value="banque">🏦 Banque ({formatCurrency(banque)})</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails de la dépense..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} />
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    categorie: '',
                    montant: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    comptePaye: 'caisse',
                  });
                }}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste des charges */}
      <div className="table-section">
        <div className="table-header">
          <div>
            <h3>📜 Liste des Charges</h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.7, marginTop: '5px' }}>
              Total: {formatCurrency(totalCharges)}
            </p>
          </div>
          <div className="table-actions">
            <button className="btn btn-success" onClick={handleExportPDF}>
              <Download size={16} />
              PDF
            </button>
            <button className="btn btn-success" onClick={handleExportCSV}>
              <Download size={16} />
              CSV
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Catégorie</label>
            <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)}>
              <option value="">Toutes</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date</label>
            <input
              type="month"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Tableau */}
        {filteredCharges.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Payé par</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharges.map(charge => (
                <tr key={charge.id}>
                  <td>{formatDate(charge.date)}</td>
                  <td><span style={{ background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{charge.categorie}</span></td>
                  <td>{charge.description}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{formatCurrency(charge.montant)}</td>
                  <td>{charge.comptePaye === 'caisse' ? '💰 Caisse' : '🏦 Banque'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(charge)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(charge.id)}>
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
            <h4>Aucune charge trouvée</h4>
            <p>Ajoutez votre première charge ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chargesmanager;