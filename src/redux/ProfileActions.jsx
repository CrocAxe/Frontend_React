import axios from 'axios';
import { 
  setLoading, 
  setError, 
  setProfile, 
  setFavorites,
  addToFavorites,
  removeFromFavorites,
  updateProfileData
} from './ProfileSlice';

const API_URL = 'https://backend-node-thw6.onrender.com';

export const fetchProfile = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.get(`${API_URL}/profile/get-profile`);
    dispatch(setProfile(response.data.profile));
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to fetch profile'));
  }
};

export const updateProfile = (profileData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post(`${API_URL}/profile/update-profile`, profileData);
    dispatch(updateProfileData(profileData));
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to update profile'));
    throw error;
  }
};

export const updateProfileImage = (imageData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post(`${API_URL}/profile/update-profile`, imageData);
    dispatch(updateProfileData({ photoURL: imageData.photoURL }));
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to update profile image'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchFavorites = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.get(`${API_URL}/profile/favorites`);
    dispatch(setFavorites(response.data.favorites));
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to fetch favorites'));
  }
};

export const addFavoritePlace = (place) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post(`${API_URL}/profile/add-favorites`, { place });
    dispatch(addToFavorites(response.data.addedPlace));
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to add favorite'));
    throw error;
  }
};

export const removeFavoritePlace = (placeId) => async (dispatch) => {
  try {
      dispatch(setLoading(true));
      // Even if the API call fails, we'll update the local state
      dispatch(removeFromFavorites(placeId));
      try {
          await axios.delete(`${API_URL}/profile/favorites/${placeId}`);
      } catch (apiError) {
          console.error('API error:', apiError);
          
      }
  } catch (error) {
      dispatch(setError(error.response?.data?.error || 'Failed to remove favorite'));
      throw error;
  } finally {
      dispatch(setLoading(false));
  }
};