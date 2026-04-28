import { Hono } from 'hono'
import { load } from 'cheerio'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors())

const TARGET = 'https://pafipasarmuarabungo.org'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function scrapeList(url) {
  try {
    const res = await fetch(url, { 
      headers: { 'User-Agent': UA, 'Referer': TARGET } 
    })
    const html = await res.text()
    const $ = load(html)
    const data = []

    // Selector disesuain sama struktur pafipasarmuarabungo
    $('.ml-item, article, .item').each((i, el) => {
      const title = $(el).find('h2, h3, .entry-title').text().trim()
      const link = $(el).find('a').attr('href')
      let img = $(el).find('img').attr('data-src') || $(el).find('img').attr('src')
      
      if (title && link) {
        if (img && img.startsWith('//')) img = 'https:' + img
        data.push({ title: title.trim(), link, img: img || '' })
      }
    })
    return data
  } catch { return [] }
}

// FUNGSI KHUSUS INFINITE SCROLL (Ambil banyak data sekaligus)
async function scrapeInfinite(baseUrl, limitPage = 5) {
  const tasks = []
  for (let i = 1; i <= limitPage; i++) {
    // Web model gini biasanya tetep nerima parameter ?page= atau /page/ di URL-nya 
    // meskipun di tampilan gak ada tombolnya
    const url = i === 1 ? baseUrl : `${baseUrl}/page/${i}/`
    tasks.push(scrapeList(url))
  }
  const results = await Promise.all(tasks)
  return results.flat().filter((v, i, a) => a.findIndex(t => (t.link === v.link)) === i)
}

// --- ENDPOINTS ---
app.get('/', async (c) => c.json({ status: true, data: await scrapeInfinite(TARGET, 3) }))

app.get('/action', async (c) => c.json({ status: true, data: await scrapeInfinite(`${TARGET}/genre/action/`, 5) }))
app.get('/drama', async (c) => c.json({ status: true, data: await scrapeInfinite(`${TARGET}/genre/drama/`, 5) }))
app.get('/comedy', async (c) => c.json({ status: true, data: await scrapeInfinite(`${TARGET}/genre/comedy/`, 5) }))

app.get('/search', async (c) => {
  const q = c.req.query('q')
  return c.json({ status: true, data: await scrapeList(`${TARGET}/?s=${q}`) })
})

app.get('/detail', async (c) => {
  try {
    const url = c.req.query('url')
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
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
