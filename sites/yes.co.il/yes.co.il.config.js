const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

module.exports = {
  site: 'yes.co.il',
  days: 1,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    const formattedDate = date.utc().format('YYYYMMDD');
    return `https://www.yes.co.il/o/yes/servletlinearsched/getscheduale?startdate=${formattedDate}&p_auth=RyUUI1eX`;
  },
  parser({ content }) {
    const programs = JSON.parse(content).schedule || [];

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
      const response = await axios.get('https://www.yes.co.il/o/yes/servletlinearsched/getchannels');
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
