const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'vivoplay.com.br',
  days: 3,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ date, channel }) {
    return `https://contentapi-br.cdn.telefonica.com/25/default/pt-BR/schedules?ca_deviceTypes=null%7C401&fields=Title,Description,Start,End,EpgSerieId,SeriesPid,SeasonPid,AgeRatingPid,ReleaseDate,images.videoFrame,images.banner&orderBy=START_TIME:a&filteravailability=false&starttime=${date.unix()}&endtime=${date.add(1, 'day').unix()}&livechannelpids=${channel.site_id}`
  },
 parser: function ({ content }) {
    let programs = []
    const items = parseItems(content)

    items.forEach(item => {
      programs.push({
        title: parseTitle(item),
        sub_title: parseSubTitle(item),
        start: parseStart(item),
        stop: parseStop(item),
        date: parseDate(item),
        description: item.Description,
        season: parseSeason(item),
        episode: parseEpisode(item),
        icon: parseIcon(item),
        directors: parsePersons(item.DirectorPids),
        actors: parsePersons(item.ActorPids),
        writers: parsePersons(item.WriterPids),
        producers: parsePersons(item.ProducerPids),
      })
    })
    return programs;
  },
  async channels() {
    const axios = require('axios')
    const data = await axios
      .get(`https://contentapi-br.cdn.telefonica.com/25/default/pt-BR/contents/all?contentTypes=LCH&ca_active=true&ca_requiresPin=false&fields=Pid,Name,images.icon&orderBy=contentOrder&limit=10000`)
      .then(r => r.data)
      .catch(console.log)
    return data.List.map(item => {
      return {
        lang: 'pt',
        name: item.Title,
        site_id: item.Pid
      }
    })
  }
}
  
function parseItems(content) {
  const data = JSON.parse(content)
  if (!data || !Array.isArray(data.Content)) return []

  return data.Content
}

function parseTitle(item) {
  return (item.Title.split(':')[1] != undefined) ? item.Title.split(':')[0] : item.Title
}

function parseSubTitle(item) {
  const parts = item.Title.split(':');
  if (parts.length > 1) {
    const secondPart = parts[1].trim();
    if (secondPart.includes('-')) {
      return secondPart.split('-')[1].trim();
    } else {
      return secondPart;
    }
  } else {
    return undefined;
  }
}

function parseStart(item) {
  return dayjs.unix(item.Start)
}

function parseStop(item) {
  return dayjs.unix(item.End)
}

function parseDate(item) {
  return dayjs.unix(item.ReleaseDate)
}

function parseSeason(item) {
  const match = item.Title.match(regex)
  return match ? match[1] : undefined
}

function parseEpisode(item) {
  const match = item.Title.match(regex)
  return match ? match[2] : undefined
}


function parsePersons(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map(Pid => {
    const findPerson = persons.find(person => person.Pid === Pid);
    if (findPerson) {
      return {
        value: findPerson.Title
      };
    }
  })
}


function parseIcon(item) {
  if (Array.isArray(item.Images.VideoFrame) && item.Images.VideoFrame.length) {
    return {
      src: `https://spotlight-br.cdn.telefonica.com/customer/v1/source?image=${encodeURIComponent(item.Images.VideoFrame[0].Url)}&width=455&height=256&resize=CROP&format=JPEG`
    }
  }

  return null
}
