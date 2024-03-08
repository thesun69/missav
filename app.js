const express = require('express');
const getVodData = require('./app/getVod');
const getGenres = require('./app/getGenre');
const getDetails = require('./app/getDetails');
const getActress = require('./app/getActress');
const app = express();

app.get('/missav/new/:page?', (req, res) => {
    const page = parseInt(req.params.page, 10) || 1;
    const baseUrl = 'https://cors.notesnook.com/https://missav.com/dm440/en/new';
    getVodData(req, res, baseUrl, page);
});

app.get('/missav/release/:page?', (req, res) => {
    const page = parseInt(req.params.page, 10) || 1;
    const baseUrl = 'https://cors.notesnook.com/https://missav.com/dm440/en/release';
    getVodData(req, res, baseUrl, page);
});

app.get('/missav/search/', (req, res) => {
    const keyword = req.query.kw;
    const page = parseInt(req.query.pg, 10) || 1;
    if (!keyword) {
        return res.status(400).json({
            error: "Keyword is required"
        });
    }
    const baseUrl = `https://cors.notesnook.com/https://missav.com/en/search/${encodeURIComponent(keyword)}`;
    getVodData(req, res, baseUrl, page);
});

app.get('/missav/genres/:page?', (req, res) => {
    const page = parseInt(req.params.page, 10) || 1;
    const baseUrl = 'https://cors.notesnook.com/https://missav.com/dm104/en/genres/';
    getGenres(req, res, baseUrl, page);
});

app.get('/missav/genreData/', (req, res) => {
    const url = req.query.url;
    const page = parseInt(req.query.pg, 10) || 1;
    if (!url) {
        return res.status(400).json({ error: "Genre link is required" });
    }
    const baseUrl = `https://cors.notesnook.com/${encodeURIComponent(url)}`;
    getVodData(req, res, baseUrl, page);
});

app.get('/missav/actress/', async (req, res) => {
    const url = req.query.url;
    const page = parseInt(req.query.pg, 10) || 1;
    if (!url) {
        return res.status(400).json({ error: "Genre link is required" });
    }
    const baseUrl = `https://cors.notesnook.com/${encodeURIComponent(url)}`;
    getVodData(req, res, baseUrl, page);
});

app.get('/missav/details/*', async (req, res) => {
    const url = req.params[0];
    if (!url) {
        return res.status(400).json({ error: "link is required" });
    }
    const baseUrl = `https://cors.notesnook.com/${encodeURIComponent(url)}`;
    getDetails(req, res, baseUrl);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}/missav/`);
});
