import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  caisse: 50000,
  banque: 150000,
  clients: 80000,
  transactions: [],
};

const actifsSlice = createSlice({
  name: 'actifs',
  initialState,
  reducers: {
    
    addTransaction: (state, action) => {
      const { type, montant, compte, description, date } = action.payload;
      
      state.transactions.push({
        id: Date.now(),
        type,
        montant: parseFloat(montant),
        compte,
        description,
        date: date || new Date().toISOString().split('T')[0],
      });

      // Mise à jour du solde
      if (type === 'entree') {
        state[compte] += parseFloat(montant);
      } else {
        state[compte] -= parseFloat(montant);
      }
    },
    deleteTransaction: (state, action) => {
      const transaction = state.transactions.find(t => t.id === action.payload);
      if (transaction) {
        // Annuler la transaction
        if (transaction.type === 'entree') {
          state[transaction.compte] -= transaction.montant;
        } else {
          state[transaction.compte] += transaction.montant;
        }
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      }
    },
    updateSolde: (state, action) => {
      const { compte, montant } = action.payload;
      state[compte] = parseFloat(montant);
    },
  },
});

export const { addTransaction, deleteTransaction, updateSolde } = actifsSlice.actions;
export default actifsSlice.reducer;