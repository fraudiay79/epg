const dayjs = require('dayjs')
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
  async channels({ date }) {
    const axios = require('axios')
    const data = await axios
      .get(`https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg2024-11-27.json`)
      .then(r => r.data)
      .catch(console.log)
    return data.channel.map(item => {
      return {
        lang: 'el',
	name: item.ch,
        site_id: item.id
      }
    })
  }
}
  
function parseItems(content) {
  const data = JSON.parse(content)

  return data.pr
}
