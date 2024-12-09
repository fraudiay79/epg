const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'edem.tv',
  channels: 'edem.tv.channels.xml',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    return `http://epg.drm-play.com/edem%2Fepg%2F${channel.site_id}.json`
  },
  parser: function ({ content }) {
    const data = JSON.parse(content)
    const programs = []

  data.forEach(item => {
    programs.push({
      name: item.epg_data.epg,
      description: item.epg_data.desc || 'No description available',
      start: dayjs.unix(item.epg_data.start),
      stop: dayjs.unix(item.epg_data.stop)
    })
  })

  return programs
  }
}
