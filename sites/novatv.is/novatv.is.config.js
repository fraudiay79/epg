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
      const start = dayjs(item.startTime)
      const stop = dayjs(item.endTime)
      programs.push({
        title: item.title,
        sub_title: item.undirtitill,
        description: item.localized.description,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://exposure.api.redbee.live/v1/customer/Nova/businessunit/novatvprod/content/asset?assetType=TV_CHANNEL&pageSize=12`)
      .then(r => r.data)
      .catch(console.log)
    return data.channels.map(item => {
      return {
        lang: 'is',
	name: item.items.localized.title,
        site_id: item.items.assetId
      }
    })
  }
}
  
function parseItems(content, channel) {
  const data = JSON.parse(content, channel)

  return data
}
