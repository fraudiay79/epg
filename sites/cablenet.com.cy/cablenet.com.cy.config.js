const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

module.exports = {
  site: 'cablenet.com.cy',
  days: 6,
  request: {
    cache: {
      ttl: 60 * 60 * 1000, // 1 hour
    },
  },
  url({ date }) {
    return `https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg${date.format('YYYY-MM-DD')}.json`;
  },
  parser({ content, date }) {
    let programs = [];
    try {
      const data = JSON.parse(content); // Handle potential parsing errors
      const items = data.pr;
      items.forEach(item => {
        if (!item) return;
        const start = dayjs.utc(item.pr.df);
        const stop = dayjs.utc(item.pr.dt);
        programs.push({
          title: item.pr.ti,
          description: item.pr.sd,
          start,
          stop,
        });
      });
    } catch (error) {
      console.error("Error parsing EPG data:", error);
      // You can also throw the error to be handled elsewhere
      // throw error;
    }
    return programs;
  },
  async channels({ date }) {
    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://cablenet.com.cy/wp-content/plugins/tv-guide-plugin/data/epg${date.format(
          'YYYY-MM-DD'
        )}.json`
      );
      const data = response.data;
      return data.channels.map(item => ({
        lang: 'el',
        name: item.ch,
        site_id: item.id,
      }));
    } catch (error) {
      console.error("Error fetching channel data:", error);
      // You can also throw the error to be handled elsewhere
      // throw error;
    }
  },
};

// Consider renaming this function for clarity based on its actual purpose
function extractPrograms(content) {
  const data = JSON.parse(content);
  return data.pr;
}
