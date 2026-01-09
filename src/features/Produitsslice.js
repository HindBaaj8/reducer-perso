import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  categories: ['Vente', 'Services', 'Autre'],
};

const produitsSlice = createSlice({
  name: 'produits',
  initialState,
  reducers: {
    addProduit: (state, action) => {
      state.items.push({
        id: Date.now(),
        ...action.payload,
        date: action.payload.date || new Date().toISOString(),
      });
    },
    updateProduit: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteProduit: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { addProduit, updateProduit, deleteProduit } = produitsSlice.actions;
export default produitsSlice.reducer;