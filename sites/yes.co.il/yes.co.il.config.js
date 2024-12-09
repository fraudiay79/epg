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
  days: 1,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date }) {
    const formattedDate = date.utc().format('YYYYMMDD');
    return `https://www.yes.co.il/o/yes/servletlinearsched/getscheduale?startdate=${formattedDate}&p_auth=ue2qQse6`;
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
  async function getChannels() {
  try {
    const response = await axios.get('https://www.yes.co.il/o/yes/servletlinearsched/getchannels?p_auth=ue2qQse6');

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format');
    }

    return response.data.map(channel => ({
      lang: 'he',
      name: channel.channelName,
      site_id: channel.channelID
    }));
  } catch (error) {
    console.error('Error fetching channels:', error);
    return [];
  }
}
};
