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
  parser({ content, date }) {
    let programs = []
    const items = parseItems(content)
    items.forEach(item => {
      if (!item.details) return
      const start = item.startTime
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
  async function getChannels() {
  try {
    const response = await axios.get(`https://www.yes.co.il/o/yes/servletlinearsched/getchannels?p_auth=b1IRvxWi`);
    const data = response.data;

    // Check if data.channels exists before processing
    if (!data.channels) {
      throw new Error("Missing channels in response data");
    }

    // Extract channel data
    const channelData = data.channels.map(item => ({
      lang: 'he',
      site_id: item.channelId,
      name: item.channelName
    }));

    return channelData;
  } catch (error) {
    console.error("Error fetching channel data:", error);
    // You can also throw the error to be handled elsewhere
    // throw error;
  }
}
}

function parseItems(content, channel) {
  const data = JSON.parse(content, channel)

  return data
}
