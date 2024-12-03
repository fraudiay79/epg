const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'programmestv.sudinfo.be',
  days: 1,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url() {
    return `https://programmestv.sudinfo.be/_next/data/DwIAfQHy0e8mtvHHkDwzJ/programme-tv/ce-soir.json`
  },
  parser: function ({ content }) {
    const programs = []
    content.forEach(array => {
    array.forEach(item => {
      programs.push({
        title: item.title,
        description: item.subTitle || 'No description available',
        start: dayjs.utc(item.airingStartDateTime),
        stop: dayjs.utc(item.airingEndDateTime)
      });
    });
  });
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
