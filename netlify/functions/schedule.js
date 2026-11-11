// Cineville venue IDs per city, mapped to the theater keys the app uses
const CITIES = {
  rotterdam: {
    '57922ba0-1dba-49bc-b893-2be7b8d9ef4d': 'kino',
    '0d726ad9-55da-415b-8c92-e15902a29b08': 'lantaren',
    '90c6c215-c9b0-4461-987e-edbc096e219a': 'cinerama',
  },
  utrecht: {
    'fd5a6386-c176-4839-8641-07fac03ca2e2': 'hartlooper',
    'c15751d4-4d4b-4cc8-a158-70f2c8fe4cb7': 'springhaver',
    'ddb268bf-0634-4f5d-b396-e7a5549d2451': 'slachtstraat',
    '310f9378-52b5-4aaf-b7b6-4b4b1f6fb1bb': 'sien',
  },
};

exports.handler = async function (event) {
  const city = event.queryStringParameters?.city || 'rotterdam';
  const THEATER_MAP = CITIES[city];
  if (!THEATER_MAP) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Onbekende stad: ${city}` }),
    };
  }
  const VENUE_IDS = Object.keys(THEATER_MAP);

  // Default to today in Amsterdam timezone
  const date =
    event.queryStringParameters?.date ||
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });

  // Broad UTC window covering the full Amsterdam day (UTC+1 winter / UTC+2 summer)
  const dayStartUTC = new Date(date + 'T00:00:00Z');
  const queryStart = new Date(dayStartUTC.getTime() - 2 * 3600 * 1000).toISOString();
  const queryEnd = new Date(dayStartUTC.getTime() + 26 * 3600 * 1000).toISOString();

  // Cineville's old /api/graphql endpoint is gone. The website itself reads
  // from the CultureKit REST API, so we use that too.
  const API = 'https://api.cineville.nl';
  const PAGE_LIMIT = 100;

  // The API returns at most 100 events and offers no next-page link, so we
  // query per venue and, when a page is full, continue from the last start time.
  const fetchVenue = async (venueId) => {
    const events = new Map();
    let from = queryStart;
    for (let page = 0; page < 10; page++) {
      const params = new URLSearchParams();
      params.append('venueId[in][]', venueId);
      params.set('startDate[gte]', from);
      params.set('startDate[lt]', queryEnd);
      params.set('page[limit]', String(PAGE_LIMIT));
      params.set('sort[startDate]', 'asc');
      params.set('embed[production]', 'true');
      params.set('embed[venue]', 'true');

      const res = await fetch(`${API}/events?${params}`);
      if (!res.ok) throw Object.assign(new Error('Cineville API fout.'), { status: res.status });
      const json = await res.json();
      const batch = json._embedded?.events || [];
      batch.forEach((ev) => events.set(ev.id, ev));

      const last = batch[batch.length - 1]?.startDate;
      if (batch.length < PAGE_LIMIT || !last || last === from) break;
      from = last;
    }
    return [...events.values()];
  };

  let showtimes;
  try {
    showtimes = (await Promise.all(VENUE_IDS.map(fetchVenue))).flat();
  } catch (err) {
    if (err.status) {
      return {
        statusCode: err.status,
        body: JSON.stringify({ error: 'Cineville API fout.' }),
      };
    }
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Kon Cineville niet bereiken.' }),
    };
  }

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
      const theater = THEATER_MAP[show.venueId || show._embedded?.venue?.id];

      const subs = show.attributes?.subtitles;
      const langParts = [show.attributes?.languageVersion, Array.isArray(subs) ? subs.join(', ') : subs].filter(Boolean);
      const language = langParts.length > 0 ? langParts.join(' · ') : null;

      return {
        id: show.id,
        title: show._embedded?.production?.title || show.productionHint?.title || '–',
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
