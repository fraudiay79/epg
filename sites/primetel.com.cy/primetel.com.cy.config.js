const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const axios = require('axios');

dayjs.extend(utc);

const paths = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5'
};

module.exports = {
  site: 'primetel.com.cy',
  days: 5,
  url: function ({ paths }) { // Updated to use channel instead of paths
    return `https://primetel.com.cy/tv_guide_json/tv${paths}.json`; // Corrected URL parameter
  },
  request: {
    headers: {
      "X-Csrf-Token": "ndDHaV4QqdbXfnrhBKo5DSROYBSIAkFVEkcRrXDw",
      "X-Requested-With": "XMLHttpRequest",
      "referer": "https://primetel.com.cy/tv-guide-program",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0",
      "Accept": "application/json, text/javascript, */*; q=0.01"
    },
    timeout: 60000,
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  parser: function ({ content }) {
    const data = JSON.parse(content);
    if (!data || !Array.isArray(data.pr)) return [];
    return data.pr.map(item => ({
      title: item.title, // Corrected property access
      description: item.description,
      start: dayjs.utc(item.starting).toISOString(), // Formatted to ISO string
      stop: dayjs.utc(item.ending).toISOString() // Formatted to ISO string
    }));
  },
  async channels() {
    try {
      const response = await axios.get(`https://primetel.com.cy/tv_guide_json/tv1.json`);
      return response.data.map(item => {
        return {
          lang: 'el',
          name: item.ch,
          site_id: item.id
        };
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }
};
