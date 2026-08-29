const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://tv12.lk21official.cc';

async function scrapeLatest(page = 1) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 9) {
        return {
            error: true,
            error_msg: "Halaman hanya diperbolehkan dari 1 sampai 9"
        };
    }

    const targetUrl = pageNum === 1 ? `${BASE_URL}/latest/` : `${BASE_URL}/latest/page/${pageNum}/`;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'max-age=0',
                'Referer': `${BASE_URL}/`,
                'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
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
            const rating = $item.find('.fa-star').parent().text().trim() || null;
            const quality = $item.find('.quality-label, .label-quality').text().trim() || null;

            if (judul && slug) {
                results.push({
                    judul,
                    slug,
                    url: `${BASE_URL}/${slug}/`,
                    thumbnail,
                    rating,
                    kualitas: quality
                });
            }
        });

        return {
            status: true,
            page: pageNum,
            total_data: results.length,
            data: results
        };

    } catch (error) {
        return {
            error: true,
            status_code: error.response?.status || 500,
            error_msg: error.message
        };
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { page = 1 } = req.query;
    const result = await scrapeLatest(page);

    if (result.error) {
        return res.status(result.status_code || 400).json(result);
    }

    return res.status(200).json(result);
};
