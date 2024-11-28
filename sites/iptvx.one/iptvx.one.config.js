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
    return `https://epg.drm-play.com/iptvx.one%2Fepg%2F${channel.site_id}.json`
  },
  parser({ content }) {
    const items = parseItems(content)
    let programs = []
    items.forEach(item => {
      if (!item || !item.epg_data) return
      const start = dayjs.unix(item.time)
      const stop = dayjs.unix(item.time_to)

      programs.push({
        title: item.epg_data.name,
        description: item.epg_data.descr,
        start,
        stop
      })
      
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    try {
      const data = await axios.get(`https://epg.iptvx.one/api/channels.json`)
      return data.channels.map(item => {
        return {
          lang: 'ru',
          name: item.chan_names,
          site_id: item.chan_id
        }
      })
    } catch (error) {
      console.error('Error fetching channels:', error)
      // Consider returning a default value or throwing an error
    }
  }
}

function parseItems(content) {
  try {
    const data = JSON.parse(content)
    if (!data || !Array.isArray(data.epg_data)) return []
    return data.epg_data
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return []
  }
}
