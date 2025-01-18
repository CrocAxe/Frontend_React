import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, X } from 'lucide-react';
import { 
  fetchProfile, 
  updateProfile, 
  fetchFavorites,
  updateProfileImage,
  removeFavoritePlace
} from '../../redux/ProfileActions';
import './Profile.css'

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, favorites, loading } = useSelector(state => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });
  
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(formData));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRemoveFavorite = async (placeId) => {
    try {
      await dispatch(removeFavoritePlace(placeId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      if (!file.type.match(/image.*/)) {
        alert('Please upload an image file');
        return;
      }

      const base64Image = await convertToBase64(file);
      await dispatch(updateProfileImage({ photoURL: base64Image }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  if (loading || !profile) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <h1 className="profile-title">PROFILE</h1>
            <button
              onClick={isEditing ? handleSave : handleEdit}
              className="edit-button"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-image-container">
              <div className="profile-image">
                <img
                  src={profile.photoURL || '/api/placeholder/128/128'}
                  alt="Profile"
                />
              </div>
              <label className="camera-button">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="profile-details">
              <div className="profile-field">
                <label className="field-label">User Name</label>
                {isEditing ? (
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <p className="field-value">{profile.name}</p>
                )}
              </div>
              
              <div className="profile-field">
                <label className="field-label">Email</label>
                <p className="field-value">{profile.email}</p>
              </div>

              <div className="profile-field">
                <label className="field-label">Phone</label>
                {isEditing ? (
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <p className="field-value">{profile.phone}</p>
                )}
              </div>

              <div className="profile-field">
                <label className="field-label">Location</label>
                {isEditing ? (
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <p className="field-value">{profile.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="favorites-section">
          <h2 className="favorites-title">MY FAVORITES</h2>
          {favorites.length === 0 ? (
            <p className="field-value">No favorite places yet.</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map(place => (
                <div key={place.id} className="favorite-card">
                  <div className="favorite-card-header">
                    <h3 className="favorite-name">{place.name}</h3>
                    <button
                      onClick={() => handleRemoveFavorite(place.id)}
                      className="remove-favorite-button"
                      aria-label="Remove favorite"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="favorite-details">{place.category}</p>
                  <p className="favorite-details">{place.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;