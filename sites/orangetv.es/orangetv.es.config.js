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
  parser: function ({ content }) {
    let programs = []
    const items = parseItems(content)
    if (!items.length == 0) {
      items.forEach(item => {
        const start = dayjs.utc(item.startDate)
        const stop = dayjs.utc(item.endDate)
        programs.push({
          title: item.name,
          description: item.description,
          episode: item.episodeId,
	  season: item.seriesSeason,
          start,
          stop
        })
      })
    }
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
  
function parseItems(content) {
  let data
  try {
    data = JSON.parse(content)
  } catch (error) {
    return []
  }

  if (!data || !data['programs']) {
    return []
  }

  return data.programs
}
