import { Hono } from 'hono'
import { load } from 'cheerio'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors())

const TARGET = 'https://tv10.lk21official.cc'
// Pake UA yang lebih spesifik biar disangka browser beneran
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function scrapePage(url) {
  try {
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/'
      } 
    })
    
    const html = await res.text()
    // Kalau diblokir Cloudflare, biasanya html-nya berisi "Just a moment..."
    if (html.includes('Just a moment')) return [{ title: "DIBLOKIR CLOUDFLARE", link: "#", img: "" }]

    const $ = load(html)
    const data = []

    // Selector terbaru khusus tv10
    $('.grid-archive .item, .search-item, article').each((i, el) => {
      const title = $(el).find('h2, h3, .title').text().trim()
      const link = $(el).find('a').attr('href')
      let img = $(el).find('img').attr('data-src') || 
                $(el).find('img').attr('data-original') || 
                $(el).find('img').attr('src')
      
      if (title && link) {
        if (img && img.startsWith('//')) img = 'https:' + img
        data.push({ 
          title: title.replace(/Nonton|Movie|Subtitle|Indonesia/gi, '').trim(), 
          link, 
          img: img || '' 
        })
      }
    })
    return data
  } catch { return [] }
}

async function scrapeFivePages(baseUrl) {
  // Kita coba 3 halaman dulu buat ngetes, kalo berat baru 5
  const pages = [1, 2, 3]
  const tasks = pages.map(p => {
    const url = p === 1 ? baseUrl : `${baseUrl}/page/${p}/`
    return scrapePage(url)
  })
  
  const results = await Promise.all(tasks)
  return results.flat().filter((v, i, a) => a.findIndex(t => (t.link === v.link)) === i)
}

// ENDPOINTS
app.get('/', async (c) => c.json({ status: true, data: await scrapePage(TARGET) }))

app.get('/top-movie-today', async (c) => c.json({ status: true, data: await scrapePage(`${TARGET}/top-movie-today/`) }))

const genres = ['animation', 'action', 'adventure', 'comedy', 'crime', 'fantasy', 'family', 'horror', 'romance', 'thriller']
genres.forEach(g => {
  app.get(`/genre/${g}`, async (c) => c.json({ status: true, data: await scrapeFivePages(`${TARGET}/genre/${g}`) }))
})

const countries = ['usa', 'japan', 'south-korea', 'china', 'thailand']
countries.forEach(ct => {
  app.get(`/country/${ct}`, async (c) => c.json({ status: true, data: await scrapeFivePages(`${TARGET}/country/${ct}`) }))
})

const years = ['2017', '2018', '2019', '2020']
years.forEach(y => {
  app.get(`/year/${y}`, async (c) => c.json({ status: true, data: await scrapeFivePages(`${TARGET}/year/${y}`) }))
})

app.get('/search', async (c) => {
  const q = c.req.query('q')
  return c.json({ status: true, data: await scrapePage(`${TARGET}/?s=${q}`) })
})

app.get('/detail', async (c) => {
  try {
    const url = c.req.query('url')
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Referer': TARGET } })
    const html = await res.text()
    const $ = load(html)
    const streams = []
    $('iframe').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('ads')) {
        if (src.startsWith('//')) src = 'https:' + src
        streams.push(src)
      }
    })
    return c.json({ status: true, streams })
  } catch { return c.json({ status: false, streams: [] }) }
})

export default app
