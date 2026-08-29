const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://tv12.lk21official.cc';

// User Agent acak sederhana agar tidak mudah diblokir
const getRandomUA = () => {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
};

async function scrapeLatest(page = 1) {
    // Validasi range halaman (1 - 9)
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 9) {
        return {
            error: true,
            error_msg: "Halaman hanya diperbolehkan dari 1 sampai 9"
        };
    }

    // Format URL: Halaman 1 pakai /latest/, Halaman >1 pakai /latest/page/X
    const url = pageNum === 1 ? `${BASE_URL}/latest/` : `${BASE_URL}/latest/page/${pageNum}/`;

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUA(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'id,en-US;q=0.9,en;q=0.8'
            },
            timeout: 15000
        });

        const $ = cheerio.load(data);
        const results = [];

        $('.col-lg-2.col-sm-3.col-xs-4, .search-item, .grid-item').each((_, element) => {
            const $item = $(element);
            const $link = $item.find('a').first();
            const $img = $item.find('img').first();

            const href = $link.attr('href');
            if (!href) return;

            // Ekstrak detail film
            const judul = $img.attr('alt') || $link.attr('title') || $link.text().trim();
            const rawImg = $img.attr('src') || $img.attr('data-src');
            const thumbnail = rawImg ? (rawImg.startsWith('//') ? `https:${rawImg}` : rawImg) : null;
            
            // Format slug URL
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
            error_msg: error.message
        };
    }
}

// Serverless Handler Vercel
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { page = 1 } = req.query;
    const result = await scrapeLatest(page);

    if (result.error) {
        return res.status(400).json(result);
    }

    return res.status(200).json(result);
};
