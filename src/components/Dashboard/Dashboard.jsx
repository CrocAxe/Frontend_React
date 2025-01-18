import { useState, useEffect } from 'react';

import Map, { Marker } from 'react-map-gl';
import { MapPin, Heart, X} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/AuthActions';
import { addFavoritePlace, removeFavoritePlace } from '../../redux/ProfileActions';
import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from '../Navbar/Navbar';
import Profile from '../Profile/Profile';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ setIsAuthenticated }) => {
    const dispatch = useDispatch();
    const { favorites } = useSelector(state => state.profile);
    const [location, setLocation] = useState(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [weekDays, setWeekDays] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [filteredRecommendations, setFilteredRecommendations] = useState([]);
    const [weatherDetails, setWeatherDetails] = useState(null);
    const [allWeatherData, setAllWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: -26.2041,
        longitude: 28.0473,
        zoom: 10,
    });
    // const [favorites, setFavorites] = useState([]); // New state to track favorites
    const [showProfile, setShowProfile] = useState(false);

    const handleShowProfile = () => {
        setShowProfile(!showProfile);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logout());
            setIsAuthenticated(false);
            
            
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const MAPBOX_TOKEN = "pk.eyJ1IjoiZWtzbnhpd2VuaSIsImEiOiJjbTV4bGs5eW8wY2Y5MnFzOXlvYjM0ZHE1In0.WrWrQXtJWZJx7frBMS16-g";
    const API_URL = "https://backend-node-thw6.onrender.com";

    useEffect(() => {
        const getFormattedDays = () => {
            return Array.from({ length: 7 }, (_, index) => {
                const date = new Date();
                date.setDate(date.getDate() + index);

                if (index === 0) return 'Today';
                if (index === 1) return 'Tomorrow';

                return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
            });
        };

        setWeekDays(getFormattedDays());
    }, []);

    useEffect(() => {
        if (allWeatherData && allWeatherData.forecast) {
            const weather = allWeatherData.forecast[selectedDayIndex];
            setWeatherDetails(weather);

            // Filter recommendations based on weather
            const filtered = recommendations.filter((place) => {
                if (weather.description.toLowerCase().includes('rain')) {
                    return place.category === 'Indoor';
                }
                return place.category === 'Outdoor';
            });

            if (filtered.length === 0) {
                console.warn("No recommendations matched the filter. Showing all.");
                setFilteredRecommendations(recommendations);
            } else {
                setFilteredRecommendations(filtered);
            }
        }
    }, [selectedDayIndex, allWeatherData, recommendations]);

    useEffect(() => {
        console.log('Current favorites:', favorites);
    }, [favorites]);

    const fetchWeatherData = async (url) => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(url);
            if (data) {
                setAllWeatherData(data);
                setWeatherDetails(data.forecast[selectedDayIndex]);
                setLocation(data.location.city);
                setViewState({
                    latitude: data.location.coordinates.latitude,
                    longitude: data.location.coordinates.longitude,
                    zoom: 12,
                });
                setRecommendations(data.recommendedPlaces || []);
                console.log("Recommendations fetched:", data.recommendedPlaces);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch weather data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query) => {
        if (!query) return;
        const url = `${API_URL}/api/location?city=${encodeURIComponent(query)}`;
        fetchWeatherData(url);
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const url = `${API_URL}/api/current-location?latitude=${latitude}&longitude=${longitude}`;
                fetchWeatherData(url);
            },
            () => {
                setError('Unable to retrieve your location');
                handleSearch('Johannesburg');
            }
        );
    };

    const handleDaySelect = (index) => {
        setSelectedDayIndex(index);
    };

    
    useEffect(() => {
        handleCurrentLocation();
    }, []);

    const handleFavoriteToggle = async (place) => {
        try {
            // Create an ID in the same format as the server
            const generateId = (name) => {
                return name.toLowerCase().replace(/\s+/g, '-');
            };
            
            const placeWithId = {
                ...place,
                id: place.id || generateId(place.name)
            };
            
            const isFavorite = favorites.some(fav => fav.id === generateId(place.name));
            
            if (isFavorite) {
                console.log('Removing favorite:', placeWithId.id);
                await dispatch(removeFavoritePlace(placeWithId.id));
            } else {
                console.log('Adding favorite:', placeWithId);
                await dispatch(addFavoritePlace(placeWithId));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <div className="dashboardContainer">
            <Navbar onSearch={handleSearch} onLogout={handleLogout}  onShowProfile={handleShowProfile}/>
            {showProfile ? (
                <div className="profile-modal">
                    <Profile />
                    
                </div>
            ) : (
            <div className="dashboardContent">
                <div className="daysContainer">
                    {weekDays.map((day, index) => (
                        <button
                            key={day}
                            onClick={() => handleDaySelect(index)}
                            className={`dayButton ${index === selectedDayIndex ? 'active' : ''}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="weatherInfo">
                    {isLoading ? (
                        <div className="loading">Loading weather information...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : weatherDetails && (
                        <div className="weatherDetails">
                            <h2>{location} - {weekDays[selectedDayIndex]}</h2>
                            <div className="weatherStats">
                                <p>Temperature: {weatherDetails.temp_min}°C - {weatherDetails.temp_max}°C</p>
                                <p>Condition: {weatherDetails.description}</p>
                                <p>Humidity: {weatherDetails.humidity}%</p>
                                <p>Wind Speed: {weatherDetails.wind_speed} m/s</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mapContainer">
                    <Map
                        {...viewState}
                        onMove={(evt) => setViewState(evt.viewState)}
                        mapboxAccessToken={MAPBOX_TOKEN}
                        style={{ width: '100%', height: '300px' }}
                        mapStyle="mapbox://styles/mapbox/outdoors-v12"
                    >
                        {location && (
                            <Marker latitude={viewState.latitude} longitude={viewState.longitude}>
                                <MapPin className="w-8 h-8 text-blue-500 cursor-pointer" />
                            </Marker>
                        )}

                        {filteredRecommendations.map((place, index) => (
                            <Marker
                                key={index}
                                latitude={place.coordinates.latitude}
                                longitude={place.coordinates.longitude}
                            >
                                <div
                                    onClick={() => setSelectedRecommendation(place)}
                                    className="cursor-pointer"
                                >
                                    <MapPin className="w-8 h-8 text-red-500" />
                                </div>
                            </Marker>
                        ))}
                    </Map>
                </div>

                {selectedRecommendation && (
                        <div className="modal" onClick={() => setSelectedRecommendation(null)}>
                            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                                <div className="modalHeader">
                                    <h3>{selectedRecommendation.name}</h3>
                                    <div className="modalActions">
                                    <button
                                        className="favoriteButton"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFavoriteToggle(selectedRecommendation);
                                        }}
                                    >
                                    <Heart
                                        className={`heart-icon ${
                                            favorites.some(fav => 
                                                fav.id === (selectedRecommendation.id || 
                                                `${selectedRecommendation.name}-${selectedRecommendation.coordinates.latitude}-${selectedRecommendation.coordinates.longitude}`)
                                            )
                                            ? 'heart-icon-favorited'
                                            : 'heart-icon-unfavorited'
                                        }`}
                                    />
                                    </button>
                                        <button
                                            className="closeButton"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRecommendation(null);
                                            }}
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="modalBody">
                                    <p>Category: {selectedRecommendation.category}</p>
                                    <p>Address: {selectedRecommendation.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* <div className="favoritesList">
                    <h3>Your Favorites</h3>
                    <ul>
                        {favorites.map((favorite, index) => (
                            <li key={index}>
                                <h4>{favorite.name}</h4>
                                <p>{favorite.address}</p>
                            </li>
                        ))}
                    </ul>
                </div> */}
            </div>
            )}
        </div>
    );
};

export default Dashboard;
