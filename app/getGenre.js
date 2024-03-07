const axios = require('axios');
const cheerio = require('cheerio');

const getGenres = async (req, res, baseUrl, page = 1) => {
    const finalLink = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;

    try {
        const { data } = await axios.get(finalLink, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3', },
        });

        const $ = cheerio.load(data);
        const list = $('div.p-8.text-nord4.bg-nord1.rounded-lg > div > div').map((i, el) => {
            const element = $(el);
            const name = element.find('a.text-nord13').text().trim();
            const url = element.find('a.text-nord13').attr('href');
            const videoTotal = element.find('p > a').text().trim();

            return { name, url, videoTotal, };
        }).get();

        const pageCountSelector = page === 1
            ? 'nav > div.hidden.md\\:flex-1.md\\:flex.md\\:items-center.md\\:justify-center > span > a:nth-child(13)'
            : 'nav > div.hidden.md\\:flex-1.md\\:flex.md\\:items-center.md\\:justify-center > span > a:nth-child(14)';
        let pageCount = 0;
        try {
            pageCount = $(pageCountSelector).text();
            pageCount = parseInt(pageCount, 10);
        } catch (error) { console.error('Error fetching page count:', error.message); }

        res.json({
            page,
            pageCount,
            list,
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.json({
            error: 'Failed to fetch data',
            page,
            pageCount: 0,
            list: [],
        });
    }
};

module.exports = getGenres;

// https://missav.com/dm104/en/genres/