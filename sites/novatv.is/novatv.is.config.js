const dayjs = require('dayjs')

module.exports = {
  site: 'novatv.is',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    return `https://exposure.api.redbee.live/v2/customer/Nova/businessunit/novatvprod/epg/date/${date.format('YYYY-MM-DD')}`
  },
  parser({ content }) {
    let programs = []
    const items = parseItems(content)
    items.forEach(item => {
      programs.push({
        title: item.programs.title,
        description: item.programs.description,
        image: parseImage(item),
        start: parseTime(item.startTime),
        stop: parseTime(item.endTime)
      })
    })

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

function parseImage(item) {
  const last = item.images.pop()
  if (!last) return null
  return last.url
}

function parseTime(time) {
  return dayjs.tz(time, 'YYYY-MM-DD HH:mm', 'Africa/Abidjan')
}
  
function parseItems(content) {
  const data = JSON.parse(content)

  return data
}
