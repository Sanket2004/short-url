require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const ShortURL = require('./models/shortUrl');
const app = express();

console.log("MONGODB_URI:", process.env.MONGODB_URI); // Check the value of MONGODB_URI

// MongoDB connection log
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

app.use(express.json()); // Middleware to parse JSON data

// Route to get all short URLs
app.get('/api/shortUrls', async (req, res) => {
    try {
        const shortUrls = await ShortURL.find();
        res.json(shortUrls);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to create a short URL
app.post('/api/shortUrls', async (req, res) => {
    try {
        const { fullUrl, creator } = req.body;
        const newShortUrl = await ShortURL.create({ full: fullUrl, creator: creator });
        console.log('Short URL created:', newShortUrl);
        res.status(201).json(newShortUrl);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to delete a specific short URL
app.delete('/api/shortUrls/:id', async (req, res) => {
    try {
        await ShortURL.findByIdAndDelete(req.params.id);
        console.log('Short URL deleted:', req.params.id);
        res.sendStatus(204);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to redirect to the original URL using the short URL
app.get('/:shortUrl', async (req, res) => {
    try {
        const shortUrl = await ShortURL.findOne({ short: req.params.shortUrl });
        if (shortUrl == null) {
            console.warn('Short URL not found:', req.params.shortUrl);
            return res.sendStatus(404);
        }
        shortUrl.clicks++;
        await shortUrl.save();
        console.log('Redirecting to:', shortUrl.full);
        res.redirect(shortUrl.full);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get all short URLs with all details
app.get('/api/shortUrls/all', async (req, res) => {
    try {
        const shortUrls = await ShortURL.find();
        res.json(shortUrls);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
