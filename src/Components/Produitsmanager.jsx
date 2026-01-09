import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProduit, updateProduit, deleteProduit } from '../features/Produitsslice';
import { addTransaction } from '../features/Actifsslice';
import { Plus, Edit2, Trash2, Download, Search } from 'lucide-react';
import { formatCurrency, formatDate, exportToPDF, exportToCSV } from '../features/Helpers';

const Produitsmanager = () => {
  const dispatch = useDispatch();
  const produits = useSelector(state => state.produits?.items || []);
  const categories = useSelector(state => state.produits?.categories || ['Vente', 'Services', 'Autre']);

  const [formData, setFormData] = useState({
    categorie: '',
    montant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    compteRecu: 'caisse',
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

    if (editingId) {
      dispatch(updateProduit({ id: editingId, ...formData }));
      showToastMessage('Produit modifié avec succès', 'success');
      setEditingId(null);
    } else {
      dispatch(addProduit(formData));
      dispatch(addTransaction({
        type: 'entree',
        montant: formData.montant,
        compte: formData.compteRecu,
        description: `Produit: ${formData.categorie} - ${formData.description}`,
        date: formData.date,
      }));
      showToastMessage('Produit ajouté avec succès', 'success');
    }

    setFormData({
      categorie: '',
      montant: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      compteRecu: 'caisse',
    });
  };

  const handleEdit = (produit) => {
    setFormData(produit);
    setEditingId(produit.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      dispatch(deleteProduit(id));
      showToastMessage('Produit supprimé', 'success');
    }
  };

  const showToastMessage = (message, type) => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
  };

  const filteredProduits = useMemo(() => {
    return produits.filter(produit => {
      const matchSearch = produit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produit.categorie.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategorie = !filterCategorie || produit.categorie === filterCategorie;
      const matchDate = !filterDate || produit.date.startsWith(filterDate);
      return matchSearch && matchCategorie && matchDate;
    });
  }, [produits, searchTerm, filterCategorie, filterDate]);

  const totalProduits = filteredProduits.reduce((sum, produit) => sum + parseFloat(produit.montant), 0);

  const handleExportPDF = () => {
    const data = filteredProduits.map(produit => ({
      Date: formatDate(produit.date),
      Catégorie: produit.categorie,
      Description: produit.description,
      Montant: formatCurrency(produit.montant),
      'Reçu dans': produit.compteRecu,
    }));
    exportToPDF(data, 'Liste des Produits');
    showToastMessage('Export PDF réussi', 'success');
  };

  const handleExportCSV = () => {
    const data = filteredProduits.map(produit => ({
      Date: formatDate(produit.date),
      Categorie: produit.categorie,
      Description: produit.description,
      Montant: produit.montant,
      RecuDans: produit.compteRecu,
    }));
    exportToCSV(data, 'produits');
    showToastMessage('Export CSV réussi', 'success');
  };

  return (
    <div>
      {showToast.show && (
        <div className={`toast ${showToast.type}`}>
          {showToast.message}
        </div>
      )}

      <div className="form-section">
        <h3>{editingId ? '✏️ Modifier un Produit' : '➕ Ajouter un Produit'}</h3>
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
              <label>Reçu dans *</label>
              <select
                value={formData.compteRecu}
                onChange={(e) => setFormData({ ...formData, compteRecu: e.target.value })}
                required
              >
                <option value="caisse">💰 Caisse</option>
                <option value="banque">🏦 Banque</option>
                <option value="clients">👥 Clients</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails du revenu..."
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
                    compteRecu: 'caisse',
                  });
                }}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-section">
        <div className="table-header">
          <div>
            <h3>📜 Liste des Produits</h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.7, marginTop: '5px' }}>
              Total: {formatCurrency(totalProduits)}
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

        {filteredProduits.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Reçu dans</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProduits.map(produit => (
                <tr key={produit.id}>
                  <td>{formatDate(produit.date)}</td>
                  <td><span style={{ background: 'var(--success)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{produit.categorie}</span></td>
                  <td>{produit.description}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{formatCurrency(produit.montant)}</td>
                  <td>
                    {produit.compteRecu === 'caisse' && '💰 Caisse'}
                    {produit.compteRecu === 'banque' && '🏦 Banque'}
                    {produit.compteRecu === 'clients' && '👥 Clients'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(produit)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(produit.id)}>
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
            <h4>Aucun produit trouvé</h4>
            <p>Ajoutez votre premier produit ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Produitsmanager;