const { DateTime } = require('luxon');
const axios = require('axios');

const API_PROGRAM_ENDPOINT = 'https://comunicacion.movistarplus.es';
const API_IMAGE_ENDPOINT = 'https://www.movistarplus.es/recorte/n/caratulaH/'; // Define the image endpoint

module.exports = {
  site: 'movistarplus.es',
  days: 2,
  url: function ({ channel, date }) {
    const luxonDate = DateTime.fromJSDate(new Date(date)); // Ensure `date` is converted
    return `${API_PROGRAM_ENDPOINT}/wp-admin/admin-ajax.php`;
  },
  request: {
    method: 'POST', // Try GET if POST fails
    headers: {
      Origin: API_PROGRAM_ENDPOINT,
      Referer: `${API_PROGRAM_ENDPOINT}/programacion/`,
      "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: function ({ channel, date }) {
      const luxonDate = DateTime.fromJSDate(new Date(date)); // Ensure `date` is converted
      return {
        action: 'getProgramation',
        day: luxonDate.toFormat('yyyy-MM-dd'),
        "channels[]": channel.site_id
      };
    }
  },
  async fetchData({ channel, date }) {
    const luxonDate = DateTime.fromJSDate(new Date(date)); // Ensure `date` is converted
    const payload = {
      action: 'getProgramation',
      day: luxonDate.toFormat('yyyy-MM-dd'),
      "channels[]": channel.site_id
    };

    try {
      console.log('Request Payload:', payload);

      const response = await axios({
        method: this.request.method,
        url: this.url({ channel, date }),
        headers: this.request.headers,
        data: new URLSearchParams(payload).toString() // For POST
      });

      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      return this.parser({ content: response.data, channel, date });
    } catch (error) {
      console.error('Error Status:', error.response?.status);
      console.error('Error Data:', error.response?.data);

      // If 405, retry with GET method
      if (error.response?.status === 405 && this.request.method === 'POST') {
        console.log('Retrying with GET...');
        return this.retryWithGet({ channel, date });
      }

      return null; // Handle the error gracefully
    }
  },
  async retryWithGet({ channel, date }) {
    const luxonDate = DateTime.fromJSDate(new Date(date));
    const query = new URLSearchParams({
      action: 'getProgramation',
      day: luxonDate.toFormat('yyyy-MM-dd'),
      "channels[]": channel.site_id
    }).toString();

    const url = `${this.url({ channel, date })}?${query}`;
    try {
      const response = await axios.get(url, { headers: this.request.headers });
      console.log('GET Response Status:', response.status);
      console.log('GET Response Data:', response.data);
      return this.parser({ content: response.data, channel, date });
    } catch (error) {
      console.error('GET Error Status:', error.response?.status);
      console.error('GET Error Data:', error.response?.data);
      return null;
    }
  },
  parser({ content, channel, date }) {
    const json = typeof content === 'string' ? JSON.parse(content) : content;

    // Ensure proper parsing of the data
    if (!json || !json.channelsProgram || json.channelsProgram.length === 0) {
      console.error('No programs found in the response.');
      return [];
    }

    const programs = json.channelsProgram[0]; // Assuming first array contains program data

    // Map over the programs and parse relevant data
    return programs.map((item) => {
      const startTime = DateTime.fromFormat(
        `${date} ${item.f_evento_rejilla}`,
        'yyyy-MM-dd HH:mm:ss',
        { zone: 'Europe/Madrid' }
      ).toUTC();

      const stopTime = DateTime.fromFormat(
        `${date} ${item.f_fin_evento_rejilla}`,
        'yyyy-MM-dd HH:mm:ss',
        { zone: 'Europe/Madrid' }
      ).toUTC();

      return {
        title: item.des_evento_rejilla,
        icon: this.parseIcon(item), // Use the `parseIcon` function
        category: item.des_genero,
        start: startTime,
        stop: stopTime
      };
    });
  },
  parseIcon(item) {
    // Construct the icon URL
    return `${API_IMAGE_ENDPOINT}${item.cod_evento_rejilla}.jpg`; // Ensure it's referencing the correct image
  }
};
