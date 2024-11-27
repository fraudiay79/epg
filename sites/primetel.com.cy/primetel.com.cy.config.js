const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'primetel.com.cy',
  days: 1,
  url: function ({ date }) {
    return `https://primetel.com.cy/tv_guide_json/tv1.json`
  },
  request: {
    headers: {
      "X-Csrf-Token": "ndDHaV4QqdbXfnrhBKo5DSROYBSIAkFVEkcRrXDw",
      "X-Requested-With": "XMLHttpRequest",
      "referer": "https://primetel.com.cy/tv-guide-program",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0",
      "Accept": "application/json, text/javascript, */*; q=0.01"
    },
    timeout: 60000,
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  parser({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      if (!item) return
      const start = dayjs.utc(item.starting)
      const stop = dayjs.utc(item.ending)
      programs.push({
        title: item.title,
		channel: item.name,
        description: item.description,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://primetel.com.cy/tv_guide_json/tv1.json`)
      .then(r => r.data)
      .catch(console.log)
    return data.Channel44.map(item => {
      return {
        lang: 'el',
	name: item.ch,
        site_id: item.id
      }
    })
  }
}
  
function parseItems(content, channel) {
  const data = JSON.parse(content, channel)

  return data
}
