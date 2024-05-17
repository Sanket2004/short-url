const mongoose = require('mongoose');
const shortId = require('shortid');

const generateUniqueShortId = () => {
    let id;
    do {
        id = shortId.generate();
    } while (id.length < 4 || id.length > 6);
    return id;
};

const shortUrlSchema = new mongoose.Schema({
    full: {
        type: String,
        required: true,
    },
    short: {
        type: String,
        required: true,
        default: generateUniqueShortId,
    },
    clicks: {
        type: Number,
        required: true,
        default: 0,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    creator: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("ShortURL", shortUrlSchema);
