const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'stod2.is',
  channels: 'stod2.is.channels.xml',
  days: 7,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    return `https://api.stod2.is/dagskra/api/${channel.site_id}/${date.format('YYYY-MM-DD')}`
  },
  parser({ content }) {
    let programs = []
    const items = parseItems(content)

    items.forEach(item => {
      if (!item) return
      const start = dayjs.utc(item.upphaf)
      const stop = start.add(item.slott, 'm')

      programs.push({
        title: item.isltitill,
        sub_title: item.undirtitill,
        description: item.lysing,
        actors: item.adalhlutverk,
        directors: item.leikstjori,
        start,
        stop
      })
    })

    return programs;
  }
}

function parseItems(content) {
  const data = JSON.parse(content)
  if (!data || !Array.isArray(data)) return []
  return data
}
