const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

module.exports = {
  site: 'iptvx.one',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel }) {
    return `https://epg.iptvx.one/api/id/${channel.site_id}.json`;
  },
  parser({ content }) {
    const programs = JSON.parse(content).ch_programme || [];
    let prevStop = null;

    return programs.map(program => {
      if (!program) return null;
      const start = dayjs.utc(program.start, 'DD-MM-YYYY HH:mm');
      const stop = program.stop ? dayjs.utc(program.stop, 'DD-MM-YYYY HH:mm') : start.add(1, 'hour');

      return {
        title: program.title,
        description: program.description,
        category: program.category,
        start: start.toISOString(),
        stop: stop.toISOString()
      };
    }).filter(program => program !== null);
  },
  async channels() {
    const axios = require('axios');
    try {
      const response = await axios.get(`https://epg.iptvx.one/api/channels.json`);
      return response.data.channels.map(channel => {
        return {
          lang: 'ru',
          name: channel.chan_names,
          site_id: channel.chan_id
        };
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      // Consider returning a default value or throwing an error
      return [];
    }
  }
};

function parseItems(content) {
  try {
    const data = JSON.parse(content);
    if (!data || !Array.isArray(data.ch_programme)) return [];
    return data.ch_programme;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
}
