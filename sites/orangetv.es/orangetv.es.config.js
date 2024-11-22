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
    items.forEach(item => {
      programs.push({
        title: item.programs.name,
        description: item.programs.description,
        season: item.programs.seriesSeason || null,
        episode: item.programs.episodeId || null,
        start: parseStart(item),
        stop: parseStop(item)
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://pc.orangetv.orange.es/pc/api/rtv/v1/GetChannelList?bouquet_id=1&model_external_id=PC&filter_unsupported_channels=false&client=json`)
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

function parseStart(item) {
  if (!item.programs || !item.programs.startDate) return null

  return item.startDate ? dayjs.unix(item.programs.startDate) : null
}

function parseStop(item) {
  if (!item.programs || !item.programs.endDate) return null

  return item.endDate ? dayjs.unix(item.programs.endDate) : null
}

function parseItems(content) {
  const data = JSON.parse(content)
  if (!data || !Array.isArray(data.programs)) return []

  return data.programs
}
