const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'novatv.is',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    return `https://exposure.api.redbee.live/v2/customer/Nova/businessunit/novatvprod/epg/${channel.site_id}/date/${date.format('YYYY-MM-DD')}`;
  },
  parser({ content }) {
    let programs = [];

    try {
      const items = parseItems(content);
      items.forEach(item => {
        programs.push({
          title: item.asset.localized.title,
          description: item.asset.localized.description,
          start: dayjs.utc(item.asset.startTime).toISOString(),
          stop: dayjs.utc(item.asset.endTime).toISOString()
        });
      });
    } catch (error) {
      console.error("Error parsing content:", error);
    }

    return programs;
  },
  async channels() {
    const axios = require('axios');
    try {
      const response = await axios.get(`https://exposure.api.redbee.live/v1/customer/Nova/businessunit/novatvprod/content/asset?assetType=TV_CHANNEL`);
      return response.data.items.map(item => {
        return {
          lang: 'is',
          name: item.localized.title,
          site_id: item.assetId
        };
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }
};

function parseItems(content) {
  const data = JSON.parse(content);
  if (!data || !Array.isArray(data.programs)) return [];
  return data.programs;
}
