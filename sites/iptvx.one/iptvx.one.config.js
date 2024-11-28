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
  parser({ content, channel, date }) {
    // Assuming parseItems is specific to iptvx.one format
    const items = parseItems(content)
    let programs = []
    let prevStop = null
    items.forEach(item => {
      if (!item || !item.ch_programme) return
      const start = dayjs.utc(item.ch_programme.start, 'DD-MM-YYYY HH:mm')
      const stop = start.add(1, 'hour')

      programs.push({
        title: item.ch_programme.title,
        description: item.ch_programme.description,
        category: item.ch_programme.category,
        start,
        stop
      })
      prevStop = stop
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
    if (!data || !Array.isArray(data.ch_programme)) return []
    return data.ch_programme
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return []
  }
}
