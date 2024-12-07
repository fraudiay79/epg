const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const axios = require('axios');
const API_CHANNEL_ENDPOINT = 'https://go3.tv/api/products/sections/v2/live_tv?platform=BROWSER&lang=EE&tenant=OM_EE'

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'go3.tv',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    const formattedDate = date.format('YYYY-MM-DD');
    const since = `${formattedDate}T00:00-0500`;
    const till = `${formattedDate}T23:59-0500`;
    return `https://go3.tv/api/products/lives/programmes?liveId[]=${channel.site_id}&since=${since}&till=${till}&platform=BROWSER&lang=EN&tenant=OM_EE`;
  },
  parser: function ({ content }) {
    const programs = [];
    const data = JSON.parse(content);

    data.forEach(channel => {
      channel.programs.forEach(program => {
        const start = dayjs.utc(program.start_time).format('YYYY-MM-DDTHH:mm:ssZ');
        const stop = dayjs.utc(program.end_time).format('YYYY-MM-DDTHH:mm:ssZ');
        const programData = {
          title: program.description,
          description: program.full_description || program.description || 'No description available',
          start,
          stop
        };
        programs.push(programData);
      });
    });

    return programs;
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(API_CHANNEL_ENDPOINT)
      .then(r => r.data)
      .catch(console.log)
    return data.elements.item.map(i => {
      return {
        lang: 'ee',
	      name: i.title,
        site_id: i.id
      }
    })
  }
}
