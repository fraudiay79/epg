const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

module.exports = {
  site: 'ptv.com.pk',
  channels: 'ptv.com.pk.channels.xml',
  days: 2,
  url: function ({ date, channel }) {
    const daysOfWeek = {
      0: 'Monday',
      1: 'Tuesday',
      2: 'Wednesday',
      3: 'Thursday',
      4: 'Friday',
      5: 'Saturday',
      6: 'Sunday'
    }
    const day = date.day()
    return `http://ptv.com.pk/getShowTvGuide?channel=${channel.site_id}&nameofday=${daysOfWeek[day]}`
  },
  parser: function ({ content, date }) {
    let programs = [];

    try {
      const items = JSON.parse(content);
      items.forEach(item => {
        const programTime = parseProgramTime(item.programTime);
        programs.push({
          title: item.programName,
          programTime: item.programTime,
          start: programTime,
          description: item.descr || 'No description available'
        });
      });
    } catch (error) {
      console.error("Error parsing content:", error);
    }

    return programs;
  }
};

function parseProgramTime(timeStr) {
  // Split the time string into components
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split('.').map(Number);

  // Convert 12-hour time to 24-hour time
  if (period.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  }
  if (period.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }

  // Format the time in HH:mm:ss format
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  return formattedTime;
}
