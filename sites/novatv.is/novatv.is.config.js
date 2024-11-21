const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'novatv.is',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    return `https://exposure.api.redbee.live/v2/customer/Nova/businessunit/novatvprod/epg/${channel.site_id}/date/${date.format('YYYY-MM-DD')}`
  },
  parser({ channel, content }) {
    const programs = []
    if (content) {
      const items = JSON.parse(channel, content)
      items.forEach(item => {
        programs.push({
          title: item.program.title,
          description: item.program.description,
          season: item.program.season,
          episode: item.program.episode,
          start: dayjs.utc(item.program.startTime),
          stop: dayjs.utc(item.program.endTime)
        })
      })
    }

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://exposure.api.redbee.live/v1/customer/Nova/businessunit/novatvprod/content/asset?assetType=TV_CHANNEL`)
      .then(r => r.data)
      .catch(console.log)
    return data.items.map(item => {
      return {
        lang: 'is',
        site_id: item.assetId
      }
    })
  }
}

function parseTime(time) {
  return dayjs.tz(time, 'YYYY-MM-DD HH:mm', 'Africa/Abidjan')
}
  
function parseItems(channel, content) {
  const data = JSON.parse(channel, content)

  return data
}
