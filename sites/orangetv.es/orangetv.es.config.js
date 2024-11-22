const dayjs = require('dayjs')

module.exports = {
  site: 'orangetv.es',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    return `https://epg.orangetv.orange.es/epg/Smartphone_Android/1_PRO/${date.format('YYYYMMDD')}_8h_1.json`
  },
  parser({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      if (!item) return
      const start = dayjs(item.programs.startDate)
      const stop = dayjs(item.programs.endDate)
      programs.push({
        title: item.programs.name,
        episode: item.programs.episodeId,
		season: item.programs.seriesSeason,
        description: item.programs.description,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://pc.orangetv.orange.es/pc/api/rtv/v1/GetChannelList?bouquet_id=1&model_external_id=PC&filter_unsupported_channels=true&client=json`)
      .then(r => r.data)
      .catch(console.log)
    return data.response.map(item => {
      return {
        lang: 'es',
		    name: item.name,
        site_id: item.externalChannelId
      }
    })
  }
}
  
function parseItems(content, channel) {
  const data = JSON.parse(content, channel)

  return data
}
