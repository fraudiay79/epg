const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

const API_ENDPOINT = 'https://www.yes.co.il/o/yes/servletlinearsched';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

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
    return `${API_ENDPOINT}/getscheduale?startdate=${formattedDate}&p_auth=ue2qQse6`;
  },
  parser({ content }) {
    const programs = JSON.parse(content).schedule || [];

    return programs.map(program => {
      return {
        title: program.scheduleItemName,
        description: item.scheduleItemSynopsis || 'No description available',
        start: dayjs(item.startDate).utc().format(),
      stop: dayjs(item.startDate).add(dayjs.duration(item.broadcastItemDuration)).utc().format()
      };
    });
  },
  async channels() {
    // Modify this part based on how you fetch channels information
    const axios = require('axios');
    try {
      const response = await axios.get('${API_ENDPOINT}/getchannels?p_auth=ue2qQse6');
      return response.data.map(channel => {
        return {
		  lang: 'he',
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
