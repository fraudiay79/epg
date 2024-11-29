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
  parser: function ({ content, channel }) {
    let programs = []
    const items = parseItems(content)
    items.forEach(item => {
      const prev = programs[programs.length - 1]
      let start = parseStart(item)
      if (prev) {
        if (start < prev.ch_programme.start) {
          start = start.plus({ days: 1 })
          date = date.add(1, 'd')
        }
        prev.stop = start
      }
      const stop = start.plus({ minutes: 30 })
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

function parseStart(item) {
  return dayjs(item.ch_programme.start).format('DD-MM-YYYY HH:mm')
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
