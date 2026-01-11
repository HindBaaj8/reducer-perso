import { configureStore } from '@reduxjs/toolkit';
import capitauxReducer from './Capitauxslice';
import actifsReducer from './Actifsslice';
import passifsReducer from './Passifsslice';
import chargesReducer from './Chargesslice';
import produitsReducer from './Produitsslice';
import themeReducer from './Themeslice';
import facturesReducer from './Facturesslice';
import authReducer from './Authslice';

// Fonction pour charger l'état depuis localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('comptaApp_state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Erreur chargement state:', err);
    return undefined;
  }
};

// Fonction pour sauvegarder l'état dans localStorage
const saveStateToLocalStorage = (state) => {
  try {
    const { auth, ...stateToSave } = state;
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('comptaApp_state', serializedState);
  } catch (err) {
    console.error('Erreur sauvegarde state:', err);
  }
};

export const store = configureStore({
  reducer: {
    capitaux: capitauxReducer,
    actifs: actifsReducer,
    passifs: passifsReducer,
    charges: chargesReducer,
    produits: produitsReducer,
    theme: themeReducer,
    factures: facturesReducer,
    auth: authReducer,
  },
  preloadedState: loadStateFromLocalStorage(),
});

store.subscribe(() => {
  saveStateToLocalStorage(store.getState());
});

export default store;