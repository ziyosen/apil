const axios = require('axios');
const cheerio = require('cheerio');

// ==================== USER AGENT CLASS ====================
class UAgent {
    static processors = {
        lin: ['i686', 'x86_64'],
        mac: ['Intel', 'PPC', 'U; Intel', 'U; PPC'],
        win: ['foo']
    };

    static browsers = {
        34: {
            89: ['chrome', 'win'],
            9: ['chrome', 'mac'],
            2: ['chrome', 'lin']
        },
        32: {
            100: ['iexplorer', 'win']
        },
        25: {
            83: ['firefox', 'win'],
            16: ['firefox', 'mac'],
            1: ['firefox', 'lin']
        },
        7: {
            95: ['safari', 'mac'],
            4: ['safari', 'win'],
            1: ['safari', 'lin']
        },
        2: {
            91: ['opera', 'win'],
            6: ['opera', 'lin'],
            3: ['opera', 'mac']
        }
    };

    static languages = [
        'af-ZA', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB',
        'ar-LY', 'ar-MA', 'ar-OM', 'ar-QA', 'ar-SA', 'ar-SY', 'ar-TN', 'ar-YE', 'be-BY',
        'bg-BG', 'ca-ES', 'cs-CZ', 'da-DK', 'de-AT', 'de-CH', 'de-DE', 'de-LI', 'de-LU',
        'el-GR', 'en-AU', 'en-BZ', 'en-CA', 'en-GB', 'en-IE', 'en-JM', 'en-NZ', 'en-PH',
        'en-TT', 'en-US', 'en-ZA', 'en-ZW', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR',
        'es-DO', 'es-EC', 'es-ES', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 'es-PE',
        'es-PR', 'es-PY', 'es-SV', 'es-UY', 'es-VE', 'et-EE', 'eu-ES', 'fa-IR', 'fi-FI',
        'fo-FO', 'fr-BE', 'fr-CA', 'fr-CH', 'fr-FR', 'fr-LU', 'fr-MC', 'gl-ES', 'gu-IN',
        'he-IL', 'hi-IN', 'hr-HR', 'hu-HU', 'hy-AM', 'id-ID', 'is-IS', 'it-CH', 'it-IT',
        'ja-JP', 'ka-GE', 'kk-KZ', 'kn-IN', 'kok-IN', 'ko-KR', 'ky-KZ', 'lt-LT', 'lv-LV',
        'mk-MK', 'mn-MN', 'mr-IN', 'ms-BN', 'ms-MY', 'nb-NO', 'nl-BE', 'nl-NL', 'nn-NO',
        'pa-IN', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sa-IN', 'sk-SK', 'sl-SI',
        'sq-AL', 'sv-FI', 'sv-SE', 'sw-KE', 'syr-SY', 'ta-IN', 'te-IN', 'th-TH', 'tr-TR',
        'tt-RU', 'uk-UA', 'ur-PK', 'vi-VN', 'zh-CHS', 'zh-CHT', 'zh-CN', 'zh-HK', 'zh-MO',
        'zh-SG', 'zh-TW'
    ];

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static arrayRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static generatePlatform() {
        let rand = UAgent.randomInt(1, 100);
        let sum = 0;
        
        for (const [share, freqOs] of Object.entries(UAgent.browsers)) {
            sum += parseInt(share);
            if (rand <= sum) {
                rand = UAgent.randomInt(1, 100);
                sum = 0;
                for (const [freq, choice] of Object.entries(freqOs)) {
                    sum += parseInt(freq);
                    if (rand <= sum) {
                        return choice;
                    }
                }
            }
        }
        throw new Error('Sum of browsers frequency is not 100.');
    }

    static getLanguage(lang = []) {
        return UAgent.arrayRandom(lang.length ? lang : UAgent.languages);
    }

    static getProcessor(os) {
        return UAgent.arrayRandom(UAgent.processors[os]);
    }

    static getVersionNt() {
        return UAgent.randomInt(5, 6) + '.' + UAgent.randomInt(0, 1);
    }

    static getVersionOsx() {
        return '10_' + UAgent.randomInt(5, 7) + '_' + UAgent.randomInt(0, 9);
    }

    static getVersionWebkit() {
        return UAgent.randomInt(531, 536) + UAgent.randomInt(0, 2);
    }

    static getVersionChrome() {
        return UAgent.randomInt(13, 15) + '.0.' + UAgent.randomInt(800, 899) + '.0';
    }

