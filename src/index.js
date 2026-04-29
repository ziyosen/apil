import { Hono } from 'hono'
import { load } from 'cheerio'
import { cors } from 'hono/cors'
import { handle } from '@hono/node-server/vercel'

const app = new Hono().basePath('/api')
app.use('/*', cors())

const TARGET = 'https://pafipasarmuarabungo.org'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// Fungsi dasar untuk mengambil data per halaman
async function scrapeList(url) {
  try {
    const res = await fetch(url, { 
      headers: { 'User-Agent': UA, 'Referer': TARGET },
      signal: AbortSignal.timeout(7000) // Timeout 7 detik agar tidak stuck
    })
    const html = await res.text()
    const $ = load(html)
    const data = []

    $('.ml-item, article, .item, .post-item, .v-item').each((i, el) => {
      const title = $(el).find('h2, h3, .entry-title, .mli-info h2, a.title').first().text().trim()
      const link = $(el).find('a').attr('href')
      let img = $(el).find('img').attr('data-original') || 
                $(el).find('img').attr('data-src') || 
                $(el).find('img').attr('src') ||
                $(el).find('img').attr('data-lazy-src')
      
      if (title && link && link.includes(TARGET)) {
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

// Fungsi Scrape Massal (Batching per 5 halaman, Total 15)
async function scrapeInfinite(baseUrl, limitPage = 15) {
  let combined = []
  
  for (let i = 1; i <= limitPage; i += 5) {
    const batch = []
    for (let j = i; j < i + 5 && j <= limitPage; j++) {
      let url = ""
      if (j === 1) {
        url = baseUrl
      } else {
        // Logika routing paged untuk WordPress (View More)
        if (baseUrl.includes('?')) {
          url = `${baseUrl}&paged=${j}`
        } else {
          url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}page/${j}/`
        }
      }
      batch.push(scrapeList(url))
    }
    const results = await Promise.all(batch)
    const flatRes = results.flat()
    
    if (flatRes.length === 0) break 
    combined = [...combined, ...flatRes]
  }

  // Bersihkan duplikat
  return combined.filter((v, i, a) => a.findIndex(t => (t.link === v.link)) === i);
}

// --- ENDPOINTS ---

// Home (3 halaman awal)
app.get('/', async (c) => c.json({ status: true, data: await scrapeInfinite(TARGET, 3) }))

// Genres (Maks 10 Halaman)
const genres = ['action', 'adventure', 'animation', 'comedy', 'crime', 'drama', 'fantasy', 'family', 'horror', 'mystery', 'romance', 'sci-fi', 'thriller', 'war', 'western']
genres.forEach(g => {
  app.get(`/genre/${g}`, async (c) => c.json({ status: true, data: await scrapeInfinite(`${TARGET}/genre/${g}/`, 10) }))
})

// Countries (Maks 15 Halaman - Sesuai request bosku)
const countries = [
  { slug: 'korea', id: 'south-korea' },
  { slug: 'japan', id: 'japan' },
  { slug: 'thailand', id: 'thailand' },
  { slug: 'hong-kong', id: 'hong-kong' },
  { slug: 'china', id: 'china' }
]
countries.forEach(cn => {
  app.get(`/country/${cn.slug}`, async (c) => {
    // Mencoba lewat sistem Search Filter sesuai URL yang bosku temukan
    const searchUrl = `${TARGET}/?s=&search=advanced&country=${cn.id}`
    const data = await scrapeInfinite(searchUrl, 15)
    return c.json({ status: true, data })
  })
})

// Special / 18+
app.get('/semi-jepang', async (c) => c.json({ status: true, data: await scrapeInfinite(`${TARGET}/genre/semi-jepang/`, 15) }))
app.get('/semi-korea', async (c) => c.json({ status: true, data: await scrapeInfinite(`${TARGET}/genre/semi-korea/`, 15) }))

// Search
app.get('/search', async (c) => {
  const q = c.req.query('q')
  return c.json({ status: true, data: await scrapeList(`${TARGET}/?s=${q}`) })
})

// Detail (Ambil Iframe)
app.get('/detail', async (c) => {
  try {
    const url = c.req.query('url')
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Referer': TARGET } })
    const html = await res.text()
    const $ = load(html)
    const streams = []
    $('iframe').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src')
      if (src && !src.includes('ads') && !src.includes('facebook')) {
        if (src.startsWith('//')) src = 'https:' + src
        streams.push(src)
      }
    })
    return c.json({ status: true, streams })
  } catch { return c.json({ status: false, streams: [] }) }
})

export default handle(app)
