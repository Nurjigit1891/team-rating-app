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
];

const PLAYERS = [
  { id: 1, name: 'Beksultan' },
  { id: 2, name: 'Islam' },
  { id: 3, name: 'Nurdan' },
  { id: 4, name: 'Nursultan' },
  { id: 5, name: 'Nurzhigit' },
];

export default function PlayerCardsView() {
  const [allRatings, setAllRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllRatings();
  }, []);

  const fetchAllRatings = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'team-ratings'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ratings = [];
      querySnapshot.forEach((doc) => {
        ratings.push({ id: doc.id, ...doc.data() });
      });
      
      setAllRatings(ratings);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlayerAverages = (playerId) => {
    const playerAverages = {};
    
    CATEGORIES.forEach(cat => {
      const categoryRatings = allRatings.filter(r => r.category === cat.key);
      const ratings = categoryRatings
        .map(r => r.ratings?.[playerId])
        .filter(r => r !== undefined);
      
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, val) => acc + val, 0);
        playerAverages[cat.key] = (sum / ratings.length).toFixed(1);
      } else {
        playerAverages[cat.key] = 0;
      }
    });
    
    return playerAverages;
  };

  const calculateOverallRating = (averages) => {
    const values = Object.values(averages).filter(v => v > 0);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + parseFloat(val), 0);
    return (sum / values.length).toFixed(1);
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
          <p className="text-purple-200 text-lg">FIFA Ultimate Team Style</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLAYERS.map(player => {
            const averages = calculatePlayerAverages(player.id);
            const overall = calculateOverallRating(averages);
            
            return (
              <div key={player.id} className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-6 border-2 border-purple-400/30 shadow-2xl hover:scale-105 transition-transform">
                {/* Header with name and overall */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-6xl px-8 py-3 rounded-2xl shadow-lg mb-3">
                    {overall > 0 ? overall : '-'}
                  </div>
                  <h2 className="text-3xl font-bold text-white uppercase tracking-wider">{player.name}</h2>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-6">
                  {CATEGORIES.map(cat => {
                    const value = averages[cat.key];
                    return (
                      <div key={cat.key} className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors">
                        <span className="text-purple-200 text-sm font-medium">{cat.ru}</span>
                        <span className={`text-lg font-bold ${
                          value >= 90 ? 'text-blue-400' :
                          value >= 80 ? 'text-green-400' :
                          value >= 70 ? 'text-yellow-400' :
                          value >= 60 ? 'text-orange-400' :
                          value > 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {value > 0 ? value : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Overall Rating Label */}
                <div className="text-center pt-4 border-t-2 border-purple-400/30">
                  <p className="text-purple-300 text-sm font-semibold">Общий рейтинг</p>
                  <p className="text-white text-xl font-bold">{overall > 0 ? overall : 'Нет данных'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}