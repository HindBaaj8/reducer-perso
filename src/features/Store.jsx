import { configureStore } from '@reduxjs/toolkit';
import capitauxReducer from './Capitauxslice';
import actifsReducer from './Actifsslice';
import passifsReducer from './Passifsslice';
import chargesReducer from './Chargesslice';
import produitsReducer from './Produitsslice';
import themeReducer from './Themeslice';
export const store = configureStore({
  reducer: {
    capitaux: capitauxReducer,
    actifs: actifsReducer,
    passifs: passifsReducer,
    charges: chargesReducer,
    produits: produitsReducer,
    theme: themeReducer,
  },
});

export default store;