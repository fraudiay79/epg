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
  days: 7, // maxdays=7
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date, authToken }) {
    return `https://www.yes.co.il/o/yes/servletlinearsched/getscheduale?startdate=${date.format('YYYYMMDD')}&p_auth=${authToken}`;
  },
  async parser({ content, date, channel }) {
    let programs = [];
    let data;

    try {
      if (!content || content.trim().length === 0) {
        throw new Error('Empty response content');
      }
      data = JSON.parse(content);
      if (!data || !Array.isArray(data)) {
        return programs;
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return programs; // Return empty programs array if parsing fails
    }

    programs = data.map(item => ({
      title: item.scheduleItemName,
      description: item.scheduleItemSynopsis || 'No description available',
      start: dayjs(item.startDate).utc().format(),
      stop: dayjs(item.startDate).add(dayjs.duration(item.broadcastItemDuration)).utc().format()
    }));

    return programs;
  },
  async channels() {
    const authToken = await this.getAuthToken();
    let data;

    try {
      const response = await axios.get(`https://www.yes.co.il/o/yes/servletlinearsched/getchannels?p_auth=${authToken}`);
      data = response.data;

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map(item => ({
        lang: 'he',
        site_id: item.channelID,
        name: item.channelName,
        p_auth: authToken
      }));
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  },
  async getAuthToken() {
    try {
      const url = 'https://www.yes.co.il/content/tvguide';
      const response = await axios.get(url);
      const textToSearch = ';Liferay.authToken=';
      const mainPageHtml = response.data;
      const idx = mainPageHtml.indexOf(textToSearch);
      if (idx === -1) {
        throw new Error('Auth token not found');
      }
      const val = mainPageHtml.substring(idx + textToSearch.length);
      const authToken = val.split(';')[0].trim();
      return authToken;
    } catch (error) {
      console.error('Error fetching auth token:', error);
      return null;
    }
  }
};
