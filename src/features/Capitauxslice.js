import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  capitalInitial: 100000,
  resultat: 0,
};

const capitauxSlice = createSlice({
  name: 'capitaux',
  initialState,
  reducers: {
    setCapitalInitial: (state, action) => {
      state.capitalInitial = action.payload;
    },
    updateResultat: (state, action) => {
      state.resultat = action.payload;
    },
  },
});

export const { setCapitalInitial, updateResultat } = capitauxSlice.actions;
export default capitauxSlice.reducer;