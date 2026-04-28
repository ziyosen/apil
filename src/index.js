import { Hono } from 'hono'
import { load } from 'cheerio'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors())

const TARGET = 'https://tv10.lk21official.cc'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function scrapePage(url) {
  try {
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': UA,
        'Referer': 'https://google.com', // Pura-pura datang dari Google
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      } 
    })
    
    if (!res.ok) return []
    
    const html = await res.text()
    const $ = load(html)
    const data = []

    // Selector paling sakti buat lk21 terbaru
    $('#archive-content .v-item, .grid-main .box, article, .mega-item').each((i, el) => {
      // Ambil judul dari h2 atau alt gambar
      const title = $(el).find('h2, h3, a').first().text().trim() || $(el).find('img').attr('alt')
      const link = $(el).find('a').first().attr('href')
      
      // Ambil gambar dari segala penjuru atribut
      let img = $(el).find('img').attr('src') || 
                $(el).find('img').attr('data-src') || 
                $(el).find('img').attr('data-original') ||
                $(el).find('img').attr('srcset')
      
      if (title && link && !link.includes('/category/') && !link.includes('/genre/')) {
        // Bersihin link gambar kalau ada srcset
        if (img && img.includes(' ')) img = img.split(' ')[0]
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
  const pages = [1, 2, 3, 4, 5]
  const tasks = pages.map(p => {
    // Jalur paginasi lk21 terbaru biasanya pake ?fpage=2 atau /page/2
    const url = p === 1 ? baseUrl : `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}page/${p}/`
    return scrapePage(url)
  })
  
  const results = await Promise.all(tasks)
  const combined = results.flat()
  
  // Buang duplikat berdasarkan link
  return combined.filter((v, i, a) => a.findIndex(t => (t.link === v.link)) === i)
}

// --- ENDPOINTS ---
app.get('/', async (c) => c.json({ status: true, data: await scrapePage(TARGET) }))
app.get('/top-movie-today', async (c) => c.json({ status: true, data: await scrapePage(`${TARGET}/top-movie-today/`) }))

// GENRE
const genres = ['animation', 'action', 'adventure', 'comedy', 'crime', 'fantasy', 'family', 'horror', 'romance', 'thriller']
genres.forEach(g => {
  app.get(`/genre/${g}`, async (c) => c.json({ status: true, data: await scrapeFivePages(`${TARGET}/genre/${g}/`) }))
})

// COUNTRY
const countries = ['usa', 'japan', 'south-korea', 'china', 'thailand']
countries.forEach(ct => {
  app.get(`/country/${ct}`, async (c) => c.json({ status: true, data: await scrapeFivePages(`${TARGET}/country/${ct}/`) }))
})

// YEAR
const years = ['2017', '2018', '2019', '2020']
years.forEach(y => {
  app.get(`/year/${y}`, async (c) => c.json({ status: true, data: await scrapeFivePages(`${TARGET}/year/${y}/`) }))
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
      if (src && !src.includes('ads') && !src.includes('facebook')) {
        if (src.startsWith('//')) src = 'https:' + src
        streams.push(src)
      }
    })
    return c.json({ status: true, streams })
  } catch { return c.json({ status: false, streams: [] }) }
})

export default app
