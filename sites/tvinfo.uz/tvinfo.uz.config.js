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
  site: 'tvinfo.uz',
  days: 5, // maxdays=5
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
    return `https://tvinfo.uz/${channel.site_id}?date=${formattedDate}`;
  },
  async parser({ content }) {
    const shows = [];
    const $ = cheerio.load(content);
    const rows = $('div.flex.text-sm');

    rows.each((index, row) => {
      const show = {
        title: $(row).find('div').eq(1).text().trim(),
        startTime: dayjs($(row).find('div.w-12.shrink-0').text().trim(), 'HH:mm').utc().format(),
        description: ''
      };
      shows.push(show);
    });

    return shows;
  },
  async channels() {
    const url = 'https://tvinfo.uz/';
    const response = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    const $ = cheerio.load(response.data);
    const channels = [];

    $('h3.grow.leading-tight').each((index, element) => {
      const siteId = $(element).find('a').attr('href').match(/https:\/\/tvinfo\.uz\/(.*)/)[1];
      const name = $(element).text().trim();

      channels.push({
        lang: 'uz',
        name: name,
        site_id: siteId
      });
    });

    return channels;
  }
};
