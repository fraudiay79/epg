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
  parser: function ({ content }) {
    let programs = []
    const items = parseItems(content)

    items.forEach(item => {
        //const start = dayjs.utc(item.asset.startTime)
        //const stop = dayjs.utc(item.asset.endTime)
      programs.push({
          title: item.asset.title,
          description: item.asset.localized.description,
          start: item.asset.startTime,
          stop: item.asset.endTime
      })
    })
    return programs;
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
        name: item.localized.title,
        site_id: item.assetId
      }
    })
  }
}


function parseItems(content) {
  const data = JSON.parse(content)
  if (!data || !Array.isArray(data.programs)) return []

  return data.programs
}
