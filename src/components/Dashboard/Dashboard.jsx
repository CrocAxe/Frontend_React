import React, { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from '../Navbar/Navbar';
import axios from 'axios';
import './Dashboard.css';

const daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Dashboard = () => {
    const [location, setLocation] = useState('');
    const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay()); // Current day (0-6)
    const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayIndex);
    const [nextSevenDays, setNextSevenDays] = useState([]);
    const [recommendation, setRecommendations] = useState([]);
    const [weatherDetails, setWeatherDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: -26.2041, // Default to Johannesburg
        longitude: 28.0473,
        zoom: 10,
    });

    const mapboxAccessToken = "pk.eyJ1IjoiZWtzbnhpd2VuaSIsImEiOiJjbTV4bGs5eW8wY2Y5MnFzOXlvYjM0ZHE1In0.WrWrQXtJWZJx7frBMS16-g";
    const backendApiUrl = "http://localhost:5000/api"; // Update with your backend URL

    // Generate the next 7 days starting from today
    useEffect(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const dayIndex = (currentDayIndex + i) % 7;
            return daysOfTheWeek[dayIndex];
        });
        setNextSevenDays(days);
    }, [currentDayIndex]);

    // Fetch weather details by city name
    const fetchWeather = async (city) => {
        if (!city) return;
        setIsLoading(true);
        setError(null);
        try {
            const url = `${backendApiUrl}/location?city=${encodeURIComponent(city)}`;
            console.log('Fetching weather for city:', city, 'URL:', url); // Debugging
            const { data } = await axios.get(url);
            console.log('Weather API Response:', data); // Debugging
            if (data) {
                setWeatherDetails(data.forecast[selectedDayIndex]);
                setLocation(data.location.city);
                setViewState((prev) => ({
                    ...prev,
                    latitude: data.location.coordinates.latitude,
                    longitude: data.location.coordinates.longitude,
                    zoom: 12,
                }));
                setRecommendations(data.recommendedPlaces || []);
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            setError(error.response?.data?.error || 'Error fetching weather data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch weather details by coordinates
    const fetchWeatherByCoords = async (lat, lon) => {
        if (!lat || !lon) return;
        setIsLoading(true);
        setError(null);
        try {
            const url = `${backendApiUrl}/current-location?latitude=${lat}&longitude=${lon}`;
            console.log('Fetching weather by coordinates:', url); // Debugging
            const { data } = await axios.get(url);
            console.log('Weather by Coords API Response:', data); // Debugging
            if (data) {
                setWeatherDetails(data.forecast[selectedDayIndex]);
                setLocation(data.location.city || 'Current Location');
                setViewState((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon,
                    zoom: 12,
                }));
            }
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            setError('Error fetching weather data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle day selection
    const handleDayClick = (index) => {
        setSelectedDayIndex(index);
        if (location) {
            fetchWeather(location);
        }
    };

    // Handle search query
    const handleSearch = (query) => {
        console.log('Handling search for:', query); // Debugging
        fetchWeather(query);
    };

    // Fetch weather based on the current location
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    fetchWeatherByCoords(coords.latitude, coords.longitude);
                },
                () => {
                    setError('Unable to retrieve your location. Defaulting to Johannesburg.');
                    fetchWeather('Johannesburg');
                }
            );
        } else {
            setError('Geolocation is not supported by your browser. Defaulting to Johannesburg.');
            fetchWeather('Johannesburg');
        }
    };

    // Fetch weather on initial load
    useEffect(() => {
        handleCurrentLocation();
    }, []);

    return (
        <div className="dashboardContainer">
            <Navbar onSearch={handleSearch} />
            <div className="dashboardContainers">
                <div className="topContainer">
                    <div className="daysContainer">
                        {nextSevenDays.map((day, index) => (
                            <button
                                key={index}
                                className={`dayButton ${index === selectedDayIndex ? 'active' : ''}`}
                                onClick={() => handleDayClick(index)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                    <div className="weatherDetails">
                        {isLoading ? (
                            <p>Loading weather details...</p>
                        ) : error ? (
                            <p className="error">{error}</p>
                        ) : (
                            <>
                                <p>Weather details for {daysOfTheWeek[selectedDayIndex]} at {location}</p>
                                {weatherDetails && (
                                    <div>
                                        <p>Temperature: {weatherDetails.temp_min}°C - {weatherDetails.temp_max}°C</p>
                                        <p>Condition: {weatherDetails.description}</p>
                                        <p>Humidity: {weatherDetails.humidity}%</p>
                                        <p>Wind Speed: {weatherDetails.wind_speed} m/s</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="bottomContainer">
                    <Map
                        {...viewState}
                        onMove={(evt) => setViewState(evt.viewState)}
                        mapboxAccessToken={mapboxAccessToken}
                        style={{ width: '100%', height: '300px' }}
                        mapStyle="mapbox://styles/mapbox/outdoors-v12"
                    >
                        {location && (
                            <Marker latitude={viewState.latitude} longitude={viewState.longitude} anchor="bottom">
                                <button onClick={handleCurrentLocation}>Use Current Location</button>
                            </Marker>
                        )}
                    </Map>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;