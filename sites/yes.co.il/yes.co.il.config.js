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
  parser: function ({ content, date }) {
  const programs = [];
  const items = parseItems(content);

  items.forEach(item => {
    if (!item.details) return;

    const start = DateTime.fromISO(item.startDate + 'T' + item.startTime, { zone: 'Africa/Jerusalem' });
    const stop = start.plus({ minutes: item.broadcastItemDuration * 60 });

    programs.push({
      title: item.scheduleItemName,
      description: item.scheduleItemSynopsis,
      start,
      stop
    });
  });

  return programs;
},
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://www.yes.co.il/o/yes/servletlinearsched/getscheduale?startdate=20241127&p_auth=mmKfNOfX`)
      .then(r => r.data)
      .catch(console.log)
    return data.channels.map(item => {
      return {
        lang: 'he',
        name: item.channelName,
        site_id: item.channelId
      }
    })
  }
}

function parseItems(content) {
  const data = JSON.parse(content)

  return data
}
