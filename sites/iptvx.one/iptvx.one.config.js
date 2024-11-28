const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'iptvx.one',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel }) {
    return `https://epg.iptvx.one/api/id/${channel.site_id}.json`
  },
  parser({ content }) {
    let programs = []
    const items = parseItems(content)
    items.forEach(item => {
      if (!item) return
      let start = dayjs.utc(item.ch_programme.start)
      if (prev) {
        if (start < prev.start) {
          start = start.plus({ days: 1 })
          date = date.add(1, 'd')
        }
        prev.stop = start
      }
      const stop = start.plus({ hours: 1 })
      programs.push({
        title: item.ch_programme.title,
        description: item.ch_programme.description,
        category: item.ch_programme.category,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://epg.iptvx.one/api/channels.json`)
      .then(r => r.data)
      .catch(console.log)
    return data.channels.map(item => {
      return {
        lang: 'ru',
        name: item.chan_names,
        site_id: item.chan_id
      }
    })
  }
}
  
function parseItems(content) {
  const data = JSON.parse(content)

  return data
}
