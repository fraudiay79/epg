const dayjs = require('dayjs');
const _ = require('lodash');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

module.exports = {
  site: 'cablenet.com.cy',
  days: 6,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    return `https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg${date.format('YYYY-MM-DD')}.json`;
  },
  parser: function ({ content, channel, date }) {
  const parsedData = JSON.parse(content, channel);
  const programs = [];

  Object.keys(parsedData).forEach(id => {
    const channel = parsedData[id];
    if (channel.pr) {
      channel.pr.forEach(item => {
        const program = {
          title: item.ti,
          start: item.df,
          stop: item.dt,
          description: item.sd || item.ld
        }
        programs.push(program)
      })
    }
  })

  return programs
},
  async channels() {
    const axios = require('axios');
    const data = await axios
      .get(`https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg2024-11-27.json`)
      .then(r => r.data)
      .catch(console.log);

    const channelData = Object.keys(data).map(channelId => ({
      lang: 'el',
      name: data[channelId].ch,
      site_id: data[channelId].id
    }));

    return channelData;
  }
};
