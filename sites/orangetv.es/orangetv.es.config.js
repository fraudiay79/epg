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
        title: item.name,
        description: item.description,
        season: item.seriesSeason || null,
        episode: item.episodeId || null,
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
  return dayjs.unix(item.startDate)
}

function parseStop(item) {
  return dayjs.unix(item.endDate)
}


function parseItems(content) {
  const data = JSON.parse(content);

  if (!data || !Array.isArray(data.programs)) {
    return [];
  }

  return data.programs.map(program => ({
    title: program.name,
    description: program.description,
    season: program.seriesSeason || null,
    episode: program.episodeId || null,
    start: dayjs.unix(program.startDate),
    stop: dayjs.unix(program.endDate),
    genres: program.genres.map(genre => genre.name),
    //image: program.attachments.find(attachment => attachment.name === 'COVER')?.value,
  }));
}
