const dayjs = require('dayjs')

module.exports = {
  site: 'stod2.is',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel }) {
    return `https://api.stod2.is/dagskra/api/${channel.site_id}`
  },
  parser({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      if (!item) return
      const start = dayjs(item.upphaf)
      const stop = start.add(item.slott, 'm')
      programs.push({
        title: item.isltitill,
        sub_title: item.undirtitill,
        description: item.lysing,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://api.stod2.is/dagskra/api`)
      .then(r => r.data)
      .catch(console.log)
    return data.channels.map(item => {
      return {
        lang: 'is',
        site_id: item.id
      }
    })
  }
}
  
function parseItems(content, channel) {
  const data = JSON.parse(content)
  if (!Array.isArray(data)) return []

  return data
}
