import React, { useState, useMemo } from 'react';
import { Calendar, Film, Clock, MapPin, Train } from 'lucide-react';

export default function CinevilleFinder() {
  const todayStr = new Date().toISOString().split('T')[0];

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

  const filmDatabase = {
    '2026-03-29': [
      { id: 1, title: 'Parasite', time: '14:00', theater: 'kino', duration: 132, genre: 'Drama', language: 'Koreaans' },
      { id: 2, title: 'Moonlight', time: '16:30', theater: 'kino', duration: 111, genre: 'Drama', language: 'Engels' },
      { id: 3, title: 'The Farewell', time: '19:00', theater: 'kino', duration: 100, genre: 'Comedy-Drama', language: 'Engels' },
      { id: 4, title: 'Drive My Car', time: '21:15', theater: 'kino', duration: 179, genre: 'Drama', language: 'Japans' },
      { id: 5, title: 'Everything Everywhere All at Once', time: '13:30', theater: 'cinerama', duration: 139, genre: 'Sci-Fi', language: 'Engels' },
      { id: 6, title: 'Past Lives', time: '15:45', theater: 'cinerama', duration: 106, genre: 'Drama', language: 'Engels/Koreaans' },
      { id: 7, title: 'All Fours', time: '18:00', theater: 'cinerama', duration: 94, genre: 'Drama', language: 'Engels' },
      { id: 8, title: 'Anatomie of a Fall', time: '20:30', theater: 'cinerama', duration: 150, genre: 'Thriller', language: 'Frans' },
      { id: 9, title: 'In the Mood for Love', time: '14:30', theater: 'lantaren', duration: 98, genre: 'Drama', language: 'Kantonees' },
      { id: 10, title: 'Harakiri', time: '17:00', theater: 'lantaren', duration: 183, genre: 'Drama', language: 'Japans' },
      { id: 11, title: 'Stalker', time: '19:30', theater: 'lantaren', duration: 163, genre: 'Sci-Fi', language: 'Russisch' },
      { id: 12, title: 'The Red Shoes', time: '21:45', theater: 'lantaren', duration: 135, genre: 'Drama', language: 'Engels' },
    ],
    '2026-03-30': [
      { id: 13, title: 'Perfect Days', time: '13:00', theater: 'kino', duration: 124, genre: 'Drama', language: 'Japans' },
      { id: 14, title: 'The Wandering Soap Opera', time: '15:30', theater: 'kino', duration: 90, genre: 'Comedy', language: 'Nederlands' },
      { id: 15, title: 'Green Knight', time: '18:15', theater: 'cinerama', duration: 150, genre: 'Fantasy', language: 'Engels' },
      { id: 16, title: 'Boiling Point', time: '20:00', theater: 'cinerama', duration: 92, genre: 'Drama', language: 'Engels' },
      { id: 17, title: 'The Cinema Continueth', time: '14:00', theater: 'lantaren', duration: 88, genre: 'Documentary', language: 'Engels' },
      { id: 18, title: 'Playtime', time: '20:00', theater: 'lantaren', duration: 124, genre: 'Comedy', language: 'Frans' },
    ],
    '2026-03-31': [
      { id: 19, title: 'Bicycle Thieves', time: '15:00', theater: 'kino', duration: 89, genre: 'Drama', language: 'Italiaans' },
      { id: 20, title: 'La Jetée', time: '19:00', theater: 'cinerama', duration: 29, genre: 'Sci-Fi', language: 'Frans' },
      { id: 21, title: 'Yi Yi', time: '17:30', theater: 'lantaren', duration: 173, genre: 'Drama', language: 'Chinees' },
    ],
    '2026-04-01': [
      { id: 22, title: 'Amélie', time: '14:15', theater: 'kino', duration: 122, genre: 'Comedy-Drama', language: 'Frans' },
      { id: 23, title: 'Mulholland Drive', time: '19:00', theater: 'cinerama', duration: 147, genre: 'Thriller', language: 'Engels' },
      { id: 24, title: 'Chungking Express', time: '16:45', theater: 'lantaren', duration: 102, genre: 'Drama', language: 'Kantonees' },
    ],
    '2026-04-02': [
      { id: 25, title: 'Spirited Away', time: '14:30', theater: 'kino', duration: 125, genre: 'Fantasy', language: 'Japans' },
      { id: 26, title: 'Boyhood', time: '15:00', theater: 'cinerama', duration: 165, genre: 'Drama', language: 'Engels' },
      { id: 27, title: 'The Third Man', time: '20:00', theater: 'lantaren', duration: 90, genre: 'Thriller', language: 'Engels' },
    ],
  };

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
    const films = filmDatabase[selectedDate] || [];
    const isToday = selectedDate === todayStr;

    let cutoffMinutes = 0;
    if (isToday) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const travel = parseInt(travelMinutes) || 0;
      cutoffMinutes = nowMinutes + travel;
    }

    return films
      .filter((film) => selectedTheaters[film.theater])
      .filter((film) => selectedDayParts[getDayPartForTime(film.time)])
      .filter((film) => !isToday || timeToMinutes(film.time) >= cutoffMinutes)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, selectedTheaters, selectedDayParts, travelMinutes]);

  const toggleTheater = (theater) => {
    setSelectedTheaters((prev) => ({ ...prev, [theater]: !prev[theater] }));
  };

  const toggleDayPart = (dayPart) => {
    setSelectedDayParts((prev) => ({ ...prev, [dayPart]: !prev[dayPart] }));
  };

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getMinMaxDates = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return {
      minDate: today.toISOString().split('T')[0],
      maxDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    };
  };

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const isToday = selectedDate === todayStr;

  return (
    <div className="bg-cinematic min-h-screen text-white relative">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/8 backdrop-blur-lg bg-black/30">
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

        {/* Filter panel — alle instellingen gegroepeerd */}
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
                      return cutoff.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
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

        {/* Resultaten — tijd is leidend */}
        <section>
          {filteredFilms.length > 0 && (
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2 px-1">
              {filteredFilms.length} voorstelling{filteredFilms.length !== 1 ? 'en' : ''}
            </p>
          )}
          {filteredFilms.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <Film className="w-10 h-10 text-white/12 mx-auto mb-4" />
              <p className="text-white/40 font-semibold text-sm">Geen films gevonden</p>
              <p className="text-white/20 text-xs mt-1.5">
                {isToday
                  ? 'Alle films voor vandaag zijn al begonnen, of komen pas later.'
                  : 'Probeer een andere datum of bioscoop. Beschikbaar: 29–31 maart en 1–2 april'}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
              {filteredFilms.map((film) => {
                const cfg = theaterConfig[film.theater];
                return (
                  <div
                    key={film.id}
                    className={`flex items-center gap-4 px-5 py-4 border-l-[3px] ${cfg.leftBorder} ${cfg.rowHover} transition-colors`}
                  >
                    {/* Tijd */}
                    <div className={`flex-shrink-0 w-[60px] text-center py-1.5 rounded-lg border ${cfg.timeBg}`}>
                      <span className={`text-sm font-black tabular-nums leading-none ${cfg.timeText}`}>
                        {film.time}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white/90 font-semibold text-sm leading-snug truncate">{film.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${cfg.theaterLabel}`}>
                          {theaterNames[film.theater]}
                        </span>
                        <span className="text-[11px] text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-md">{film.genre}</span>
                        <span className="text-[11px] text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-md">{film.language}</span>
                        <span className="text-[11px] text-white/20 bg-white/[0.06] px-2 py-0.5 rounded-md">{film.duration} min</span>
                        <span className="text-[11px] text-white/20 bg-white/[0.06] px-2 py-0.5 rounded-md">
                          klaar om {(() => {
                            const [h, m] = film.time.split(':').map(Number);
                            const end = h * 60 + m + film.duration;
                            return `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-2 pb-6 text-center">
          <p className="text-[11px] text-white/20 font-medium">
            Reserveer met je Cineville-pas op de website van de bioscoop
          </p>
        </footer>
      </main>
    </div>
  );
}
