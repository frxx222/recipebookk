import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./navbar";
import MyFavorite from "../../pages/myFavorite";
import './dataForm.css'

const API_URL = 'https://aesthetic-elf-6dbaed.netlify.app/.netlify/functions/api/';

function DataForm() {
    const [data, setData] = useState([]);
    const [name, setName] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [error, setError] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [heartStates, setHeartStates] = useState({});
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [selectedCuisine, setSelectedCuisine] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission
        if (!name || !ingredients || !cuisine) {
            setError('Name, ingredients, and cuisine are required');
            return;
        }
        try {
            const method = editItem ? 'put' : 'post';
            const url = editItem ? `${API_URL}/${editItem._id}` : API_URL;
            const response = await axios[method](url, { name, ingredients, cuisine });
            // Reset form input fields
            setName('');
            setIngredients('');
            setCuisine('');
            setEditItem(null);
            setError(null);
            // Fetch updated list of recipes after addition
            fetchData();
            // Close the modal after submitting
            setShowModal(false);
        } catch (error) {
            console.error('Error submitting data:', error);
            setError('Error submitting data');
        }
    };

    const handleEdit = (id) => {
        // Handle edit action
        const itemToEdit = data.find(item => item._id === id);
        setEditItem(itemToEdit);
        setName(itemToEdit.name);
        setIngredients(itemToEdit.ingredients);
        setCuisine(itemToEdit.cuisine);
        setShowModal(true); // Show the modal when editing
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            // Remove the deleted item from the state
            setData(prevData => prevData.filter(item => item._id !== id));
            // Clear any previous error
            setError(null);
        } catch (error) {
            console.error('Error deleting data:', error);
            setError('Error deleting data');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            console.log('Search query:', searchQuery);
            const response = await axios.get(`${API_URL}/${encodeURIComponent(searchQuery)}`);
            console.log('Search response:', response.data);
            setData(response.data);
            setError(null); // Clear any previous error
        } catch (error) {
            console.error('Error searching data:', error);
            setError('Error searching data');
        }
    };

    const addToFavorites = (id) => {
        const favoriteRecipe = data.find(recipe => recipe._id === id);
        setFavoriteRecipes(prevFavorites => [...prevFavorites, favoriteRecipe]);
    };

    const removeFromFavorites = (id) => {
        setFavoriteRecipes(prevFavorites => prevFavorites.filter(recipe => recipe._id !== id));
    };

    const handleHeartClick = (id) => {
        setHeartStates(prevStates => ({
            ...prevStates,
            [id]: !prevStates[id]
        }));

        if (!heartStates[id]) {
            addToFavorites(id);
        } else {
            removeFromFavorites(id);
        }
    };

    // Unique cuisines
    const cuisines = [...new Set(data.map(recipe => recipe.cuisine))];

    return (
        <div>
            <div className="head">
                <Navbar />
                <form onSubmit={handleSearch}>
                    <input
                        className="searchBar"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                    />
                    <button type="submit" className="searchButton" onClick={handleSearch}>
    <i className="fa-solid fa-magnifying-glass"></i>
  </button>
                </form>
                <div className="buttons">
                <div className="categorize-button">
                    <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)}>
                        <option value="">All Cuisines</option>
                        {cuisines.map(cuisine => (
                            <option key={cuisine} value={cuisine}>{cuisine}</option>
                        ))}
                    </select>
                    <div className="modal-button">
                    <button onClick={() => setShowModal(true)}>Add Recipe</button>
                    </div>
                </div>
                </div>
                {/* Modal overlay */}
                {showModal && <div className="modal-overlay"></div>}

                {/* Modal for form */}
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                            <form className="add-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <input
                                        type='text'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder='     Name'
                                    />
                                    <input
                                        type="text"
                                        value={ingredients}
                                        onChange={(e) => setIngredients(e.target.value)}
                                        placeholder="     Ingredients"
                                    />
                                    <input
                                        type="text"
                                        value={cuisine}
                                        onChange={(e) => setCuisine(e.target.value)}
                                        placeholder="     Cuisine"
                                    />
                                </div>
                                <button className="add-data" type="submit">{editItem ? 'Update Recipe' : 'Add Recipe'}</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <ul>
                <MyFavorite favorites={favoriteRecipes} />
                <h1>Recipes</h1>
                {data.filter(recipe => selectedCuisine === '' || recipe.cuisine === selectedCuisine).map(item => (
                    <li className="sample-recipe" key={item._id}>
                        <div className="recipe-list">
                            <div className="recipe">
                                <div className="recipe-name">{item.name}</div>
                                <div className="recipe-ingredients">Ingredients: {item.ingredients}</div>
                                <div className="recipe-cuisine">Cuisine: {item.cuisine}</div>
                            </div>
                            <div className="button-items">
                                <i className={`fa-solid fa-heart ${heartStates[item._id] ? 'red-heart' : ''}`} onClick={() => handleHeartClick(item._id)}></i>
                                <button className="edit-button" onClick={() => handleEdit(item._id)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDelete(item._id)}>
                                <i className="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div> 
    );
}

export default DataForm;