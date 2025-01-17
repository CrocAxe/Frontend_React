import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from '../Navbar/Navbar';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ setIsAuthenticated }) => {
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
    const [favorites, setFavorites] = useState([]); // New state to track favorites

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

    // New function to handle adding a recommendation to favorites
    const addToFavorites = (recommendation) => {
        setFavorites((prevFavorites) => [...prevFavorites, recommendation]);
    };

    useEffect(() => {
        handleCurrentLocation();
    }, []);

    return (
        <div className="dashboardContainer">
            <Navbar onSearch={handleSearch} onLogout={() => setIsAuthenticated(false)} />

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
                            <h3>{selectedRecommendation.name}</h3>
                            <p>Category: {selectedRecommendation.category}</p>
                            <p>Address: {selectedRecommendation.address}</p>
                            <button
                                onClick={() => setSelectedRecommendation(null)}
                                className="closeButton"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => addToFavorites(selectedRecommendation)}
                                className="addFavorites"
                            >
                                Add to Favorites
                            </button>
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
        </div>
    );
};

export default Dashboard;
