import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addFacture,
  updateFacture,
  deleteFacture,
  marquerCommePaye,
  envoyerFacture,
  annulerFacture,
  dupliquerFacture,
} from '../features/Facturesslice';
import { addTransaction } from '../features/Actifsslice';
import { formatCurrency, formatDate } from '../features/Helpers';
import { Plus, Edit2, Trash2, Search, Eye, Send, CheckCircle, XCircle, Copy } from 'lucide-react';

const Facturesmanager = () => {
  const dispatch = useDispatch();
  const factures = useSelector(state => state.factures?.factures || []);
  const tauxTVADefaut = useSelector(state => state.factures?.tauxTVA || 20);

  const [showModal, setShowModal] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [factureEnCours, setFactureEnCours] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [facturePreview, setFacturePreview] = useState(null);

  const [formData, setFormData] = useState({
    type: 'client',
    client: '',
    fournisseur: '',
    dateFacture: new Date().toISOString().split('T')[0],
    dateEcheance: '',
    statut: 'brouillon',
    notes: '',
    conditions: 'Paiement à 30 jours',
  });

  const [articles, setArticles] = useState([
    {
      designation: '',
      quantite: 1,
      prixUnitaire: 0,
      tauxTVA: tauxTVADefaut,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });

  // Ajouter un article
  const ajouterArticle = () => {
    setArticles([
      ...articles,
      {
        designation: '',
        quantite: 1,
        prixUnitaire: 0,
        tauxTVA: tauxTVADefaut,
      },
    ]);
  };

  // Supprimer un article
  const supprimerArticle = (index) => {
    const nouveauxArticles = articles.filter((_, i) => i !== index);
    setArticles(nouveauxArticles);
  };

  // Modifier un article
  const modifierArticle = (index, champ, valeur) => {
    const nouveauxArticles = [...articles];
    nouveauxArticles[index][champ] = valeur;
    setArticles(nouveauxArticles);
  };

  // Calculer les totaux
  const calculerTotaux = () => {
    let totalHT = 0;
    let totalTVA = 0;

    articles.forEach(article => {
      const montantHT = article.quantite * article.prixUnitaire;
      const montantTVA = (montantHT * article.tauxTVA) / 100;
      totalHT += montantHT;
      totalTVA += montantTVA;
    });

    const totalTTC = totalHT + totalTVA;

    return { totalHT, totalTVA, totalTTC };
  };

  const { totalHT, totalTVA, totalTTC } = calculerTotaux();

  // Soumettre la facture
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (formData.type === 'client' && !formData.client) {
      showToastMessage('Veuillez saisir le nom du client', 'error');
      return;
    }

    if (formData.type === 'fournisseur' && !formData.fournisseur) {
      showToastMessage('Veuillez saisir le nom du fournisseur', 'error');
      return;
    }

    if (articles.some(a => !a.designation || a.quantite <= 0 || a.prixUnitaire <= 0)) {
      showToastMessage('Veuillez remplir tous les articles correctement', 'error');
      return;
    }

    const factureData = {
      ...formData,
      articles,
    };

    if (modeEdition && factureEnCours) {
      dispatch(updateFacture({ id: factureEnCours.id, ...factureData }));
      showToastMessage('Facture modifiée avec succès', 'success');
    } else {
      dispatch(addFacture(factureData));
      
      // Si facture client payée, ajouter aux actifs
      if (formData.type === 'client' && formData.statut === 'payee') {
        dispatch(addTransaction({
          type: 'entree',
          montant: totalTTC,
          compte: 'caisse',
          description: `Paiement facture client: ${formData.client}`,
          date: formData.dateFacture,
        }));
      }

      showToastMessage('Facture créée avec succès', 'success');
    }

    fermerModal();
  };

  // Ouvrir le modal
  const ouvrirModal = (facture = null) => {
    if (facture) {
      setModeEdition(true);
      setFactureEnCours(facture);
      setFormData({
        type: facture.type,
        client: facture.client || '',
        fournisseur: facture.fournisseur || '',
        dateFacture: facture.dateFacture,
        dateEcheance: facture.dateEcheance,
        statut: facture.statut,
        notes: facture.notes,
        conditions: facture.conditions,
      });
      setArticles(facture.articles || []);
    } else {
      setModeEdition(false);
      setFactureEnCours(null);
      setFormData({
        type: 'client',
        client: '',
        fournisseur: '',
        dateFacture: new Date().toISOString().split('T')[0],
        dateEcheance: '',
        statut: 'brouillon',
        notes: '',
        conditions: 'Paiement à 30 jours',
      });
      setArticles([
        {
          designation: '',
          quantite: 1,
          prixUnitaire: 0,
          tauxTVA: tauxTVADefaut,
        },
      ]);
    }
    setShowModal(true);
  };

  // Fermer le modal
  const fermerModal = () => {
    setShowModal(false);
    setModeEdition(false);
    setFactureEnCours(null);
  };

  // Preview de la facture
  const previewFacture = (facture) => {
    setFacturePreview(facture);
    setShowPreview(true);
  };

  // Actions sur les factures
  const handleMarquerPaye = (id) => {
    const facture = factures.find(f => f.id === id);
    if (facture) {
      dispatch(marquerCommePaye({ id, datePaiement: new Date().toISOString().split('T')[0] }));
      
      // Ajouter aux actifs si c'est une facture client
      if (facture.type === 'client') {
        dispatch(addTransaction({
          type: 'entree',
          montant: facture.totalTTC,
          compte: 'caisse',
          description: `Paiement facture ${facture.numero}: ${facture.client}`,
          date: new Date().toISOString().split('T')[0],
        }));
      }
      
      showToastMessage('Facture marquée comme payée', 'success');
    }
  };

  const handleEnvoyer = (id) => {
    dispatch(envoyerFacture(id));
    showToastMessage('Facture envoyée', 'success');
  };

  const handleAnnuler = (id) => {
    const motif = prompt('Motif d\'annulation (optionnel):');
    dispatch(annulerFacture({ id, motif: motif || '' }));
    showToastMessage('Facture annulée', 'error');
  };

  const handleDupliquer = (id) => {
    dispatch(dupliquerFacture(id));
    showToastMessage('Facture dupliquée', 'success');
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      dispatch(deleteFacture(id));
      showToastMessage('Facture supprimée', 'success');
    }
  };

  const showToastMessage = (message, type) => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
  };

  // Filtrage
  const facturesFiltrees = useMemo(() => {
    return factures.filter(facture => {
      const matchSearch = facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (facture.client && facture.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (facture.fournisseur && facture.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = !filterType || facture.type === filterType;
      const matchStatut = !filterStatut || facture.statut === filterStatut;
      return matchSearch && matchType && matchStatut;
    });
  }, [factures, searchTerm, filterType, filterStatut]);

  // Statistiques
  const stats = useMemo(() => {
    const facturesClients = factures.filter(f => f.type === 'client');
    const facturesFournisseurs = factures.filter(f => f.type === 'fournisseur');
    
    const totalVentes = facturesClients.reduce((sum, f) => sum + f.totalTTC, 0);
    const totalAchats = facturesFournisseurs.reduce((sum, f) => sum + f.totalTTC, 0);
    
    const facetesEnAttente = factures.filter(f => f.statut === 'envoyee').length;
    const facetesPayees = factures.filter(f => f.statut === 'payee').length;

    return {
      totalVentes,
      totalAchats,
      facetesEnAttente,
      facetesPayees,
    };
  }, [factures]);

  const getStatutBadgeColor = (statut) => {
    switch (statut) {
      case 'brouillon': return '#95a5a6';
      case 'envoyee': return '#3498db';
      case 'payee': return '#27ae60';
      case 'annulee': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'brouillon': return '📝 Brouillon';
      case 'envoyee': return '📤 Envoyée';
      case 'payee': return '✅ Payée';
      case 'annulee': return '❌ Annulée';
      default: return statut;
    }
  };

  return (
    <div>
      {showToast.show && (
        <div className={`toast ${showToast.type}`}>
          {showToast.message}
        </div>
      )}

      {/* Statistiques */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card success">
          <div className="kpi-label">💰 Total Ventes</div>
          <div className="kpi-value">{formatCurrency(stats.totalVentes)}</div>
        </div>

        <div className="kpi-card danger">
          <div className="kpi-label">🛒 Total Achats</div>
          <div className="kpi-value">{formatCurrency(stats.totalAchats)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">⏳ En Attente</div>
          <div className="kpi-value">{stats.facetesEnAttente}</div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-label">✅ Payées</div>
          <div className="kpi-value">{stats.facetesPayees}</div>
        </div>
      </div>

      {/* Actions principales */}
      <div className="table-section">
        <div className="table-header">
          <h3>📄 Gestion des Factures</h3>
          <button className="btn btn-primary" onClick={() => ouvrirModal()}>
            <Plus size={16} />
            Nouvelle Facture
          </button>
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
            <label>Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Tous</option>
              <option value="client">Factures Clients</option>
              <option value="fournisseur">Factures Fournisseurs</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Statut</label>
            <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
              <option value="">Tous</option>
              <option value="brouillon">Brouillon</option>
              <option value="envoyee">Envoyée</option>
              <option value="payee">Payée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>

        {/* Liste des factures */}
        {facturesFiltrees.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Type</th>
                <th>Client/Fournisseur</th>
                <th>Date</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facturesFiltrees.map(facture => (
                <tr key={facture.id}>
                  <td style={{ fontWeight: 'bold' }}>{facture.numero}</td>
                  <td>
                    <span style={{ 
                      background: facture.type === 'client' ? 'var(--success)' : 'var(--warning)', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      {facture.type === 'client' ? '👤 Client' : '📦 Fournisseur'}
                    </span>
                  </td>
                  <td>{facture.client || facture.fournisseur}</td>
                  <td>{formatDate(facture.dateFacture)}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(facture.totalTTC)}
                  </td>
                  <td>
                    <span style={{ 
                      background: getStatutBadgeColor(facture.statut), 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      {getStatutLabel(facture.statut)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-edit" 
                        onClick={() => previewFacture(facture)}
                        title="Voir"
                        style={{ background: 'var(--info)' }}
                      >
                        <Eye size={14} />
                      </button>
                      
                      {facture.statut === 'brouillon' && (
                        <>
                          <button 
                            className="btn-edit" 
                            onClick={() => ouvrirModal(facture)}
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEnvoyer(facture.id)}
                            title="Envoyer"
                            style={{ background: 'var(--primary)' }}
                          >
                            <Send size={14} />
                          </button>
                        </>
                      )}
                      
                      {facture.statut === 'envoyee' && (
                        <button 
                          className="btn-edit" 
                          onClick={() => handleMarquerPaye(facture.id)}
                          title="Marquer comme payée"
                          style={{ background: 'var(--success)' }}
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      
                      <button 
                        className="btn-edit" 
                        onClick={() => handleDupliquer(facture.id)}
                        title="Dupliquer"
                        style={{ background: 'var(--warning)' }}
                      >
                        <Copy size={14} />
                      </button>
                      
                      {facture.statut !== 'annulee' && (
                        <button 
                          className="btn-delete" 
                          onClick={() => handleAnnuler(facture.id)}
                          title="Annuler"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(facture.id)}
                        title="Supprimer"
                      >
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
            <h4>Aucune facture trouvée</h4>
            <p>Créez votre première facture en cliquant sur "Nouvelle Facture"</p>
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="modal-overlay" onClick={fermerModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h3>{modeEdition ? '✏️ Modifier la Facture' : '➕ Nouvelle Facture'}</h3>
              <button className="modal-close" onClick={fermerModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Informations générales */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="client">Facture Client</option>
                    <option value="fournisseur">Facture Fournisseur</option>
                  </select>
                </div>

                {formData.type === 'client' ? (
                  <div className="form-group">
                    <label>Nom du Client *</label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="Ex: Mohammed Alami"
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Nom du Fournisseur *</label>
                    <input
                      type="text"
                      value={formData.fournisseur}
                      onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                      placeholder="Ex: Entreprise XYZ"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Date Facture *</label>
                  <input
                    type="date"
                    value={formData.dateFacture}
                    onChange={(e) => setFormData({ ...formData, dateFacture: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date Échéance</label>
                  <input
                    type="date"
                    value={formData.dateEcheance}
                    onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="envoyee">Envoyée</option>
                    <option value="payee">Payée</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Conditions de Paiement</label>
                  <input
                    type="text"
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    placeholder="Ex: Paiement à 30 jours"
                  />
                </div>
              </div>

              {/* Articles */}
              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>📦 Articles</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', marginBottom: '10px' }}>
                  <thead>
                    <tr style={{ background: 'var(--light)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Désignation</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '100px' }}>Qté</th>
                      <th style={{ padding: '10px', textAlign: 'right', width: '120px' }}>Prix Unit.</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '80px' }}>TVA %</th>
                      <th style={{ padding: '10px', textAlign: 'right', width: '120px' }}>Total HT</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '60px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article, index) => {
                      const totalLigne = article.quantite * article.prixUnitaire;
                      return (
                        <tr key={index}>
                          <td style={{ padding: '5px' }}>
                            <input
                              type="text"
                              value={article.designation}
                              onChange={(e) => modifierArticle(index, 'designation', e.target.value)}
                              placeholder="Description de l'article"
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                              required
                            />
                          </td>
                          <td style={{ padding: '5px' }}>
                            <input
                              type="number"
                              min="1"
                              value={article.quantite}
                              onChange={(e) => modifierArticle(index, 'quantite', parseFloat(e.target.value))}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'center' }}
                              required
                            />
                          </td>
                          <td style={{ padding: '5px' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={article.prixUnitaire}
                              onChange={(e) => modifierArticle(index, 'prixUnitaire', parseFloat(e.target.value))}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right' }}
                              required
                            />
                          </td>
                          <td style={{ padding: '5px' }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={article.tauxTVA}
                              onChange={(e) => modifierArticle(index, 'tauxTVA', parseFloat(e.target.value))}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'center' }}
                              required
                            />
                          </td>
                          <td style={{ padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>
                            {formatCurrency(totalLigne)}
                          </td>
                          <td style={{ padding: '5px', textAlign: 'center' }}>
                            {articles.length > 1 && (
                              <button
                                type="button"
                                onClick={() => supprimerArticle(index)}
                                style={{ 
                                  background: 'var(--danger)', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  padding: '5px 10px', 
                                  cursor: 'pointer' 
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={ajouterArticle}
                className="btn btn-secondary"
                style={{ marginBottom: '20px' }}
              >
                <Plus size={16} />
                Ajouter un article
              </button>

              {/* Totaux */}
              <div style={{ 
                background: 'var(--light)', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Total HT:</span>
                  <strong>{formatCurrency(totalHT)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Total TVA:</span>
                  <strong>{formatCurrency(totalTVA)}</strong>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '10px', 
                  borderTop: '2px solid var(--border)' 
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total TTC:</span>
                  <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>
                    {formatCurrency(totalTTC)}
                  </strong>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes additionnelles..."
                  rows="3"
                />
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {modeEdition ? 'Modifier' : 'Créer'} la Facture
                </button>
                <button type="button" className="btn btn-secondary" onClick={fermerModal}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {showPreview && facturePreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>👁️ Aperçu Facture {facturePreview.numero}</h3>
              <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
            </div>

            <div style={{ padding: '20px', background: 'white', color: '#000' }}>
              {/* En-tête facture */}
              <div style={{ marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>FACTURE {facturePreview.numero}</h2>
                <p style={{ margin: '10px 0 0 0' }}>
                  <strong>Date:</strong> {formatDate(facturePreview.dateFacture)}
                </p>
                {facturePreview.dateEcheance && (
                  <p style={{ margin: '5px 0 0 0' }}>
                    <strong>Échéance:</strong> {formatDate(facturePreview.dateEcheance)}
                  </p>
                )}
              </div>

              {/* Client/Fournisseur */}
              <div style={{ marginBottom: '30px' }}>
                <strong>{facturePreview.type === 'client' ? 'Client:' : 'Fournisseur:'}</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                  {facturePreview.client || facturePreview.fournisseur}
                </p>
              </div>

              {/* Articles */}
              <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #000' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Désignation</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Qté</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>P.U.</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>TVA</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {facturePreview.articles.map((article, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{article.designation}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{article.quantite}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(article.prixUnitaire)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{article.tauxTVA}%</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(article.montantHT)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div style={{ marginLeft: 'auto', width: '300px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                  <span>Total HT:</span>
                  <strong>{formatCurrency(facturePreview.totalHT)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                  <span>Total TVA:</span>
                  <strong>{formatCurrency(facturePreview.totalTVA)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '18px' }}>
                  <span>Total TTC:</span>
                  <span>{formatCurrency(facturePreview.totalTTC)}</span>
                </div>
              </div>

              {/* Conditions et notes */}
              {facturePreview.conditions && (
                <div style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                  <strong>Conditions:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>{facturePreview.conditions}</p>
                </div>
              )}

              {facturePreview.notes && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
                  <strong>Notes:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>{facturePreview.notes}</p>
                </div>
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturesmanager;