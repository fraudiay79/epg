const cheerio = require('cheerio')
const { DateTime } = require('luxon')

const channel = [{ site_id: '4069', xmltv_id: 'Laayoune.ma', lang: 'fr' },
                { site_id: '4070', xmltv_id: 'Arryadia.ma', lang: 'fr' },
                { site_id: '4071', xmltv_id: 'Athaqafia.ma', lang: 'fr' },
                { site_id: '4072', xmltv_id: 'AlMaghribia.ma', lang: 'fr' },
                { site_id: '4073', xmltv_id: 'Assadissa.ma', lang: 'fr' },
                { site_id: '4075', xmltv_id: 'Tamazight.ma', lang: 'fr' }]


module.exports = {
  site: 'snrt.ma',
  channels: 'snrt.ma.channels.xml',
  days: 2,
  url: function ({ channel }) {
    return `https://www.snrt.ma/fr/node/${channel.site_id}`
  },
  parser: function ({ buffer, date }) {
    const programs = []
    const items = parseItems(buffer)
    items.forEach(item => {
      const prev = programs[programs.length - 1]
      const $item = cheerio.load(item)
      let start = parseStart($item, date)
      if (prev) {
        if (start < prev.start) {
          start = start.plus({ days: 1 })
          date = date.add(1, 'd')
        }
        prev.stop = start
      }
      const stop = start.plus({ hours: 1 })
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
  const timeString = $item('.grille-time').text().trim()
  const dateString = `${date.format('MM/DD/YYYY')} ${timeString}`

  return DateTime.fromFormat(dateString, 'MM/dd/yyyy HH.mm', { zone: 'Africa/Casablanca' }).toUTC()
}


function parseTitle($item) {
  return $item('.program-title-sm').text().trim()
}
