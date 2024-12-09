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
  days: 3,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    return `https://www.yes.co.il/o/yes/servletlinearsched/getscheduale?startdate=${date.format('YYYYMMDD')}&p_auth=${channel.p_auth}`;
  },
  async parser({ content }) {
    const shows = [];
    const data = JSON.parse(content);

    data.forEach(program => {
      const show = {
        channel: program.channelID,
        title: program.scheduleItemName,
        description: program.scheduleItemSynopsis || 'No description available',
        start: dayjs(program.startDate).utc().format(),
        stop: dayjs(program.startDate).add(dayjs.duration(program.broadcastItemDuration)).utc().format()
      };
      shows.push(show);
    });

    return shows;
  },
  async channels() {
    const authToken = await this.getAuthToken();
    const url = `https://www.yes.co.il/o/yes/servletlinearsched/getchannels?p_auth=${authToken}`;
    
    try {
        const response = await axios.get(url);
        if (response.data && Array.isArray(response.data)) {
            const channels = response.data.map(channel => ({
                lang: 'he',
                name: channel.channelID,
                site_id: channel.channelID,
                p_auth: authToken
            }));
            return channels;
        } else {
            console.error('Response data is not an array:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching channels:', error);
        return [];
    }
},
  async getAuthToken() {
    const url = 'https://www.yes.co.il/content/tvguide';
    const response = await axios.get(url);
    const textToSearch = ';Liferay.authToken =';
    const mainPageHtml = response.data;
    const idx = mainPageHtml.indexOf(textToSearch);
    const val = mainPageHtml.substring(idx + textToSearch.length + 1, 30);
    const authToken = val.split(';')[0].substring(0, val.length - 1);
    return authToken;
  }
};
