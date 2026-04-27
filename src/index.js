import { Hono } from 'hono'
import { load } from 'cheerio'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors())

const TARGET = 'https://hometeaparty.com'

// --- HELPER SCRAPER ---
async function scrapeList(url) {
  try {
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } 
    })
    const html = await res.text()
    const $ = load(html)
    const data = []

    // Selector fleksibel untuk menangkap berbagai struktur grid
    $('article, .post, .item, .ml-item').each((i, el) => {
      const title = $(el).find('h2, .entry-title, .post-title').text().trim()
      const link = $(el).find('a').attr('href')
      const img = $(el).find('img').attr('src')

      if (title && link) {
        data.push({ title, link, img })
      }
    })
    return data
  } catch (err) {
    return []
  }
}

// --- ENDPOINTS ---

// 1. Home (Film Terbaru)
app.get('/', async (c) => {
  const data = await scrapeList(TARGET)
  return c.json({ status: true, type: 'home', data })
})

// 2. Indonesia (Menggunakan Filter Country agar lebih akurat)
app.get('/indonesia', async (c) => {
  const url = `${TARGET}/?s=&search=advanced&post_type=post&country=indonesia`
  const data = await scrapeList(url)
  return c.json({ status: true, type: 'category', slug: 'indonesia', data })
})

// 3. Layarkaca21 (Khusus Tag)
app.get('/layarkaca21', async (c) => {
  const data = await scrapeList(`${TARGET}/tag/layarkaca21/`)
  return c.json({ status: true, type: 'tag', slug: 'layarkaca21', data })
})

// 4. Tag Umum (Bisa buat tag apa saja: /tag/18, /tag/drakor, dll)
app.get('/tag/:slug', async (c) => {
  const slug = c.req.param('slug')
  const data = await scrapeList(`${TARGET}/tag/${slug}/`)
  return c.json({ status: true, type: 'tag', slug, data })
})

// 5. Advanced Filter (Bisa pilih country, year, quality, genre)
app.get('/filter', async (c) => {
  const { country, quality, year, genre } = c.req.query()
  const filterUrl = `${TARGET}/?s=&search=advanced&post_type=post&genre=${genre || ''}&movieyear=${year || ''}&country=${country || ''}&quality=${quality || ''}`
  const data = await scrapeList(filterUrl)
  return c.json({ status: true, filter: { country, quality, year, genre }, data })
})

// 6. Search
app.get('/search', async (c) => {
  const q = c.req.query('q')
  const data = await scrapeList(`${TARGET}/?s=${q}`)
  return c.json({ status: true, query: q, data })
})

// 7. Detail (Ambil link streaming/iframe dari dalam postingan)
app.get('/detail', async (c) => {
  const url = c.req.query('url')
  if (!url) return c.json({ status: false, message: 'URL required' }, 400)
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    const $ = load(html)
    
    const streams = []
    $('iframe').each((i, el) => {
      const src = $(el).attr('src')
      if (src) streams.push(src)
    })

    return c.json({ 
      status: true, 
      title: $('.entry-title, h1').first().text().trim(),
      streams 
    })
  } catch (err) {
    return c.json({ status: false, message: err.message }, 500)
  }
})

export default app
