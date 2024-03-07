const axios = require('axios');
const cheerio = require('cheerio');

const getVodData = async (req, res, baseUrl, page = 1) => {
    const finalLink = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;

    try {
        const { data } = await axios.get(finalLink, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3', },
        });

        const $ = cheerio.load(data);
        const vod = $('div.grid.grid-cols-2.md\\:grid-cols-3.xl\\:grid-cols-4.gap-5 > div > div').map((i, el) => {
            const element = $(el);
            const name = element.find('div.my-2.text-sm.text-nord4.truncate > a').text().trim();
            const url = element.find('div.relative.aspect-w-16.aspect-h-9.rounded.overflow-hidden.shadow-lg > a').attr('href');
            let genre = '';
            try {
                genre = element.find('div.relative.aspect-w-16.aspect-h-9.rounded.overflow-hidden.shadow-lg > a > span.left-1').text().trim();
            } catch (error) { /* Handle the error if necessary */ }
            const duration = element.find('div.relative.aspect-w-16.aspect-h-9.rounded.overflow-hidden.shadow-lg > a > span.right-1').text().trim();
            const previewVideo = element.find('div.relative.aspect-w-16.aspect-h-9.rounded.overflow-hidden.shadow-lg > a > video').attr('data-src');
            const imageUrl = new URL(element.find('div.relative.aspect-w-16.aspect-h-9.rounded.overflow-hidden.shadow-lg > a > img').attr('data-src'));
            imageUrl.search = '';

            return {
                name,
                url,
                image: imageUrl.href,
                genre,
                duration,
                preview: previewVideo,
            };
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
            vod,
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.json({
            error: 'Failed to fetch data',
            page,
            pageCount: 0,
            vod: [],
        });
    }
};

module.exports = getVodData;