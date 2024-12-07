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
      id: program.channelID,
      title: program.scheduleItemName,
      description: program.scheduleItemSynopsis || 'No description available',
      start: dayjs(program.startTime).format('YYYY-MM-DDTHH:mm:ssZ'),
      stop: start.add(item.broadcastItemDuration, 'm')
    }));
  },
  async channels() {
    const axios = require('axios');
    try {
      const response = await axios.get('https://www.yes.co.il/o/yes/servletlinearsched/getchannels?p_auth=TB5Pe8T1');
      return response.data.channels.map(channel => {
        return {
        lang: 'he',
        site_id: item.channelId,
        name: item.channelName
        };
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }
};
