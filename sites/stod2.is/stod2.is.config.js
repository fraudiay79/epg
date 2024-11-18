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
  parser({ content }) {
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
  async channels({ channel }) {
    const paths = {
      ad: 'beint',
      bf: 'besta01',
      bi: 'besta02',
      bj: 'besta03',
      bl: 'bio',
      cd: 'esport',
      sp5: 'golfstodin',
      cg: 'pepsimax',
      sp1: 'sport',
      sp2: 'sport2',
      sp3: 'sport3',
      sp4: 'sport4',
      sp6: 'sport6',
      st2: 'stod2',
      st3: 'stod3',
      vsp: 'vodasport'
    }

    let channels = []
    const path = paths[channel]
    const url = `https://api.stod2.is/dagskra/api/${path}`
    const data = await axios
      .get(url)
      .then(r => r.data)
      .catch(console.log)

    data.channels.forEach(channel => {
      const site_id = channel === 'st2' ? `#${channel.id}` : `${channel}#${channel.id}`

      if (channel.name === '.') return

      channels.push({
        lang: 'is',
        site_id,
        name: channel.name
      })
    })

    return channels
  }

function parseItems(content) {
  const data = JSON.parse(content)
  if (!Array.isArray(data)) return []

  return data
}
