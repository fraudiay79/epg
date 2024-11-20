const dayjs = require('dayjs')

module.exports = {
  site: 'cyta.com.cy',
  days: 5,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    return `https://epg.cyta.com.cy/api/mediacatalog/fetchEpg?startTimeEpoch=${date.unix()}&endTimeEpoch=${date.add(1, 'd').unix()}&language=0&channelIds=${channel.site_id}`
  },
  parser({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      if (!item) return
      const start = dayjs(item.epgPlayables.startTime)
      const stop = dayjs(item.epgPlayables.endTime)
      programs.push({
        title: item.epgPlayables.name,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://epg.cyta.com.cy/api/mediacatalog/fetchChannels?language=0`)
      .then(r => r.data)
      .catch(console.log)
    return data.channels.map(item => {
      return {
        lang: 'el',
        site_id: item.id,
		name: item.name
      }
    })
  }
}
  
function parseItems(content, channel) {
  const data = JSON.parse(content, channel)

  return data
}
