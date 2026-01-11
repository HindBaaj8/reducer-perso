import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fournisseurs: 45000,
  dettes: 30000,
  tvaAPayer: 8000,
  items: [],
};

const passifsSlice = createSlice({
  name: 'passifs',
  initialState,
  reducers: {
    addPassif: (state, action) => {
      const { type, montant, description, date } = action.payload;
      
      state.items.push({
        id: Date.now(),
        type,
        montant: parseFloat(montant),
        description,
        date: date || new Date().toISOString(),
      });

      state[type] += parseFloat(montant);
    },
    deletePassif: (state, action) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        state[item.type] -= item.montant;
        state.items = state.items.filter(i => i.id !== action.payload);
      }
    },
    updatePassifAmount: (state, action) => {
  const { type, montant } = action.payload;
  state[type] += montant;
    },
    payPassif: (state, action) => {
      const { id, montant } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        const payment = Math.min(parseFloat(montant), item.montant);
        item.montant -= payment;
        state[item.type] -= payment;
        
        if (item.montant <= 0) {
          state.items = state.items.filter(i => i.id !== id);
        }
      }
    },
  },
});

export const { addPassif, deletePassif, payPassif,updatePassifAmount } = passifsSlice.actions;
export default passifsSlice.reducer;