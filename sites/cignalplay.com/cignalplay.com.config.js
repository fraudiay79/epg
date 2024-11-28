const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

module.exports = {
  site: 'cignalplay.com',
  days: 1,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    const start = date.utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
    const end = date.utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
    return `https://live-data-store-cdn.api.pldt.firstlight.ai/content/epg?start=${start}&end=${end}&reg=ph&dt=all&client=pldt-cignal-web&pageNumber=1&pageSize=100`;
  },
  parser({ content }) {
    const programs = JSON.parse(content);

    return programs.map(program => {
      return {
        title: program.title,
        description: program.description,
        start: dayjs.utc(program.start).toISOString(),
        stop: dayjs.utc(program.stop).toISOString()
      };
    });
  },
  async channels() {
    // Modify this part based on how you fetch channels information
    const axios = require('axios');
    try {
      const response = await axios.get('https://live-data-store-cdn.api.pldt.firstlight.ai/content/epg/channels');
      return response.data.channels.map(channel => {
        return {
          name: channel.name,
          site_id: channel.id
        };
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }
};