    static getVersionGecko() {
        return UAgent.randomInt(17, 31) + '.0';
    }

    static getVersionIe() {
        return UAgent.randomInt(7, 9) + '.0';
    }

    static getVersionTrident() {
        return UAgent.randomInt(4, 7) + '.0';
    }

    static getVersionNet() {
        const frameworks = ['2.0.50727', '3.0.4506', '3.5.30729'];
        const rev = '.' + UAgent.randomInt(26, 648);
        return UAgent.arrayRandom(frameworks) + rev;
    }

    static getVersionSafari() {
        if (UAgent.randomInt(0, 1) === 0) {
            return UAgent.randomInt(4, 5) + '.' + UAgent.randomInt(0, 1);
        }
        return UAgent.randomInt(4, 5) + '.0.' + UAgent.randomInt(1, 5);
    }

    static getVersionOpera() {
        return UAgent.randomInt(15, 19) + '.0.' + UAgent.randomInt(1147, 1284) + UAgent.randomInt(49, 100);
    }

    static opera(arch) {
        const opera = ' OPR/' + UAgent.getVersionOpera();
        const engine = UAgent.getVersionWebkit();
        const webkit = ' AppleWebKit/' + engine + ' (KHTML, like Gecko)';
        const chrome = ' Chrome/' + UAgent.getVersionChrome();
        const safari = ' Safari/' + engine;

        switch (arch) {
            case 'lin':
                return '(X11; Linux {proc}) ' + webkit + chrome + safari + opera;
            case 'mac':
                const osx = UAgent.getVersionOsx();
                return '(Macintosh; U; {proc} Mac OS X ' + osx + ')' + webkit + chrome + safari + opera;
            default:
                const nt = UAgent.getVersionNt();
                return '(Windows NT ' + nt + '; WOW64) ' + webkit + chrome + safari + opera;
        }
    }

    static safari(arch) {
        const version = ' Version/' + UAgent.getVersionSafari();
        const engine = UAgent.getVersionWebkit();
        const webkit = ' AppleWebKit/' + engine + ' (KHTML, like Gecko)';
        const safari = ' Safari/' + engine;

        switch (arch) {
            case 'mac':
                const osx = UAgent.getVersionOsx();
                return '(Macintosh; U; {proc} Mac OS X ' + osx + '; {lang})' + webkit + version + safari;
            default:
                const nt = UAgent.getVersionNt();
                return '(Windows; U; Windows NT ' + nt + ')' + webkit + version + safari;
        }
    }

    static iexplorer() {
        const nt = UAgent.getVersionNt();
        const ie = UAgent.getVersionIe();
        const trident = UAgent.getVersionTrident();
        const net = UAgent.getVersionNet();
        return '(compatible; MSIE ' + ie + '; Windows NT ' + nt + '; WOW64; Trident/' + trident + '; .NET CLR ' + net + ')';
    }

    static firefox(arch) {
        const gecko = UAgent.getVersionGecko();
        const trail = '20100101';
        const release = 'rv:' + gecko;
        const version = 'Gecko/' + trail + ' Firefox/' + gecko;

        switch (arch) {
            case 'lin':
                return '(X11; Linux {proc}; ' + release + ') ' + version;
            case 'mac':
                const osx = UAgent.getVersionOsx();
                return '(Macintosh; {proc} Mac OS X ' + osx + '; ' + release + ') ' + version;
            default:
                const nt = UAgent.getVersionNt();
                return '(Windows NT ' + nt + '; {lang}; ' + release + ') ' + version;
        }
    }

    static chrome(arch) {
        const chrome = ' Chrome/' + UAgent.getVersionChrome();
        const engine = UAgent.getVersionWebkit();
        const webkit = ' AppleWebKit/' + engine + ' (KHTML, like Gecko)';
        const safari = ' Safari/' + engine;

        switch (arch) {
            case 'lin':
                return '(X11; Linux {proc}) ' + webkit + chrome + safari;
            case 'mac':
                const osx = UAgent.getVersionOsx();
                return '(Macintosh; U; {proc} Mac OS X ' + osx + ')' + webkit + chrome + safari;
            default:
                const nt = UAgent.getVersionNt();
                return '(Windows NT ' + nt + ') ' + webkit + chrome + safari;
        }
    }

    static random(lang = ['en-US']) {
        const [browser, os] = UAgent.generatePlatform();
        return UAgent.generate(browser, os, lang);
    }

