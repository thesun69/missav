const https = require('https');
const { JSDOM } = require('jsdom');
const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch HTML content using HTTPS
async function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' } };
        https.get(url, options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => { resolve(data); });
        }).on('error', (error) => { reject(error); });
    });
}

// Function to extract M3U8 URL from the fetched HTML
async function getM3u8(urlToFetch) {
    const html = await fetchHTML(urlToFetch);
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const scriptTags = doc.querySelectorAll('script');
    let found = false;
    let uniqueCode = null;

    for (let scriptTag of scriptTags) {
        if (scriptTag.textContent.includes('urls:') && !found) {
            const urlsRegex = /urls:\s*\[([\s\S]*?)]/;
            const urlsMatch = scriptTag.textContent.match(urlsRegex);

            if (urlsMatch) {
                found = true;
                const urls = JSON.parse(`[${urlsMatch[1]}]`);
                const codes = urls.map(url => {
                    const codeRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;
                    const codeMatch = url.match(codeRegex);
                    return codeMatch ? codeMatch[1] : null;
                }).filter(code => code !== null);

                if (codes.length > 0) {
                    uniqueCode = codes[0];
                    break;
                }
            }
        }
    }

    if (!found) {
        throw new Error('Failed to find the urls variable');
    }

    return uniqueCode;
}

const getDetails = async (req, res, baseUrl) => {
    try {
        const { data } = await axios.get(baseUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' },
        });

        const $ = cheerio.load(data);
        const baseCss = 'div.flex > div.flex-1.order-first';
        const sndCss = 'div.sm\\:mx-0.mb-8.rounded-0.sm\\:rounded-lg > div:nth-child(2) > div:nth-child(1)';
        const trdCss = 'div > div.space-y-2';
        let details = {
            name: $(`${baseCss} > div.mt-4 > h1`).text(),
            code: $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(2) > span.font-medium`).text().trim(),
            actress: {
                actressName: $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(4) > a`).text().trim(),
                actressUrl: $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(4) > a`).attr('href'),
            },
            details: $(`${baseCss} > ${sndCss} > div > div.mb-4 > div.mb-1.text-secondary.break-all.line-clamp-2`).text().trim(),
        };
        const genresTitle = $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(5) > span`).text().trim();
        if (genresTitle === "Genre:") {
            details.genres = $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(5) > a`)
                .map((i, el) => $(el).text().trim()).get();
        }
        const makerTitle = $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(6) > span`).text().trim();
        if (makerTitle === "Maker:") {
            details.maker = {
                makerName: $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(6) > a`).text().trim(),
                makerUrl: $(`${baseCss} > ${sndCss} > ${trdCss} > div:nth-child(6) > a`).attr('href'),
            };
        }

        try {
            const uniqueCode = await getM3u8(baseUrl);
            details.m3u8 = `https://surrit.com/${uniqueCode}/playlist.m3u8`;
        } catch (error) {
            console.error('Error fetching M3U8 code:', error);
        }

        res.json(details);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};

module.exports = getDetails;