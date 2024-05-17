require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
const ShortURL = require('./models/shortUrl');
const app = express();

console.log("MONGODB_URI:", process.env.MONGODB_URI); // Check the value of MONGODB_URI

// Use CORS middleware
app.use(cors());

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
app.get('/api/shortUrls/all', async (req, res) => {
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

        // Check if the provided URL has already been shortened
        const existingShortUrl = await ShortURL.findOne({ full: fullUrl });
        if (existingShortUrl) {
            console.log('URL already shortened:', existingShortUrl);
            return res.status(200).json(existingShortUrl);
        }

        // If the URL hasn't been shortened before, create a new short URL
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

        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redirecting...</title>
            <meta http-equiv="refresh" content="3; URL='${shortUrl.full}'" />
            <link href="https://rsms.me/inter/inter.css" rel="stylesheet">
            <style>
                html{
                    font-feature-settings: 'cv11';
                }
                body {
                    font-family: 'Inter', sans-serif;
                    padding:15px;
                }
                .container{
                    width:100%;
                    height:calc(100vh - 50px);
                    display:flex;
                    flex-direction:column;
                    justify-content:center;
                    align-items:Center;
                    text-align:center;
                }
                .button{
                    background-color: black;
                    color:white;
                    font-weight:500;
                    padding-inline:1rem;
                    padding-block:0.8rem;
                    border-radius:0.6rem;
                    cursor:pointer;
                    transition:all ease-in-out 0.3s;
                    text-decoration:none;
                }
                .button:hover{
                    scale:1.05;
                    background: #797979;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p>Redirecting to ${shortUrl.full}...</p>
                <a class="button" href="https://tinypath.netlify.app/" target="_blank">Shorten URL</a>
            </div>
        </body>
        </html>
        
        `);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
