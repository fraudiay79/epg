const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'edem.tv',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel }) {
    return `http://epg.drm-play.com/edem%2Fepg%2F${channel.site_id}.json`
  },
  parser: function ({ content }) {
    const data = JSON.parse(content)
    const programs = []

  data.epg_data.forEach(item => {
    programs.push({
      name: item.name,
      description: item.descr || 'No description available',
      start: dayjs.unix(item.time),
      stop: dayjs.unix(item.time_to)
    })
  })

  return programs
  },
  async channels() {
    const axios = require('axios')
    try {
      const response = await axios.get(`https://exposure.api.redbee.live/v1/customer/Nova/businessunit/novatvprod/content/asset?assetType=TV_CHANNEL`)
      return response.data.items.map(item => {
        return {
          lang: 'is',
          name: item.localized[0].title,
          site_id: item.assetId
        }
      })
    } catch (error) {
      console.error('Error fetching channels:', error)
      return []
    }
  }
}
