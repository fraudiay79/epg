process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

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
        let start = parseProgramTime(item.programTime)
        if (prev) {
        if (start.isBefore(prev.start)) {
          start = start.add(1, 'd')
          date = date.add(1, 'd')
        }
        prev.stop = start
        }
        const stop = start.add(60, 'm')
        programs.push({
          title: toProperCase(item.programName),
          description: item.descr || 'No description available',
          start,
          stop
        });
      });
    } catch (error) {
      console.error("Error parsing content:", error);
    }

    return programs;
  }
};

function toProperCase(str) {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

function parseProgramTime(timeStr) {
  // Handle different formats of time
  if (timeStr.includes('am') || timeStr.includes('pm') || timeStr.includes('AM') || timeStr.includes('PM')) {
    return dayjs(timeStr, 'hh.mm a').format('HH:mm:ss');
  } else if (timeStr.includes(':')) {
    return dayjs(timeStr, 'h:mm A').format('HH:mm:ss');
  } else if (timeStr.length === 4) {
    return dayjs(timeStr, 'HHmm').format('HH:mm:ss');
  } else if (timeStr.includes('PST') || timeStr.includes('UK') || timeStr.includes('USA')) {
    const times = timeStr.split(',').map(t => t.trim());
    return times.map(t => dayjs(t, 'HHmmZZ').format('HH:mm:ss')).join(', ');
  } else {
    return 'Invalid time format';
  }
}
