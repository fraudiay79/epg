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
    const items = parseItems(content, channel, date)
    let programs = []
    let prevStop = null
    items.forEach(item => {
      if (!item || !item.ch_programme) return
      const start = dayjs.utc(item.start, 'DD-MM-YYYY HH:mm')
      const stop = start.add(1, 'hour')

      programs.push({
        title: item.title,
        description: item.description,
        category: item.category,
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
  const data = JSON.parse(content); 
  const programs = data.ch_programme || []; 
  return programs.map(program => { 
    return { 
      title: program.title, 
      description: program.description, 
      category: program.category, 
      start: dayjs.utc(program.start, 'DD-MM-YYYY HH:mm'), 
      stop: program.stop ? dayjs.utc(program.stop, 'DD-MM-YYYY HH:mm') : null 
    }; 
  }); 
}
