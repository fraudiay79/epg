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
  parser: function ({ content, date }) {
    const programs = [];
    _.forEach(content, (channelData) => {
      _.forEach(channelData.pr, (program) => {
        programs.push({
          title: program.ti,
          startDate: program.sd,
          definition: program.df,
          duration: program.dt,
          description: program.ld,
          start: program.df,
          stop: program.dt
        });
      });
    });
    return programs;
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

function parseItems(content) {
  const data = JSON.parse(content);
  if (!data || !Array.isArray(data.pr)) return [];
  return data.pr;
}
