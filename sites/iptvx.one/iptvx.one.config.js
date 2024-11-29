const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'iptvx.one',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel }) {
    return `https://epg.drm-play.com/iptvx.one%2Fepg%2F${channel.site_id}.json`;
  },
  parser({ content }) {
    let programs = [];

    try {
      const items = parseItems(content);
      items.forEach(item => {
        programs.push({
          title: item.epg_data.name,
          description: item.epg_data.descr,
          start: dayjs.unix(item.epg_data.time),
          stop: dayjs.unix(item.epg_data.time_to)
        });
      });
    } catch (error) {
      console.error("Error parsing content:", error);
    }

    return programs;
  },
  async channels() {
    const axios = require('axios')
    try {
      const data = await axios.get(`https://epg.iptvx.one/api/channels.json`)
      return data.channels.map(item => {
        return {
          lang: 'ru',
          name: item.chan_names,
          site_id: item.chan_id
        }
      })
    } catch (error) {
      console.error('Error fetching channels:', error)
      // Consider returning a default value or throwing an error
    }
  }
}

function parseItems(content) {
  const data = JSON.parse(content);
  if (!data || !Array.isArray(data.epg_data)) return [];
  return data.epg_data;
}
