import { createSlice } from '@reduxjs/toolkit';

const USERS_KEY = 'comptaApp_users';
const CURRENT_USER_KEY = 'comptaApp_currentUser';

const loadUsers = () => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const loadCurrentUser = () => {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
};

const saveCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

const initialState = {
  users: loadUsers(),
  currentUser: loadCurrentUser(),
  isAuthenticated: !!loadCurrentUser(),
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (state, action) => {
      const user = action.payload;

      const exists = state.users.find(u => u.username === user.username);
      if (exists) {
        state.error = 'Username déjà utilisé';
        return;
      }

      const newUser = {
        id: Date.now(),
        username: user.username,
        password: user.password,
        nom: user.nom,
        email: user.email,
      };

      state.users.push(newUser);
      saveUsers(state.users);
      state.error = null;
    },

    login: (state, action) => {
      const { username, password } = action.payload;

      const user = state.users.find(
        u => u.username === username && u.password === password
      );

      if (!user) {
        state.error = 'Identifiants incorrects';
        state.isAuthenticated = false;
        return;
      }

      state.currentUser = user;
      state.isAuthenticated = true;
      state.error = null;
      saveCurrentUser(user);
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      saveCurrentUser(null);
    },
  },
});

export const { login, register, logout } = authSlice.actions;
export default authSlice.reducer;
