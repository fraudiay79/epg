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
    return `https://exposure.api.redbee.live/v2/customer/Nova/businessunit/novatvprod/epg/date/${date.format('YYYY-MM-DD')}?pageSize=5000`
  },
  parser({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      if (!item) return
      const start = dayjs(item.programs.startTime)
      const stop = dayjs(item.programs.endTime)
      programs.push({
        title: item.programs.asset.title,
        description: item.programs.asset.description,
        start,
        stop
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
  
function parseItems(content, channel) {
  const data = JSON.parse(content, channel)

  return data
}
