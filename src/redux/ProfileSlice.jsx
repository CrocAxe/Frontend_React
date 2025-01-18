import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  favorites: [],
  loading: false,
  error: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
      state.loading = false;
    },
    addToFavorites: (state, action) => {
      state.favorites.unshift(action.payload);
    },
    removeFromFavorites: (state, action) => {
      state.favorites = state.favorites.filter(fav => fav.id !== action.payload);
    },
    updateProfileData: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    }
  }
});

export const {
  setLoading,
  setError,
  setProfile,
  setFavorites,
  addToFavorites,
  removeFromFavorites,
  updateProfileData
} = profileSlice.actions;

export default profileSlice.reducer;