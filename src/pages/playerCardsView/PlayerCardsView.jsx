import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';

const CATEGORIES = [
  { en: 'Defending', ru: 'Защита', key: 'defending' },
  { en: 'Attack', ru: 'Атака', key: 'attack' },
  { en: 'Dribbling', ru: 'Дриблинг', key: 'dribbling' },
  { en: 'Speed', ru: 'Скорость', key: 'speed' },
  { en: 'Passing', ru: 'Пас', key: 'passing' },
  { en: 'Physical', ru: 'Физика', key: 'physical' },
  { en: 'Finishing', ru: 'Завершение', key: 'finishing' },
  { en: 'Vision', ru: 'Видение поля', key: 'vision' },
  { en: 'Positioning', ru: 'Позиционирование', key: 'positioning' },
  { en: 'Ball Control', ru: 'Контроль мяча', key: 'ballcontrol' },
  { en: 'Technique', ru: 'Техника', key: 'technique' },
  { en: 'Stamina', ru: 'Выносливость', key: 'stamina' },
  { en: 'Aggression', ru: 'Агрессия', key: 'aggression' },
  { en: 'Leadership', ru: 'Лидерство', key: 'leadership' },
  { en: 'Teamwork', ru: 'Командная игра', key: 'teamwork' },
  { en: 'Composure', ru: 'Хладнокровие', key: 'composure' },
  { en: 'Work Rate', ru: 'Работоспособность', key: 'workrate' },
  { en: 'Long Shots', ru: 'Дальние удары', key: 'longshots' },
  { en: 'Headers', ru: 'Игра головой', key: 'headers' },
  { en: 'Free Kicks', ru: 'Штрафные удары', key: 'freekicks' },
  { en: 'Penalties', ru: 'Пенальти', key: 'penalties' },
  { en: 'GoalKeeping', ru: 'Навыки вратаря', key: 'goalkeeping' },
];

const PLAYERS = [
  { id: 1, name: 'Beksultan' },
  { id: 2, name: 'Islam' },
  { id: 3, name: 'Nurdan' },
  { id: 4, name: 'Nursultan' },
  { id: 5, name: 'Nurzhigit' },
];

