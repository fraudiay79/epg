const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

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

    return `https://ptv.com.pk/getShowTvGuide?channel=${channel.site_id}&nameofday=${daysOfWeek[day]}`
  },
  parser: function ({ content, date }) {
    const programs = []
    const data = parseContent(content)
    data.forEach(item => {
	let start = parseStart(item)
      if (prev) {
        if (start.isBefore(prev.start)) {
          start = start.add(1, 'd')
          date = date.add(1, 'd')
        }
        prev.stop = start
      }
      const stop = start.add(60, 'm')
    programs.push({
        title: item.programName,
        start,
        stop
      })
    })

    return programs
  },


function parseStart(item) {
  return dayjs(item.programTime).toJSON()
}
