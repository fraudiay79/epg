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
    // Assuming parseItems is specific to iptvx.one format
    const items = parseItems(content)
    let programs = []
    let prev = null
    items.forEach(item => {
      if (!item) return
      let start = dayjs.utc(item.ch_programme.start)
      if (prev) {
        if (start < prev.start) {
          start = start.plus({ days: 1 })
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
      prev = programs[programs.length - 1]
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
