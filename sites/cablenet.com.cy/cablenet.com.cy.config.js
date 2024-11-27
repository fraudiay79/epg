const dayjs = require('dayjs')
const axios = require('axios')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'cablenet.com.cy',
  days: 6,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    return `https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg${date.format('YYYY-MM-DD')}.json`
  },
  parser({ content, date }) {
    let programs = []
    const items = parseItems(content)
    items.forEach(item => {
      if (!item) return
      const start = dayjs.utc(item.pr.df)
      const stop = dayjs.utc(item.pr.dt)
      programs.push({
        title: item.pr.ti,
        description: item.pr.sd,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const result = await axios
      .get(`https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg2024-11-27.json`)
      .then(r => r.data)
      .catch(console.error)

    return result.map(item => {
      return {
        lang: 'el',
        site_id: item.id,
        name: item.ch
      }
    })
  }
}
  
function parseItems(content) {
  const data = JSON.parse(content)

  return data.pr
}
