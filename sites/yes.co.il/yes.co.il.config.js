const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'yes.co.il',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    const formattedDate = date.format('YYYYMMDD');
    return `https://www.yes.co.il/o/yes/servletlinearsched/getscheduale?startdate=${formattedDate}&p_auth=TB5Pe8T1`;
  },
  parser: async function ({ content }) {
    try {
      const data = JSON.parse(content);
      return this.parseEPGData(data);
    } catch (error) {
      console.error('Error parsing EPG data:', error);
      return [];
    }
  },
  parseEPGData(data) {
    return data.map(program => ({
      id: program.id,
      title: program.title,
      description: program.description || 'No description available',
      start: dayjs(program.startTime).format('YYYY-MM-DDTHH:mm:ssZ'),
      stop: dayjs(program.endTime).format('YYYY-MM-DDTHH:mm:ssZ'),
      genres: program.genres || [],
      images: program.images || [],
      mainCategory: program.mainCategory || 'No main category'
    }));
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
