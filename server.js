const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// In‑memory database
let recipes = [
    {
        id: 1,
        title: "Spaghetti Carbonara",
        ingredients: "spaghetti, eggs, parmesan cheese, pancetta, black pepper",
        createdAt: new Date()
    },
    {
        id: 2,
        title: "Guacamole",
        ingredients: "avocado, lime, red onion, cilantro, salt, tomato",
        createdAt: new Date()
    }
];
let nextId = 3;

// Helper function to format relative time (e.g., "2 minutes ago")
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}

// Homepage – show all recipe titles (with search filter)
app.get('/', (req, res) => {
    let filteredRecipes = [...recipes];
    if (req.query.search) {
        const searchTerm = req.query.search.toLowerCase();
        filteredRecipes = recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(searchTerm)
        );
    }
    res.render('index', { recipes: filteredRecipes, title: 'Recipe Box', timeAgo });
});

// Show single recipe details
app.get('/recipe/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return res.status(404).send('Recipe not found');
    res.render('show', { recipe, title: recipe.title, timeAgo });
});

// Show add form
app.get('/add', (req, res) => {
    res.render('add', { title: 'Add Recipe' });
});

// Process add form
app.post('/add', (req, res) => {
    const { title, ingredients } = req.body;
    const newRecipe = {
        id: nextId++,
        title,
        ingredients,
        createdAt: new Date()
    };
    recipes.push(newRecipe);
    res.redirect('/');
});

// Show edit form
app.get('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return res.status(404).send('Recipe not found');
    res.render('edit', { recipe, title: 'Edit Recipe' });
});

// Process edit form
app.post('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, ingredients } = req.body;
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
        recipes[index] = {
            ...recipes[index],
            title,
            ingredients,
            createdAt: recipes[index].createdAt // keep original creation time
        };
    }
    res.redirect('/');
});

// Delete recipe
app.post('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    recipes = recipes.filter(r => r.id !== id);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Recipe Box running at http://localhost:${PORT}`);
});