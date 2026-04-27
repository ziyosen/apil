import { Hono } from 'hono'
import { load } from 'cheerio'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors())

const TARGET = 'https://hometeaparty.com'

async function scrapeList(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
    const html = await res.text()
    const $ = load(html)
    const data = []

    $('article, .post, .item').each((i, el) => {
      const title = $(el).find('h2, .entry-title').text().trim()
      const link = $(el).find('a').attr('href')
      const img = $(el).find('img').attr('src')
      if (title && link) data.push({ title, link, img })
    })
    return data
  } catch { return [] }
}

app.get('/', async (c) => c.json({ status: true, data: await scrapeList(TARGET) }))

// Endpoint Filter (Untuk Genre & Country)
app.get('/filter', async (c) => {
  const { country, genre, year } = c.req.query()
  const url = `${TARGET}/?s=&search=advanced&post_type=post&genre=${genre || ''}&movieyear=${year || ''}&country=${country || ''}`
  return c.json({ status: true, data: await scrapeList(url) })
})

// Endpoint Tag (Untuk menu Tags)
app.get('/tag/:slug', async (c) => {
  const slug = c.req.param('slug')
  return c.json({ status: true, data: await scrapeList(`${TARGET}/tag/${slug}/`) })
})

// Endpoint Detail (VERSI KUAT)
app.get('/detail', async (c) => {
  const url = c.req.query('url')
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    const $ = load(html)
    const streams = []

    // Cari di semua iframe & data-src (tempat video biasanya ngumpet)
    $('iframe, ins, div[data-src]').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-frame-src')
      if (src && src.includes('//') && !src.includes('ads') && !src.includes('facebook')) {
        if (src.startsWith('//')) src = 'https:' + src
        streams.push(src)
      }
    })

    return c.json({ 
      status: true, 
      title: $('h1, .entry-title').first().text().trim(), 
      streams: [...new Set(streams)] 
    })
  } catch { return c.json({ status: false, streams: [] }) }
})

export default app
