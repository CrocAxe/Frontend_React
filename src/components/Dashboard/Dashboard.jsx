import React, { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Navbar from '../navbar/Navbar';
import axios from 'axios';
import './Dashboard.css';

const daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Dashboard = () => {
    const [location, setLocation] = useState('');
    const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay());  // Current day (0-6)
    const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayIndex);
    const [nextSevenDays, setNextSevenDays] = useState([]);
    const [weatherDetails, setWeatherDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: 48.883955, // Default coordinates (Paris)
        longitude: 2.349715, // Default coordinates (Paris)
        zoom: 10,
    });

    // Generate the next 7 days starting from today
    useEffect(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const dayIndex = (currentDayIndex + i) % 7;
            return daysOfTheWeek[dayIndex];
        });
        setNextSevenDays(days);
    }, [currentDayIndex]);

    // Fetch weather details by city name
    const fetchWeather = async (city, dayIndex) => {
        if (!city) return;
        setIsLoading(true);
        setError(null);  // Clear previous error
        try {
            const { data } = await axios.get(`http://localhost:5000/api/weather?city=${city}&day=${dayIndex}`);
            if (data) {
                setWeatherDetails(data);
                setLocation(data.location);
                setViewState(prev => ({
                    ...prev,
                    latitude: data.coordinates?.lat || prev.latitude,
                    longitude: data.coordinates?.lng || prev.longitude,
                    zoom: 12,
                }));
            }
        } catch (error) {
            setError('Error fetching weather data. Please try again later.');
            console.error('Error fetching weather:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch weather details by coordinates
    const fetchWeatherByCoords = async (lat, lon, dayIndex) => {
        if (!lat || !lon) return;
        setIsLoading(true);
        setError(null);  // Clear previous error
        try {
            const { data } = await axios.get(`http://localhost:5000/api/weather?lat=${lat}&lon=${lon}&day=${dayIndex}`);
            if (data) {
                setWeatherDetails(data);
                setLocation(data.location);
                setViewState(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon,
                    zoom: 12,
                }));
            }
        } catch (error) {
            setError('Error fetching weather data. Please try again later.');
            console.error('Error fetching weather by coordinates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDayClick = (index) => {
        setSelectedDayIndex(index);
        fetchWeather(location, index);
    };

    const handleSearch = (query) => {
        fetchWeather(query, selectedDayIndex);
    };

    // Fetch weather based on the current location
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    fetchWeatherByCoords(coords.latitude, coords.longitude, currentDayIndex);
                },
                () => {
                    // If geolocation fails or is denied, use default location (Johannesburg)
                    setError('Unable to retrieve your location. Defaulting to Johannesburg.');
                    fetchWeather('Johannesburg', currentDayIndex);
                }
            );
        } else {
            // If geolocation is not supported, use default location (Johannesburg)
            setError('Geolocation is not supported by your browser. Defaulting to Johannesburg.');
            fetchWeather('Johannesburg', currentDayIndex);
        }
    };

    // Check user's geolocation on initial load
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    fetchWeatherByCoords(coords.latitude, coords.longitude, currentDayIndex);
                },
                () => {
                    // If geolocation fails or is denied, use default location (Johannesburg)
                    setError('Unable to retrieve your location. Defaulting to Johannesburg.');
                    fetchWeather('Johannesburg', currentDayIndex);
                }
            );
        } else {
            // If geolocation is not supported, use default location (Johannesburg)
            setError('Geolocation is not supported by your browser. Defaulting to Johannesburg.');
            fetchWeather('Johannesburg', currentDayIndex);
        }
    }, [currentDayIndex]);

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
                                        <p>Temperature: {weatherDetails.temperature}°C</p>
                                        <p>Condition: {weatherDetails.description}</p>
                                        <p>Humidity: {weatherDetails.humidity}%</p>
                                        <p>Wind Speed: {weatherDetails.windSpeed} m/s</p>
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
                        mapboxAccessToken="pk.eyJ1IjoiZWtzbnhpd2VuaSIsImEiOiJjbTV4bGs5eW8wY2Y5MnFzOXlvYjM0ZHE1In0.WrWrQXtJWZJx7frBMS16-g"
                        style={{ width: '100%', height: '300px' }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
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
