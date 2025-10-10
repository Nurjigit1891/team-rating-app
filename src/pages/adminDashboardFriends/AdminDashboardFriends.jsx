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

export default function AdminDashboardFriends() {
  const [allRatings, setAllRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('defending');

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

  const calculateAverages = () => {
    const averages = {};
    
    CATEGORIES.forEach(cat => {
      averages[cat.key] = {};
      PLAYERS.forEach(player => {
        averages[cat.key][player.id] = {
          sum: 0,
          count: 0,
          avg: 0
        };
      });
    });

    allRatings.forEach(rating => {
      const category = rating.category;
      if (rating.ratings) {
        Object.keys(rating.ratings).forEach(playerId => {
          const id = parseInt(playerId);
          if (averages[category] && averages[category][id]) {
            averages[category][id].sum += rating.ratings[playerId];
            averages[category][id].count += 1;
          }
        });
      }
    });

    Object.keys(averages).forEach(cat => {
      Object.keys(averages[cat]).forEach(playerId => {
        const data = averages[cat][playerId];
        if (data.count > 0) {
          data.avg = (data.sum / data.count).toFixed(1);
        }
      });
    });

    return averages;
  };

  const getUniqueUsers = () => {
    const users = {};
    allRatings.forEach(rating => {
      if (!users[rating.userName]) {
        users[rating.userName] = {
          name: rating.userName,
          submissions: 0,
          categories: []
        };
      }
      users[rating.userName].submissions += 1;
      users[rating.userName].categories.push(rating.category);
    });
    return Object.values(users);
  };

  const getCategoryStats = (category) => {
    const categoryRatings = allRatings.filter(r => r.category === category);
    return {
      total: categoryRatings.length,
      users: [...new Set(categoryRatings.map(r => r.userName))]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-purple-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-xl">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const averages = calculateAverages();
  const users = getUniqueUsers();
  const totalSubmissions = allRatings.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">📊 Admin Dashboard</h1>
          <p className="text-purple-200 text-lg">Статистика и результаты команды</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-purple-300 text-sm font-semibold mb-2">Всего оценок</div>
            <div className="text-4xl font-bold text-white">{totalSubmissions}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-purple-300 text-sm font-semibold mb-2">Пользователей</div>
            <div className="text-4xl font-bold text-white">{users.length}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-purple-300 text-sm font-semibold mb-2">Игроков</div>
            <div className="text-4xl font-bold text-white">{PLAYERS.length}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedView === 'overview'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Обзор
          </button>
          <button
            onClick={() => setSelectedView('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedView === 'users'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setSelectedView('averages')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedView === 'averages'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Средние оценки
          </button>
          <button
            onClick={() => setSelectedView('raw')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedView === 'raw'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Все данные
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          
          {/* Overview */}
          {selectedView === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Статистика по категориям</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map(cat => {
                  const stats = getCategoryStats(cat.key);
                  return (
                    <div key={cat.key} className="bg-white/10 rounded-xl p-5 border border-white/10">
                      <div className="text-lg font-bold text-white mb-1">{cat.ru}</div>
                      <div className="text-sm text-purple-200 mb-3">{cat.en}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-300">{stats.total}</div>
                          <div className="text-xs text-white/60">оценок</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-pink-300">{stats.users.length}</div>
                          <div className="text-xs text-white/60">юзеров</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Users */}
          {selectedView === 'users' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Список пользователей</h2>
              <div className="space-y-3">
                {users.map((user, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{user.name}</div>
                        <div className="text-sm text-purple-200">
                          {user.submissions} оценок • {[...new Set(user.categories)].length} категорий
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...new Set(user.categories)].map(cat => (
                        <span key={cat} className="px-2 py-1 bg-purple-500/30 rounded text-xs text-white">
                          {CATEGORIES.find(c => c.key === cat)?.ru}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Averages */}
          {selectedView === 'averages' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Средние оценки игроков</h2>
              
              {/* Category Selector */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedCategory === cat.key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {cat.ru}
                  </button>
                ))}
              </div>

              {/* Players Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-purple-200 font-semibold">#</th>
                      <th className="text-left py-3 px-4 text-purple-200 font-semibold">Игрок</th>
                      <th className="text-center py-3 px-4 text-purple-200 font-semibold">Средняя</th>
                      <th className="text-center py-3 px-4 text-purple-200 font-semibold">Голосов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAYERS.map(player => {
                      const data = averages[selectedCategory]?.[player.id] || { avg: 0, count: 0 };
                      return (
                        <tr key={player.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white/60">{player.id}</td>
                          <td className="py-3 px-4 text-white font-semibold">{player.name}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-2xl font-bold ${
                              data.avg >= 90 ? 'text-green-400' :
                              data.avg >= 80 ? 'text-blue-400' :
                              data.avg >= 70 ? 'text-yellow-400' :
                              data.avg >= 60 ? 'text-orange-400' :
                              'text-red-400'
                            }`}>
                              {data.avg > 0 ? data.avg : '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-purple-200">
                            {data.count > 0 ? data.count : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Data */}
          {selectedView === 'raw' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Все данные</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {allRatings.map((rating, index) => (
                  <div key={rating.id} className="bg-white/10 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-lg font-bold text-white">{rating.userName}</div>
                        <div className="text-sm text-purple-200">
                          {CATEGORIES.find(c => c.key === rating.category)?.ru} • {
                            rating.completedAt ? new Date(rating.completedAt).toLocaleString('ru-RU') : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {rating.ratings && Object.keys(rating.ratings).map(playerId => {
                        const player = PLAYERS.find(p => p.id === parseInt(playerId));
                        return (
                          <div key={playerId} className="bg-white/10 rounded-lg p-2 text-center">
                            <div className="text-xs text-white/60 mb-1">{player?.name || playerId}</div>
                            <div className="text-lg font-bold text-purple-300">{rating.ratings[playerId]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}