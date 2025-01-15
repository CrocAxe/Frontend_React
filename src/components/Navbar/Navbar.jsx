import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchQuery);
        }
    };

    return (
        <div className="NavigationBar">
            <div className="logo">
                <h1>CrocAxe</h1>
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
            </div>
            <div className="navControls">
                <button>Logout</button>
                <button>Profile</button>
            </div>
        </div>
    );
};

export default Navbar;