    static generate(browser = 'chrome', os = 'win', lang = ['en-US']) {
        let ua = 'Mozilla/5.0 ' + UAgent[browser](os);
        const tags = {
            '{proc}': UAgent.getProcessor(os),
            '{lang}': UAgent.getLanguage(lang)
        };
        ua = ua.replace(/\{proc\}|\{lang\}/g, (match) => tags[match]);
        return ua;
    }
}

// ==================== SCRAPER CLASS ====================
class Scrape {
    constructor() {
        this.base_url = "https://tv12.lk21official.cc";
        this.return = null;
    }

    formatMenit(time, format = '%02d:%02d') {
        if (time < 1) {
            return null;
        }
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const pad = (num) => String(num).padStart(2, '0');
        return format.replace('%02d', pad(hours)).replace('%02d', pad(minutes));
    }

    getString(str, findStart, findEnd) {
        if (!str) return false;
        const start = str.indexOf(findStart);
        if (start === -1) {
            return false;
        }
        const length = findStart.length;
        const subStr = str.substring(start + length);
        const end = subStr.indexOf(findEnd);
        if (end === -1) {
            return false;
        }
        return subStr.substring(0, end).trim();
    }

    async GET(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Connection': 'keep-alive',
                    'User-Agent': UAgent.random(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'id,en;q=0.9,en-US;q=0.8'
                },
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            console.error('GET Error:', error.message);
            return false;
        }
    }

    async cariFilm(query) {
        const get = await this.GET(`${this.base_url}/?s=${encodeURIComponent(query)}`);
        if (!get) {
            this.return = { error: true, error_msg: "unable to retrieve data" };
            return this;
        }

        const $ = cheerio.load(get);
        const results = [];
        
        $('.search-item').each((index, element) => {
            const $item = $(element);
            const $link = $item.find('h2 a').first();
            const $img = $item.find('img').first();
            
            const judul = $link.attr('title') || $link.text().trim();
            const thumbnail = $img.attr('src') ? 'https:' + $img.attr('src') : null;
            const url = $link.attr('href');
            const genre = [];
            
            $item.find('a[href*="/genre/"]').each((i, el) => {
                const genreMatch = $(el).attr('href').match(/\/genre\/(.*?)\//);
                if (genreMatch) genre.push(genreMatch[1]);
            });
            
            const year = this.getString($item.html(), '/year/', '/');
            const quality = this.getString($item.html(), '/quality/', '/');
            const country = this.getString($item.html(), '/country/', '/');
            const size = this.getString($item.html(), '/size/', '/');
            const sutradara = this.getString($item.html(), 'Sutradara:</strong>', '</p>');
            const bintang = this.getString($item.html(), 'Bintang:</strong>', '</p>');
            
            if (judul && url) {
                results.push({
                    judul, thumbnail, tautan: url, genre,
                    tahun: year || null, negara: country || null,
                    kualitas: quality || null, ukuran: size || null,
                    sutradara: sutradara || null, bintang: bintang || null
                });
            }
        });

        this.return = { total_hasil: results.length, hasil_pencarian: results };
        return this;
    }

    async downloadFilm(url) {
        const fullUrl = `${this.base_url}/${url}/`;
        const slug = await this.slug(fullUrl);
        
        if (!slug) {
            return { error: true, error_msg: "unable to get slug" };
        }

        try {
            const response = await axios.post(
                'http://asdahsdkjajslkfbkaujsgfbjaeghfyjj76e8637e68723rhbfajkl.akurat.co/verifying.php',
                `slug=${encodeURIComponent(slug)}`,
                {
                    headers: {
                        'Host': 'asdahsdkjajslkfbkaujsgfbjaeghfyjj76e8637e68723rhbfajkl.akurat.co',
                        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0',
                        'Accept': '*/*',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Dnt': '1',
                        'Connection': 'close'
                    },
                    timeout: 30000
                }
            );

            const $ = cheerio.load(response.data);
            const rapid = [], fcloud = [], doupload = [], mirror = [], 
                  go4 = [], embed = [], terra = [], unknown = [];

            $('td[align="center"] a').each((index, element) => {
                const $link = $(element);
                const href = $link.attr('href');
                const quality = $link.attr('class')?.match(/btnx btn-([^"\s]+)/)?.[1] || 'unknown';

                if (href) {
                    const urlLower = href.toLowerCase();
                    if (urlLower.includes('rapidvideo')) {
                        rapid.push({ url: href, quality });
                    } else if (urlLower.includes('filecloud')) {
                        fcloud.push({ url: href, quality });
                    } else if (urlLower.includes('douploads')) {
                        doupload.push({ url: href, quality });
                    } else if (urlLower.includes('mirrorace')) {
                        mirror.push({ url: href, quality });
                    } else if (urlLower.includes('go4up')) {
                        go4.push({ url: href, quality });
                    } else if (urlLower.includes('embedupload')) {
                        embed.push({ url: href, quality });
                    } else if (urlLower.includes('tera')) {
                        terra.push({ url: href, quality });
                    } else {
                        unknown.push({ url: href, quality });
                    }
                }
            });

            return {
                Rapidvideo: rapid, Filecloud: fcloud, Doupload: doupload,
                Mirrorace: mirror, Go4up: go4, Embedupload: embed,
                Terrafile: terra, Unknown: unknown
            };
        } catch (error) {
            console.error('Download Film Error:', error.message);
            return { error: true, error_msg: error.message };
        }
    }

    async slug(url) {
        const get = await this.GET(url);
        if (!get) return false;
        return this.getString(get, "{slug:'", "'");
    }

    async namaNegara(code) {
        if (!code) return "Unknown";
        try {
            const response = await axios.get(`https://restcountries.eu/rest/v2/name/${code}`, { timeout: 10000 });
            return response.data?.[0]?.name || "Unknown";
        } catch (error) {
            return "Unknown";
        }
    }

    async infoFilm(url) {
        const get = await this.GET(`${this.base_url}/${url}/`);
        if (!get) {
            this.return = { error: true, error_msg: "unable to retrieve data" };
            return this;
        }

        const slug = this.getString(get, "{slug:'", "'");
        const $ = cheerio.load(get);
        const movieDetail = $('#movie-detail');
        
        const genre = [];
        movieDetail.find('a[href*="/genre/"]').each((i, el) => genre.push($(el).text().trim()));
        
        const artis = [];
        movieDetail.find('a[href*="/artist/"]').each((i, el) => artis.push($(el).text().trim()));
        
        const tag = [];
        movieDetail.find('a[href*="/tag/"]').each((i, el) => tag.push($(el).text().trim()));
        
        const img = movieDetail.find('img').first();
        const thumbnail = img.attr('src') ? 'https:' + img.attr('src') : null;
        const judul = img.attr('alt') || 'Unknown';
        
        let durasi = null;
        const durasiEl = movieDetail.find('h3').filter((i, el) => 
            $(el).prev('h2').text().includes('Durasi')
        ).first();
        if (durasiEl.length) durasi = durasiEl.text().trim();
        
        const countryCode = this.getString(get, '/country/', '/');
        const negara = await this.namaNegara(countryCode);
        const quality = this.getString(get, '/quality/', '/');
        const downloadLinks = await this.downloadFilm(url);
        
        this.return = {
            judul, durasi, thumbnail, negara, kualitas: quality,
            genre: genre.length ? genre : "Unknown",
            artis: artis.length ? artis : "Unknown",
            tag: tag.length ? tag : "Unknown",
            slug, url_download: downloadLinks
        };
        return this;
    }

    async genre(genreName) {
        const listGenre = this.listGenre();
        if (listGenre.includes(genreName)) {
            const get = await this.GET(`${this.base_url}/genre/${genreName}/`);
            if (!get) {
                this.return = { error: true, error_msg: "unable to retrieve data" };
                return this;
            }
            this.return = this.parseHalaman(get);
            return this;
        }
        this.return = {
            error: true, error_msg: "genre doesn't exist",
            available_genre: listGenre
        };
        return this;
    }

    parseHalaman(data) {
        const $ = cheerio.load(data);
        const output = [];
        
        $('.col-lg-2.col-sm-3.col-xs-4').each((index, element) => {
            const $item = $(element);
            const $link = $item.find('a').first();
            const $img = $item.find('img').first();
            
            if ($link.length && $img.length) {
                const url = $link.attr('href');
                const judul = $img.attr('alt');
                const thum = $img.attr('src') ? 'https:' + $img.attr('src') : null;
                const genre = [];
                
                $item.find('a[href*="/genre/"]').each((i, el) => {
                    const genreMatch = $(el).attr('href').match(/\/genre\/(.*?)\//);
                    if (genreMatch) genre.push(genreMatch[1]);
                });
                
                const negara = [];
                $item.find('a[href*="/country/"]').each((i, el) => {
                    const negaraMatch = $(el).attr('href').match(/\/country\/(.*?)\//);
                    if (negaraMatch) negara.push(negaraMatch[1].replace(/-/g, ' '));
                });
                
                const quality = this.getString($item.html(), '/quality/', '/');
                const year = this.getString($item.html(), '/year/', '/');
                const rating = $item.find('.fa-star').parent().text().trim();
                const durationMatch = $item.html().match(/"duration":"PT(\d+)M/);
                const duration = durationMatch ? this.formatMenit(parseInt(durationMatch[1]), '%02d jam %02d menit') : null;
                const isHD = $item.html().includes('quality-HD');
                
                output.push({
                    url, judul, genre, durasi: duration, negara,
                    tahun: year || null, thumbnail: thum,
                    rating: rating || null, kualitas: quality || null, isHD
                });
            }
        });
        
        return output;
    }

    async filmPopuler() {
        const get = await this.GET(`${this.base_url}/populer/`);
        if (!get) {
            this.return = { error: true, error_msg: "unable to retrieve data" };
            return this;
        }
        this.return = this.parseHalaman(get);
        return this;
    }

    async filmBluray() {
        const get = await this.GET(`${this.base_url}/quality/bluray/`);
        if (!get) {
            this.return = { error: true, error_msg: "unable to retrieve data" };
            return this;
        }
        this.return = this.parseHalaman(get);
        return this;
    }

    async tahunFilm(tahun) {
        const get = await this.GET(`${this.base_url}/year/${tahun}/`);
        if (!get) {
            this.return = { error: true, error_msg: "unable to retrieve data" };
            return this;
        }
        this.return = this.parseHalaman(get);
        return this;
    }

    listGenre() {
        return [
            "drama", "comedy", "action", "thriller",
            "romance", "horror", "crime", "adventure",
            "mystery", "animation", "fantasy", "sci-fi",
            "family", "wrestling", "biography", "history",
            "war", "music", "documentary", "sport",
            "western", "musical", "science-fiction", "short",
            "film-noir", "tv-movie", "shounen", "school",
            "news", "magic", "supernatural", "mecha",
            "military", "historical", "foreign", "slice-of-life",
            "horor", "suspense", "psychological", "sports",
            "live-action", "samurai", "erotic", "adult",
            "recommend", "police", "youth", "kids",
            "costume", "super-power", "actin-comedy", "detective",
            "investigation", "doraemon", "movies", "oscar-nominated-short-film",
            "mandarin", "mature", "mistery", "omnibus",
            "adventures", "time-travel", "special", "ova",
            "parody", "seinen", "actiom", "shoujo"
        ];
    }
}

// ==================== API HANDLER ====================
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const scraper = new Scrape();
    const { action, query, url, genre: genreName, tahun } = req.query;
    
    try {
        let result;
        
        switch (action) {
            case 'search':
                if (!query) {
                    return res.status(400).json({ error: true, error_msg: "Query parameter is required" });
                }
                await scraper.cariFilm(query);
                result = scraper.return;
                break;
                
            case 'detail':
                if (!url) {
                    return res.status(400).json({ error: true, error_msg: "URL parameter is required" });
                }
                await scraper.infoFilm(url);
                result = scraper.return;
                break;
                
            case 'download':
                if (!url) {
                    return res.status(400).json({ error: true, error_msg: "URL parameter is required" });
                }
                result = await scraper.downloadFilm(url);
                break;
                
            case 'genre':
                if (!genreName) {
                    return res.status(400).json({ error: true, error_msg: "Genre parameter is required" });
                }
                await scraper.genre(genreName);
                result = scraper.return;
                break;
                
            case 'popular':
                await scraper.filmPopuler();
                result = scraper.return;
                break;
                
            case 'bluray':
                await scraper.filmBluray();
                result = scraper.return;
                break;
                
            case 'year':
                if (!tahun) {
                    return res.status(400).json({ error: true, error_msg: "Tahun parameter is required" });
                }
                await scraper.tahunFilm(tahun);
                result = scraper.return;
                break;
                
            case 'list_genre':
                result = scraper.listGenre();
                break;
                
            default:
                return res.status(400).json({
                    error: true,
                    error_msg: "Invalid action",
                    available_actions: ['search', 'detail', 'download', 'genre', 'popular', 'bluray', 'year', 'list_genre']
                });
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: true, error_msg: error.message });
    }
};
