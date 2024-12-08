const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'api.itv.uz',
  days: 7, // maxdays=7
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    },
    headers: {
      'Accept-Encoding': 'gzip, deflate, br'
    }
  },
  url({ channel, date }) {
    const timestamp = date.unix();
    return `https://api.itv.uz/v2/cards/pieces/tv-guide/day-items?channelId=${channel.site_id}&timeDifference=-0&timestamp=${timestamp}`;
  },
  async parser({ content }) {
    const shows = [];
    let data;

    try {
      if (content.trim().length === 0) {
        throw new Error('Empty response content');
      }
      data = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return shows; // Return empty shows array if parsing fails
    }

    if (data.data) {
      data.data.forEach(item => {
        const show = {
          title: item.programTitle || '',
          startTime: dayjs.unix(item.startAt).utc().format(),
          endTime: dayjs.unix(item.endAt).utc().format(),
          description: item.programDescription || 'No description available'
        };
        shows.push(show);
      });
    }

    return shows;
  },
  async channels() {
    const url = 'https://api.itv.uz/v2/cards/channels/list?categoryId=1&itemsPerPage=0&moduleId=1';
    const response = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    const data = response.data;
    const channels = [];

    if (data.channels) {
      data.channels.forEach(channel => {
        channels.push({
          lang: 'ru',
          name: channel.channelTitle.replace(/'/g, '`'),
          site_id: channel.channelId.toString()
        });
      });
    }

    return channels;
  }
};
