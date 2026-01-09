import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  categories: ['Loyer', 'Salaire', 'Eau', 'Électricité', 'Transport', 'Achats', 'Autre'],
};

const chargesSlice = createSlice({
  name: 'charges',
  initialState,
  reducers: {
    addCharge: (state, action) => {
      state.items.push({
        id: Date.now(),
        ...action.payload,
        date: action.payload.date || new Date().toISOString(),
      });
    },
    updateCharge: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteCharge: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { addCharge, updateCharge, deleteCharge } = chargesSlice.actions;
export default chargesSlice.reducer;