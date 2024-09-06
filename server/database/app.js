/*jshint esversion: 8 */
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Support JSON payloads

let reviews_data;
let dealerships_data;

// Read files safely with error handling
try {
  reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
  dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));
} catch (error) {
  console.error("Error reading JSON files:", error);
}

mongoose.connect("mongodb://mongo_db:27017/", { dbName: 'dealershipsDB' })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Initialize Database
async function initializeDatabase() {
    try {
        await Reviews.deleteMany({});
        await Reviews.insertMany(reviews_data.reviews);
        await Dealerships.deleteMany({});
        await Dealerships.insertMany(dealerships_data.dealerships);
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initializeDatabase();

app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
    try {
        const reviews = await Reviews.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        const documents = await Reviews.find({ dealership: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews by dealer ID' });
    }
});

// Fetch all dealerships
app.get('/dealerships', async (req, res) => {
    try {
        const dealerships = await Dealerships.find();
        res.json(dealerships);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships' });
    }
});

// Fetch all dealers
app.get('/fetchDealers', async (req, res) => {
    try {
        const dealers = await Dealerships.find();
        res.json(dealers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching all dealerships' });
    }
});

// Fetch dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const state = req.params.state;
        const dealersInState = await Dealerships.find({ state: state });
        res.json(dealersInState);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships for the specified state' });
    }
});

// Fetch dealer by ID
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const documents = await Dealerships.find({ id: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealers by ID' });
    }
});

// Insert new review
app.post('/insert_review', async (req, res) => {
    try {
        const data = req.body;

        // Validate incoming review data (basic validation)
        if (!data.name || !data.dealership || !data.review || !data.car_make || !data.car_model || !data.car_year) {
            return res.status(400).json({ error: 'Missing required review data' });
        }

        const documents = await Reviews.find().sort({ id: -1 });
        let new_id = documents[0] ? documents[0]['id'] + 1 : 1;

        const review = new Reviews({
            id: new_id,
            name: data.name,
            dealership: data.dealership,
            review: data.review,
            purchase: data.purchase,
            purchase_date: data.purchase_date,
            car_make: data.car_make,
            car_model: data.car_model,
            car_year: data.car_year,
        });

        const savedReview = await review.save();
        res.json(savedReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error inserting review' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
