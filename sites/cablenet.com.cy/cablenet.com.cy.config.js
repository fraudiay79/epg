const dayjs = require('dayjs')
const _ = require('lodash')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'cablenet.com.cy',
  days: 6,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    return `https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg${date.format('YYYY-MM-DD')}.json`
  },
function parseProgramData(jsonData) {
  const parsedData = [];

  _.forEach(jsonData, (channelData) => {
    _.forEach(channelData.pr, (program) => {
      const parsedProgram = {
        title: program.ti,
        start: program.df,
        stop: new Date(new Date(program.df).getTime() + program.du * 1000).toISOString(),
        description: program.ld,
      };
      parsedData.push(parsedProgram);
    });
  });

  return parsedData;
},
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg2024-11-27.json`)
      .then(r => r.data)
      .catch(console.log)
    const channelData = Object.keys(data).map(channelId => ({
      lang: 'el',
      name: data[channelId].ch,
      site_id: data[channelId].id
    }));

    return channelData;
  }
}
  
function parseItems(content) {
  const data = JSON.parse(content);

  const programs = [];

  // Iterate over each channel and its programs
  for (const channelId in data) {
    if (data.hasOwnProperty(channelId)) {
      const channelPrograms = data[channelId].pr;
      channelPrograms.forEach(program => {
        programs.push({
          channelId,
          title: program.ti,
          description: program.ld,
          start: program.df,
          stop: new Date(new Date(program.df).getTime() + program.du * 1000).toISOString()
          // Add other properties as needed, e.g.,
          // isLive: program.lv,
          // category: program.ma // Assuming 'ma' represents a category
        });
      });
    }
  }

  return programs;
}
