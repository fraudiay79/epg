const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'programmestv.sudinfo.be',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url() {
    return `https://programmestv.sudinfo.be/_next/data/DwIAfQHy0e8mtvHHkDwzJ/programme-tv/ce-soir.json`
  },
  parser: function ({ content }) {
    let programs = []
    const items = parseItems(content)

    items.forEach(item => {
        const start = dayjs.utc(item.pageProps.filteredContent.airingStartDateTime)
        const stop = dayjs.utc(item.pageProps.filteredContent.airingEndDateTime)
      programs.push({
          title: item.pageProps.filteredContent.title,
          start,
          stop
      })
    })
    return programs;
  },
  
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://programmestv.sudinfo.be/_next/data/DwIAfQHy0e8mtvHHkDwzJ/programme-tv/ce-soir.json`)
      .then(r => r.data)
      .catch(console.log)
    return data.pageProps.filteredChannels.map(item => {
      return {
        lang: 'fr',
        name: item.name,
        site_id: item.id
      }
    })
  }
}


function parseItems(content) {
  const data = JSON.parse(content)
  if (!data || !Array.isArray(data.pageProps.filteredContent)) return []

  return data.pageProps.filteredContent
}
