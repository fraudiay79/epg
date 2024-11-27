const dayjs = require('dayjs')

module.exports = {
  site: 'yes.co.il',
  days: 2,
  request: {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
    }
  },
  url({ date }) {
    return `https://www.yes.co.il/o/yes/servletlinearsched/getscheduale?startdate=${date.format('YYYYMMDD')}&p_auth=b1IRvxWi`
  },
  parser({ content, channel }) {
    let programs = []
    const items = parseItems(content, channel)
    items.forEach(item => {
      if (!item.details) return
      const start = dayjs(item.startTime)
      const stop = start.add(item.broadcastItemDuration, 'm')
      programs.push({
        title: item.scheduleItemName,
        description: item.scheduleItemSynopsis,
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://www.yes.co.il/o/yes/servletlinearsched/getchannels?p_auth=b1IRvxWi`)
      .then(r => r.data)
      .catch(console.log)

    return data.channels.map(item => {
      return {
        lang: 'he',
        site_id: item.channelId,
        name: item.channelName
      }
    })
  }
}

function parseItems(content, channel) {
  const data = JSON.parse(content, channel)

  return data
}
