const VENUE_IDS = [
  '57922ba0-1dba-49bc-b893-2be7b8d9ef4d', // KINO
  '0d726ad9-55da-415b-8c92-e15902a29b08', // LantarenVenster
  '90c6c215-c9b0-4461-987e-edbc096e219a', // Cinerama
];

const THEATER_MAP = {
  'KINO': 'kino',
  'Cinerama': 'cinerama',
  'LantarenVenster': 'lantaren',
};

exports.handler = async function (event) {
  // Default to today in Amsterdam timezone
  const date =
    event.queryStringParameters?.date ||
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });

  // Broad UTC window covering the full Amsterdam day (UTC+1 winter / UTC+2 summer)
  const dayStartUTC = new Date(date + 'T00:00:00Z');
  const queryStart = new Date(dayStartUTC.getTime() - 2 * 3600 * 1000).toISOString();
  const queryEnd = new Date(dayStartUTC.getTime() + 26 * 3600 * 1000).toISOString();

  const query = `{
    showtimes(
      filters: {
        venueId: { in: ${JSON.stringify(VENUE_IDS)} }
        startDate: { gte: "${queryStart}", lt: "${queryEnd}" }
      }
      page: { limit: 200 }
      locale: "nl-NL"
    ) {
      data {
        id
        startDate
        endDate
        ticketingUrl
        languageVersion
        subtitles
        film { title }
        theater { name }
      }
    }
  }`;

  let res;
  try {
    res = await fetch('https://cineville.nl/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Kon Cineville niet bereiken.' }),
    };
  }

  if (!res.ok) {
    return {
      statusCode: res.status,
      body: JSON.stringify({ error: 'Cineville API fout.' }),
    };
  }

  const json = await res.json();
  const showtimes = json.data?.showtimes?.data || [];

  const normalized = showtimes
    .map((show) => {
      const start = new Date(show.startDate);
      const end = show.endDate ? new Date(show.endDate) : null;

      const time = start.toLocaleTimeString('nl-NL', {
        timeZone: 'Europe/Amsterdam',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const dateAmsterdam = start.toLocaleDateString('sv-SE', {
        timeZone: 'Europe/Amsterdam',
      });

      const duration = end ? Math.round((end - start) / 60000) : null;
      const theater = THEATER_MAP[show.theater?.name];

      const langParts = [show.languageVersion, show.subtitles].filter(Boolean);
      const language = langParts.length > 0 ? langParts.join(' · ') : null;

      return {
        id: show.id,
        title: show.film?.title || '–',
        time,
        theater,
        duration,
        language,
        ticketingUrl: show.ticketingUrl || null,
        date: dateAmsterdam,
      };
    })
    .filter((show) => show.date === date && show.theater);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(normalized),
  };
};
