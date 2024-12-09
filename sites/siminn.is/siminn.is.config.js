const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const cheerio = require('cheerio');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'siminn.is',
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
    const formattedDate = date.format('YYYY-MM-DD');
    return `https://siminn-proxy.siminn.is/api/getChannels?channelId=${channel.site_id}&time=${formattedDate}`;
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

    if (data && data.epg) {
      data.epg.forEach(item => {
        const show = {
          title: item.title || '',
          description: item.description || 'No description available',
          start: dayjs(item.start).utc().format(),
          stop: dayjs(item.end).utc().format()
        };
        shows.push(show);
      });
    }

    return shows;
  },
  async channels() {
    const url = 'https://www.siminn.is/sjonvarp';
    const response = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    const $ = cheerio.load(response.data);
    const channels = [];

    $('.channelinfo').each((index, element) => {
      const siteId = $(element).find('.channelID').text().trim();
      const name = $(element).find('.channelName').text().trim();

      channels.push({
        lang: 'is',
        name: name,
        site_id: siteId
      });
    });

    return channels;
  }
};
