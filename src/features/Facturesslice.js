import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  factures: [],
  compteurFacture: 1, // Pour générer les numéros automatiquement
  tauxTVA: 20, // TVA par défaut 20%
};

const facturesSlice = createSlice({
  name: 'factures',
  initialState,
  reducers: {
    // Ajouter une facture
    addFacture: (state, action) => {
      const {
        type, // 'client' ou 'fournisseur'
        client,
        fournisseur,
        articles,
        dateFacture,
        dateEcheance,
        statut, // 'brouillon', 'envoyee', 'payee', 'annulee'
        notes,
        conditions,
      } = action.payload;

      // Calculer les totaux
      let totalHT = 0;
      let totalTVA = 0;

      const articlesAvecCalculs = articles.map(article => {
        const montantHT = article.quantite * article.prixUnitaire;
        const montantTVA = (montantHT * article.tauxTVA) / 100;
        const montantTTC = montantHT + montantTVA;

        totalHT += montantHT;
        totalTVA += montantTVA;

        return {
          ...article,
          montantHT,
          montantTVA,
          montantTTC,
        };
      });

      const totalTTC = totalHT + totalTVA;

      // Générer le numéro de facture
      const annee = new Date(dateFacture).getFullYear();
      const numeroFacture = `${annee}-${String(state.compteurFacture).padStart(4, '0')}`;

      const nouvelleFacture = {
        id: Date.now(),
        numero: numeroFacture,
        type,
        client: type === 'client' ? client : null,
        fournisseur: type === 'fournisseur' ? fournisseur : null,
        articles: articlesAvecCalculs,
        dateFacture: dateFacture || new Date().toISOString().split('T')[0],
        dateEcheance: dateEcheance || '',
        statut: statut || 'brouillon',
        notes: notes || '',
        conditions: conditions || '',
        totalHT,
        totalTVA,
        totalTTC,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
      };

      state.factures.push(nouvelleFacture);
      state.compteurFacture += 1;
    },

    // Modifier une facture
    updateFacture: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.factures.findIndex(f => f.id === id);

      if (index !== -1) {
        // Recalculer les totaux si les articles sont modifiés
        if (updates.articles) {
          let totalHT = 0;
          let totalTVA = 0;

          const articlesAvecCalculs = updates.articles.map(article => {
            const montantHT = article.quantite * article.prixUnitaire;
            const montantTVA = (montantHT * article.tauxTVA) / 100;
            const montantTTC = montantHT + montantTVA;

            totalHT += montantHT;
            totalTVA += montantTVA;

            return {
              ...article,
              montantHT,
              montantTVA,
              montantTTC,
            };
          });

          const totalTTC = totalHT + totalTVA;

          state.factures[index] = {
            ...state.factures[index],
            ...updates,
            articles: articlesAvecCalculs,
            totalHT,
            totalTVA,
            totalTTC,
            dateModification: new Date().toISOString(),
          };
        } else {
          state.factures[index] = {
            ...state.factures[index],
            ...updates,
            dateModification: new Date().toISOString(),
          };
        }
      }
    },

    // Supprimer une facture
    deleteFacture: (state, action) => {
      state.factures = state.factures.filter(f => f.id !== action.payload);
    },

    // Changer le statut d'une facture
    changeStatutFacture: (state, action) => {
      const { id, statut } = action.payload;
      const facture = state.factures.find(f => f.id === id);
      
      if (facture) {
        facture.statut = statut;
        facture.dateModification = new Date().toISOString();
        
        // Si payée, enregistrer la date de paiement
        if (statut === 'payee') {
          facture.datePaiement = new Date().toISOString().split('T')[0];
        }
      }
    },

    // Marquer comme payée
    marquerCommePaye: (state, action) => {
      const { id, datePaiement, modePaiement } = action.payload;
      const facture = state.factures.find(f => f.id === id);
      
      if (facture) {
        facture.statut = 'payee';
        facture.datePaiement = datePaiement || new Date().toISOString().split('T')[0];
        facture.modePaiement = modePaiement || 'especes';
        facture.dateModification = new Date().toISOString();
      }
    },

    // Envoyer la facture (changer statut de brouillon à envoyée)
    envoyerFacture: (state, action) => {
      const facture = state.factures.find(f => f.id === action.payload);
      
      if (facture && facture.statut === 'brouillon') {
        facture.statut = 'envoyee';
        facture.dateEnvoi = new Date().toISOString().split('T')[0];
        facture.dateModification = new Date().toISOString();
      }
    },

    // Annuler une facture
    annulerFacture: (state, action) => {
      const { id, motif } = action.payload;
      const facture = state.factures.find(f => f.id === id);
      
      if (facture) {
        facture.statut = 'annulee';
        facture.motifAnnulation = motif || '';
        facture.dateAnnulation = new Date().toISOString().split('T')[0];
        facture.dateModification = new Date().toISOString();
      }
    },

    // Dupliquer une facture
    dupliquerFacture: (state, action) => {
      const facture = state.factures.find(f => f.id === action.payload);
      
      if (facture) {
        const annee = new Date().getFullYear();
        const numeroFacture = `${annee}-${String(state.compteurFacture).padStart(4, '0')}`;

        const nouvelleFacture = {
          ...facture,
          id: Date.now(),
          numero: numeroFacture,
          statut: 'brouillon',
          dateFacture: new Date().toISOString().split('T')[0],
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString(),
          datePaiement: null,
          dateEnvoi: null,
          dateAnnulation: null,
        };

        state.factures.push(nouvelleFacture);
        state.compteurFacture += 1;
      }
    },

    // Changer le taux de TVA par défaut
    setTauxTVADefaut: (state, action) => {
      state.tauxTVA = action.payload;
    },
  },
});

export const {
  addFacture,
  updateFacture,
  deleteFacture,
  changeStatutFacture,
  marquerCommePaye,
  envoyerFacture,
  annulerFacture,
  dupliquerFacture,
  setTauxTVADefaut,
} = facturesSlice.actions;

export default facturesSlice.reducer;