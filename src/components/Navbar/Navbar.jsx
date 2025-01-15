import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);

    const cities = [
        "Johannesburg",
        "Cape Town",
        "Durban",
        "Pretoria",
        "Port Elizabeth",
        "Bloemfontein",
        "East London",
        "Pietermaritzburg",
        "Kimberley",
        "Polokwane"
    ];

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Filter cities based on the search query
        const filtered = cities.filter(city =>
            city.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCities(filtered);
    };

    const handleCitySelect = (city) => {
        setSearchQuery(city);
        setFilteredCities([]); // Clear the filtered list
        if (onSearch) {
            onSearch(city); // Trigger the search
        }
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchQuery);
        }
    };

    return (
        <div className="NavigationBar">
            <div className="logo">
                <h1>FinderFindr.</h1>
            </div>
            <div className="searchBar">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Search</button>

                {/* Display filtered cities */}
                {filteredCities.length > 0 && (
                    <ul className="search-results">
                        {filteredCities.map((city, index) => (
                            <li key={index} onClick={() => handleCitySelect(city)}>
                                {city}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="navControls">
                <button>Logout</button>
                <button>Profile</button>
            </div>
        </div>
    );
};

export default Navbar;