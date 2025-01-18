import { useState } from 'react';
import './Navbar.css';
import { LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/AuthActions';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

// eslint-disable-next-line react/prop-types
const Navbar = ({ onSearch, onLogout, onShowProfile }) => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);
    const [isSearching, setIsSearching] = useState(false); // Loading state for search

    const cities = [
        "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth",
        "Bloemfontein", "East London", "Pietermaritzburg", "Kimberley", "Polokwane"
    ];

    const handleLogout = async () => {
        try {
            await dispatch(logout()); // Dispatch the logout action
            console.log('User logged out successfully');
            if (onLogout) onLogout(); // Call the onLogout prop to update parent component
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        const filtered = cities.filter(city =>
            city.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCities(filtered);
    };

    // const handleCitySelect = (city) => {
    //     setSearchQuery(city);
    //     setFilteredCities([]);
    //     if (onSearch) onSearch(city);
    // };

    const handleSearch = () => {
        if (onSearch && searchQuery.trim()) {
            setIsSearching(true); // Start loading
            onSearch(searchQuery);
            setIsSearching(false); // Stop loading (assuming onSearch is async)
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
                    placeholder="Search for a city..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                </button>

                {filteredCities.length > 0 && (
                    <ul className="search-results">
                        {/* {filteredCities.map((city, index) => (
                            <li key={index} onClick={() => handleCitySelect(city)}>
                                {city}
                            </li>
                        ))} */}
                    </ul>
                )}
            </div>
            <div className="navControls">
                <button onClick={handleLogout} title="Logout">
                    <LogOut />
                </button>
                <button title="Profile" onClick={onShowProfile}>Profile</button>
            </div>
        </div>
    );
};

export default Navbar;