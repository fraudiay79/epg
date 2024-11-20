const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

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
  parser: function ({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      programs.push({
        title: item.channelEpgs.epgPlayables.name,
        start: dayjs.unix(item.channelEpgs.epgPlayables.startTime),
        stop: dayjs.unix(item.channelEpgs.epgPlayables.endTime)
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
