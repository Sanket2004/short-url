const express = require('express');
const mongoose = require('mongoose')
const ShortURL = require('./models/shortUrl');
const app = express();

mongoose.connect('mongodb+srv://sanketbanerjee2004:202004@cluster0.ewfcad3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));  // middleware to parse the url encoded data


app.get('/', async (req, res) => {
    const shortUrls = await ShortURL.find()
    res.render('index', { shortUrls: shortUrls });
})

app.post('/shortUrls', async (req, res) => {
    await ShortURL.create({ full: req.body.fullUrl })
    res.redirect('/')
})

// Delete route for a specific short URL
app.post('/shortUrls/:id/delete', async (req, res) => {
    try {
        // Find the short URL by its ID and delete it
        await ShortURL.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500); // Internal Server Error
    }
});


app.get('/:shortUrl', async (req, res) => {
    try {
        const shortUrl = await ShortURL.findOne({ short: req.params.shortUrl }); // Use ShortURL instead of shortUrl

        if (shortUrl == null) return res.sendStatus(404);

        shortUrl.clicks++;
        await shortUrl.save();

        res.redirect(shortUrl.full);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500); // Internal Server Error
    }
});


app.listen(process.env.PORT || 5000);



// 12345678@
// sanketbanerjee2004