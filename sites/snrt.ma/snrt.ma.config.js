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
  url: function ({ channel, date }) {
    return `https://www.snrt.ma/ar/node/${channel.site_id}#${date.format(
      'YYYYMMDD'
    )}`
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
        description: parseDescription($item),
        category: parseCategory($item),
        start,
        stop
      })
    })

    return programs
  }
}

function parseStart($item, date) {
  const time = $item('.grille-time').text().trim()

  return dayjs.utc(`${date.format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD HH:mm')
}


function parseTitle($item) {
  return $item('.program-title-sm').text().trim()
}

function parseDescription($item) {
  return $item('.program-description-sm').text().trim()
}

function parseCategory($item) {
  return $item('.genre-first').text().trim()
}

function parseItems(content) {
  const $ = cheerio.load(content)

  return $('.grille-line').toArray()
}
