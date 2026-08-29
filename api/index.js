const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://tv12.lk21official.cc';

async function scrapeLatest(page = 1) {
    const pageNum = parseInt(page, 10) || 1;
    const targetUrl = pageNum === 1 ? `${BASE_URL}/latest/` : `${BASE_URL}/latest/page/${pageNum}/`;

    try {
        // Menggunakan allorigins proxy untuk bypass WAF/CORS
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const response = await axios.get(proxyUrl, { timeout: 15000 });
        
        // Data HTML ada di di dalam property .contents
        const html = response.data.contents;
        const $ = cheerio.load(html);
        const results = [];

        $('.col-lg-2.col-sm-3.col-xs-4, .search-item, .grid-item').each((_, element) => {
            const $item = $(element);
            const $link = $item.find('a').first();
            const $img = $item.find('img').first();

            const href = $link.attr('href');
            if (!href) return;

            const judul = $img.attr('alt') || $link.attr('title') || $link.text().trim();
            const rawImg = $img.attr('src') || $img.attr('data-src');
            const thumbnail = rawImg ? (rawImg.startsWith('//') ? `https:${rawImg}` : rawImg) : null;
            const slug = href.replace(BASE_URL, '').replace(/^\/|\/$/g, '');

            if (judul && slug) {
                results.push({ judul, slug, url: `${BASE_URL}/${slug}/`, thumbnail });
            }
        });

        return { status: true, page: pageNum, total_data: results.length, data: results };

    } catch (error) {
        return { error: true, error_msg: error.message };
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { page = 1 } = req.query;
    const result = await scrapeLatest(page);
    return res.status(result.error ? 500 : 200).json(result);
};
