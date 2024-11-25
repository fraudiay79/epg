const dayjs = require('dayjs')
const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
  site: 'ipko.tv',
  days: 5,
  request: {
    headers: {
      'Cookie': '_ga=GA1.1.1594658574.1730067846; STARGATE_PROD_SERVER_USED=f60cf9b6677f11d2; _ga_BMVP97ZTBD=GS1.1.1730222132.2.0.1730222140.0.0.0; _ga_JH31200EE9=GS1.1.1731039510.3.1.1731039812.0.0.0',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
	  'Origin': 'https://ipko.tv'
    },
  url() {
    return `https://stargate.ipko.tv/api/titan.tv.WebEpg/EpgFilter`
  },
  parser({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      if (!item) return
      programs.push({
        title: item.shows.title,
        image: item.shows.thumbnail,
        start: dayjs.unix(item.shows.show_start),
        stop: dayjs.unix(item.shows.show_end)
      })
    })

    return programs
  },
  
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://stargate.ipko.tv/api/titan.tv.WebEpg/EpgFilter`)
      .then(r => r.data)
      .catch(console.log)
    return data.channels.map(item => {
      return {
        lang: 'sq',
		name: item.channel_name,
        site_id: item.channel_id
      }
    })
  }
}
  
function parseItems(content, channel) {
  const data = JSON.parse(content)
  if (!data) return []

  return data[channel.site_id] || []
}