export default function PlayerCardsView() {
  const [oldRatings, setOldRatings] = useState([]);
  const [newRatings, setNewRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllRatings();
  }, []);

  const fetchAllRatings = async () => {
    try {
      setLoading(true);
      // старая коллекция = 'team-rating', новая = 'teamRating2'
      const oldQ = query(collection(db, 'team-ratings'), orderBy('timestamp', 'desc'));
      const newQ = query(collection(db, 'teamRatings2'), orderBy('timestamp', 'desc'));

      const [oldSnap, newSnap] = await Promise.all([getDocs(oldQ), getDocs(newQ)]);

      const oldData = [];
      oldSnap.forEach((doc) => oldData.push({ id: doc.id, ...doc.data() }));

      const newData = [];
      newSnap.forEach((doc) => newData.push({ id: doc.id, ...doc.data() }));

      setOldRatings(oldData);
      setNewRatings(newData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const toNumberIfPossible = (v) => {
    if (v === undefined || v === null) return NaN;
    if (typeof v === 'number') return v;
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? NaN : parsed;
  };

  const calculatePlayerAverages = (data, playerId) => {
    const averages = {};
    CATEGORIES.forEach(cat => {
      const categoryRatings = data.filter(r => r.category === cat.key);
      const values = categoryRatings
        .map(r => toNumberIfPossible(r.ratings?.[playerId]))
        .filter(v => !Number.isNaN(v));
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        averages[cat.key] = +(sum / values.length).toFixed(1);
      } else {
        averages[cat.key] = 0;
      }
    });
    return averages;
  };

  const calculateOverall = (averages) => {
    const vals = Object.values(averages).filter(v => v > 0);
    if (!vals.length) return 0;
    const sum = vals.reduce((a, b) => a + parseFloat(b), 0);
    return +(sum / vals.length).toFixed(1);
  };

  const calcDiff = (newVal, oldVal) => {
    if (Number.isNaN(newVal) || Number.isNaN(oldVal)) return null;
    if (newVal === 0 && oldVal === 0) return null;
    const diff = +(newVal - oldVal).toFixed(1);
    if (diff === 0) return null;
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-purple-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-xl">Загрузка карточек игроков...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">⚽ Карточки Игроков</h1>
          <p className="text-purple-200 text-lg">Сравнение изменений рейтингов</p>
          <div className="mt-3 flex items-center justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-purple-600/30 rounded-lg text-purple-200">
              Старая коллекция: <strong>team-rating</strong>
            </span>
            <span className="text-purple-300">→</span>
            <span className="px-4 py-2 bg-pink-600/30 rounded-lg text-pink-200">
              Новая коллекция: <strong>teamRating2</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLAYERS.map(player => {
            const oldAvg = calculatePlayerAverages(oldRatings, player.id);
            const newAvg = calculatePlayerAverages(newRatings, player.id);

            const oldOverall = calculateOverall(oldAvg);
            const newOverall = calculateOverall(newAvg);
            const overallDiff = calcDiff(newOverall, oldOverall);

            return (
              <div key={player.id} className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-6 border-2 border-purple-400/30 shadow-2xl hover:scale-105 transition-transform">
                <div className="text-center mb-6">
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-6xl px-8 py-3 rounded-2xl shadow-lg mb-3">
                    {newOverall > 0 ? newOverall : '-'}
                  </div>
                  {overallDiff !== null && (
                    <div className={`text-2xl font-bold mb-2 ${overallDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {oldOverall > 0 && (
                        <>
                          <span className="text-purple-300">{oldOverall}</span>
                          <span className="mx-2">→</span>
                          <span>{newOverall}</span>
                          <span className="ml-2">
                            {overallDiff > 0 ? `(+${Math.abs(overallDiff)})` : `(-${Math.abs(overallDiff)})`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <h2 className="text-3xl font-bold text-white uppercase tracking-wider">{player.name}</h2>
                </div>

                <div className="space-y-2 mb-6">
                  {CATEGORIES.map(cat => {
                    const oldVal = oldAvg[cat.key];
                    const newVal = newAvg[cat.key];
                    const diff = calcDiff(newVal, oldVal);

                    const displayNew = newVal > 0 ? newVal : '-';
                    const colorClass =
                      newVal >= 90 ? 'text-blue-400' :
                      newVal >= 80 ? 'text-green-400' :
                      newVal >= 70 ? 'text-yellow-400' :
                      newVal >= 60 ? 'text-orange-400' :
                      newVal > 0 ? 'text-red-400' : 'text-gray-400';

                    return (
                      <div key={cat.key} className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors">
                        <span className="text-purple-200 text-sm font-medium">{cat.ru}</span>
                        <div className="flex items-center gap-2">
                          {diff !== null && oldVal > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-purple-300">{oldVal}</span>
                              <span className="text-xs text-purple-300">→</span>
                              <span className={`text-lg font-bold ${colorClass}`}>
                                {displayNew}
                              </span>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${diff > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {diff > 0 ? `+${Math.abs(diff)}` : `-${Math.abs(diff)}`}
                              </span>
                            </div>
                          ) : (
                            <span className={`text-lg font-bold ${colorClass}`}>
                              {displayNew}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-4 border-t-2 border-purple-400/30">
                  <p className="text-purple-300 text-sm font-semibold mb-1">Общий рейтинг</p>
                  <p className="text-white text-2xl font-bold">
                    {newOverall > 0 ? newOverall : 'Нет данных'}
                  </p>
                  {overallDiff !== null && oldOverall > 0 && (
                    <p className={`text-sm font-semibold mt-1 ${overallDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Изменение: {overallDiff > 0 ? `+${Math.abs(overallDiff)}` : `-${Math.abs(overallDiff)}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}