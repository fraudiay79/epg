const cheerio = require('cheerio')
const { DateTime } = require('luxon')

const channel = [{ site_id: '1208', xmltv_id: 'AlAoula.ma', lang: 'ar' },
                 { site_id: '4069', xmltv_id: 'Laayoune.ma', lang: 'ar' },
                 { site_id: '4070', xmltv_id: 'Arryadia.ma', lang: 'ar' },
                 { site_id: '4071', xmltv_id: 'Athaqafia.ma', lang: 'ar' },
                 { site_id: '4072', xmltv_id: 'AlMaghribia.ma', lang: 'ar' },
                 { site_id: '4073', xmltv_id: 'Assadissa.ma', lang: 'ar' },
                 { site_id: '4075', xmltv_id: 'Tamazight.ma', lang: 'ar' }]


module.exports = {
  site: 'snrt.ma',
  channels: 'snrt.ma.channels.xml',
  days: 2,
  url: function ({ channel }) {
    return `https://www.snrt.ma/ar/node/${channel.site_id}`
  },
  parser: function ({ content, date }) {
    const programs = []
    const items = parseItems(content)
    items.forEach(item => {
      const prev = programs[programs.length - 1]
      const $item = cheerio.load(item)
      let start = parseStart($item, date)
      if (prev) {
        if (start.isBefore(prev.start)) {
          start = start.add(1, 'd')
          date = date.add(1, 'd')
        }
        prev.stop = start
      }
      const stop = start.add(30, 'm')
      programs.push({
        title: parseTitle($item),
        start,
        stop
      })
    })

    return programs
  }
}

function parseStart($item, date) {
  const timeString = $item('div > div:nth-child(1),a > div:nth-child(1)').text().trim()
  const [, HH, mm] = timeString.match(/^(\d{2}):(\d{2})/) || [null, null, null]
  if (!HH || !mm) return null
  const dateString = `${date.format('MM/DD/YYYY')} ${timeString}`

  return DateTime.fromFormat(dateString, 'MM/dd/yyyy HH.mm', { zone: 'Africa/Casablanca' }).toUTC()
}


function parseTitle($item) {
  return $item('.program-title-sm').text().trim()
}

function parseItems(content) {
  const $ = cheerio.load(content)

  return $('.grille-line').toArray()
}
