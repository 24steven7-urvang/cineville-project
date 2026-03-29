import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Film, Clock, MapPin, Train, Ticket } from 'lucide-react';

const todayAmsterdam = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });

export default function CinevilleFinder() {
  const todayStr = todayAmsterdam();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [customDate, setCustomDate] = useState('');
  const [selectedTheaters, setSelectedTheaters] = useState({
    kino: true,
    cinerama: true,
    lantaren: true,
  });
  const [selectedDayParts, setSelectedDayParts] = useState({
    ochtend: true,
    middag: true,
    vooravond: true,
    avond: true,
  });
  const [travelMinutes, setTravelMinutes] = useState('');
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Haal films op bij datumwisseling
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFilms([]);

    fetch(`/.netlify/functions/schedule?date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error('Kon programmering niet laden.');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setFilms(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [selectedDate]);

  const theaterNames = { kino: 'Kino', cinerama: 'Cinerama', lantaren: 'LantarenVenster' };
  const dayPartNames = { ochtend: 'Ochtend', middag: 'Middag', vooravond: 'Vooravond', avond: 'Avond' };

  const theaterConfig = {
    kino: {
      activeBg: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
      dot: 'bg-amber-400',
      timeBg: 'bg-amber-500/10 border-amber-500/25',
      timeText: 'text-amber-300',
      theaterLabel: 'bg-amber-500/15 text-amber-300',
      rowHover: 'hover:bg-amber-500/5',
      leftBorder: 'border-l-amber-400',
    },
    cinerama: {
      activeBg: 'bg-sky-500/10 border-sky-500/40 text-sky-300',
      dot: 'bg-sky-400',
      timeBg: 'bg-sky-500/10 border-sky-500/25',
      timeText: 'text-sky-300',
      theaterLabel: 'bg-sky-500/15 text-sky-300',
      rowHover: 'hover:bg-sky-500/5',
      leftBorder: 'border-l-sky-400',
    },
    lantaren: {
      activeBg: 'bg-violet-500/10 border-violet-500/40 text-violet-300',
      dot: 'bg-violet-400',
      timeBg: 'bg-violet-500/10 border-violet-500/25',
      timeText: 'text-violet-300',
      theaterLabel: 'bg-violet-500/15 text-violet-300',
      rowHover: 'hover:bg-violet-500/5',
      leftBorder: 'border-l-violet-400',
    },
  };

  const getDayPartForTime = (timeStr) => {
    const [hours] = timeStr.split(':').map(Number);
    if (hours < 12) return 'ochtend';
    if (hours < 16) return 'middag';
    if (hours < 17) return 'vooravond';
    return 'avond';
  };

  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const filteredFilms = useMemo(() => {
    const isToday = selectedDate === todayStr;
    let cutoffMinutes = 0;

    if (isToday) {
      const now = new Date();
      const amsterdamTime = now.toLocaleTimeString('nl-NL', {
        timeZone: 'Europe/Amsterdam',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const [h, m] = amsterdamTime.split(':').map(Number);
      cutoffMinutes = h * 60 + m + (parseInt(travelMinutes) || 0);
    }

    return films
      .filter((film) => selectedTheaters[film.theater])
      .filter((film) => selectedDayParts[getDayPartForTime(film.time)])
      .filter((film) => !isToday || timeToMinutes(film.time) >= cutoffMinutes)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [films, selectedTheaters, selectedDayParts, travelMinutes, selectedDate]);

  const toggleTheater = (t) => setSelectedTheaters((p) => ({ ...p, [t]: !p[t] }));
  const toggleDayPart = (d) => setSelectedDayParts((p) => ({ ...p, [d]: !p[d] }));

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' }));
    }
    return days;
  };

  const getMinMaxDates = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return {
      minDate: today.toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' }),
      maxDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('sv-SE', {
        timeZone: 'Europe/Amsterdam',
      }),
    };
  };

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T12:00:00+01:00').toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const calcEndTime = (time, duration) => {
    if (!duration) return null;
    const [h, m] = time.split(':').map(Number);
    const end = h * 60 + m + duration;
    return `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="bg-cinematic min-h-screen text-white relative">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-lg bg-black/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-white">
                CINEVILLE<span className="text-red-500">.</span>NL
              </h1>
              <p className="text-xs text-white/35 mt-0.5 font-medium tracking-wide">
                Rotterdam · Kino · Cinerama · LantarenVenster
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Filter panel */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden divide-y divide-white/[0.06]">

          {/* Datum */}
          <div className="px-5 py-4">
            <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
              <Calendar className="w-3 h-3" /> Datum
            </label>
            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {getNextDays().map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setCustomDate(''); }}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap border ${
                      selectedDate === date && customDate === ''
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">of kies:</span>
                <input
                  type="date"
                  value={customDate || selectedDate}
                  onChange={(e) => { setCustomDate(e.target.value); setSelectedDate(e.target.value); }}
                  min={getMinMaxDates().minDate}
                  max={getMinMaxDates().maxDate}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white/80 border border-white/10 focus:border-red-500/50 focus:outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Reistijd */}
          <div className="px-5 py-4">
            <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
              <Train className="w-3 h-3" /> Reistijd
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="number"
                min="0"
                max="120"
                placeholder="0"
                value={travelMinutes}
                onChange={(e) => setTravelMinutes(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-lg bg-white/5 text-white/80 border border-white/10 focus:border-red-500/50 focus:outline-none text-sm font-medium text-center"
              />
              <span className="text-sm text-white/35">minuten</span>
              {isToday && travelMinutes && parseInt(travelMinutes) > 0 && (
                <span className="text-xs text-white/35 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  Films vanaf{' '}
                  <span className="font-bold text-white/65">
                    {(() => {
                      const now = new Date();
                      const cutoff = new Date(now.getTime() + parseInt(travelMinutes) * 60000);
                      return cutoff.toLocaleTimeString('nl-NL', {
                        timeZone: 'Europe/Amsterdam',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    })()}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Bioscoop */}
          <div className="px-5 py-4">
            <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
              <MapPin className="w-3 h-3" /> Bioscoop
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['kino', 'cinerama', 'lantaren'].map((theater) => (
                <button
                  key={theater}
                  onClick={() => toggleTheater(theater)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all border ${
                    selectedTheaters[theater]
                      ? theaterConfig[theater].activeBg
                      : 'bg-white/[0.03] text-white/20 border-white/8'
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${selectedTheaters[theater] ? theaterConfig[theater].dot : 'bg-white/20'}`} />
                  {theaterNames[theater]}
                </button>
              ))}
            </div>
          </div>

          {/* Dagdeel */}
          <div className="px-5 py-4">
            <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
              <Clock className="w-3 h-3" /> Dagdeel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['ochtend', 'middag', 'vooravond', 'avond'].map((dayPart) => (
                <button
                  key={dayPart}
                  onClick={() => toggleDayPart(dayPart)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border text-left ${
                    selectedDayParts[dayPart]
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-white/[0.03] border-white/8 text-white/20'
                  }`}
                >
                  <div className="font-bold">{dayPartNames[dayPart]}</div>
                  <div className="opacity-55 font-normal mt-0.5 text-[10px]">
                    {dayPart === 'ochtend' && 'tot 12:00'}
                    {dayPart === 'middag' && '12:00–16:00'}
                    {dayPart === 'vooravond' && '16:00–17:00'}
                    {dayPart === 'avond' && 'na 17:00'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultaten */}
        <section>
          {!loading && filteredFilms.length > 0 && (
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2 px-1">
              {filteredFilms.length} voorstelling{filteredFilms.length !== 1 ? 'en' : ''}
            </p>
          )}

          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-sm font-medium">Programmering laden…</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <p className="text-red-400 font-medium text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filteredFilms.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <Film className="w-10 h-10 text-white/12 mx-auto mb-4" />
              <p className="text-white/40 font-semibold text-sm">Geen films gevonden</p>
              <p className="text-white/20 text-xs mt-1.5">
                {isToday
                  ? 'Alle films voor vandaag zijn al begonnen, of komen pas later.'
                  : 'Geen programmering gevonden voor deze datum.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredFilms.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
              {filteredFilms.map((film) => {
                const cfg = theaterConfig[film.theater];
                const endTime = calcEndTime(film.time, film.duration);
                const Row = film.ticketingUrl ? 'a' : 'div';
                const rowProps = film.ticketingUrl
                  ? { href: film.ticketingUrl, target: '_blank', rel: 'noopener noreferrer' }
                  : {};

                return (
                  <Row
                    key={film.id}
                    {...rowProps}
                    className={`flex items-center gap-4 px-5 py-4 border-l-[3px] ${cfg.leftBorder} ${cfg.rowHover} transition-colors group`}
                  >
                    {/* Tijd */}
                    <div className={`flex-shrink-0 w-[60px] text-center py-1.5 rounded-lg border ${cfg.timeBg}`}>
                      <span className={`text-sm font-black tabular-nums leading-none ${cfg.timeText}`}>
                        {film.time}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white/90 font-semibold text-sm leading-snug truncate">
                        {film.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${cfg.theaterLabel}`}>
                          {theaterNames[film.theater]}
                        </span>
                        {film.language && (
                          <span className="text-[11px] text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-md">
                            {film.language}
                          </span>
                        )}
                        {film.duration && (
                          <span className="text-[11px] text-white/25 bg-white/[0.06] px-2 py-0.5 rounded-md">
                            {film.duration} min
                          </span>
                        )}
                        {endTime && (
                          <span className="text-[11px] text-white/20 bg-white/[0.06] px-2 py-0.5 rounded-md">
                            klaar om {endTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ticket icoon */}
                    {film.ticketingUrl && (
                      <Ticket className="w-4 h-4 text-white/15 flex-shrink-0 group-hover:text-white/40 transition-colors" />
                    )}
                  </Row>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-2 pb-6 text-center">
          <p className="text-[11px] text-white/20 font-medium">
            Reserveer met je Cineville-pas · klik op een film voor kaartjes
          </p>
        </footer>
      </main>
    </div>
  );
}
