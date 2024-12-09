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
    return `https://api.tv.siminn.is/oreo-api/v2/channels/${channel.site_id}/events?start=${formattedDate}T00:00&end=${formattedDate}T23:59`;
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

    data.forEach(item => {
      const show = {
        title: item.title || '',
        description: item.description || 'No description available',
        episode: '',
        season: '',
        subtitle: '',
        icon: '',
        originalTitle: item.originalTitle || '',        
        start: dayjs(item.start).utc().format(),
        stop: dayjs(item.end).utc().format()
      };

      if (item.episode) {
        show.subtitle = item.episode.title || '';
        show.episode = item.episode.episodeNumber ? `E${item.episode.episodeNumber}` : '';
        if (item.episode.seasonNumber) {
          show.episode = `S${item.episode.seasonNumber}${show.episode}`;
        }
        if (item.episode.episodeCount) {
          show.episode = `${show.episode}/${item.episode.episodeCount}`;
        }
      }

      if (item.images && item.images.length > 0) {
        show.icon = `https://api.tv.siminn.is${item.images[0].url}`;
      }

      shows.push(show);
    });

    return shows;
  },
  async channels() {
    const url = 'https://www.siminn.is/dagskra';
    const response = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    const $ = cheerio.load(response.data);
    const channels = [];

    $('div[data-name="dagsskraitemimg"]').each((index, element) => {
      const siteId = $(element).find('img').attr('src').match(/\/([^\/]+)\.png/)[1];
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
