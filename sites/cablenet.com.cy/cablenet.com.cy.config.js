const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'cablenet.com.cy',
  days: 6, // maxdays=6
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    },
    headers: {
      'Accept-Encoding': 'gzip, deflate, br'
    }
  },
  url({ date }) {
    const formattedDate = date.format('YYYY-MM-DD');
    return `https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg${formattedDate}.json`;
  },
  async parser({ content, channel }) {
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

    data.forEach(item => {
      if (item.id === channel.site_id) {
        item.pr.forEach(pr => {
          const show = {
            title: pr.ti || '',
            startTime: dayjs(pr.df).utc().format(),
            endTime: dayjs(pr.dt).utc().format(),
            description: pr.ld || 'No description available',
            rating: pr.ma || ''
          };
          shows.push(show);
        });
      }
    });

    return shows;
  },
  async channels() {
    const url = `https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg${dayjs().format('YYYY-MM-DD')}.json`;
    const response = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    const data = response.data;
    const channels = [];

    data.forEach(channel => {
      channels.push({
        lang: 'el',
        name: channel.ch || 'Channel Name Unknown',
        site_id: channel.id.toString()
      });
    });

    return channels;
  }
};
