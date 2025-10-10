import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import bekaPhoto from '../../assets/beka.jpg'
import islamPhoto from '../../assets/russkiy.jpg'
import nursiPhoto from '../../assets/nursi.jpg'
import nurbaPhoto from '../../assets/nurba.png'
import nurdanPhoto from '../../assets/nurdan.jpg'



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
  {id: 1, name: "Нурис", photo: bekaPhoto},
  {id: 2, name: "Айдар", photo: islamPhoto},
  {id: 3, name: "Омка", photo: nurdanPhoto},
  {id: 4, name: "Адил", photo: nursiPhoto},
  {id: 5, name: "Нуржигит", photo: nurbaPhoto},
  {id: 6, name: "Атай", photo: nurbaPhoto},
  {id: 7, name: "Азамат", photo: nurbaPhoto},
  {id: 8, name: "Айбек", photo: nurbaPhoto},
  {id: 9, name: "Биймырза", photo: nurbaPhoto},
  {id: 10, name: "Эламан", photo: nurbaPhoto},

];

export default function FriendRatingApp() {
  const [stage, setStage] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [ratings, setRatings] = useState({});
  const [currentValue, setCurrentValue] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('teamRatings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRatings(parsed.ratings || {});
      setUserName(parsed.userName || '');
    }
  }, []);

  useEffect(() => {
    if (Object.keys(ratings).length > 0) {
      localStorage.setItem('teamRatings', JSON.stringify({ userName, ratings }));
    }
  }, [ratings, userName]);

  useEffect(() => {
    const category = CATEGORIES[currentCategory].key;
    const player = PLAYERS[currentPlayer].id;
    const saved = ratings[category]?.[player];
    setCurrentValue(saved || 75);
  }, [currentCategory, currentPlayer, ratings]);

  const handleStartName = () => {
    if (userName.trim()) {
      setStage('categories');
    }
  };

  const handleStartCategory = () => {
    setStage('rating');
    setCurrentPlayer(0);
  };

  const adjustValue = (delta) => {
    setCurrentValue(prev => Math.max(50, Math.min(99, prev + delta)));
  };

  const handleSliderChange = (e) => {
    setCurrentValue(parseInt(e.target.value));
  };

  const saveCurrentRating = () => {
    const category = CATEGORIES[currentCategory].key;
    const player = PLAYERS[currentPlayer].id;
    
    setRatings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [player]: currentValue
      }
    }));
  };

  const handleNext = () => {
    saveCurrentRating();
    if (currentPlayer < PLAYERS.length - 1) {
      setCurrentPlayer(prev => prev + 1);
    }
  };

  const handleBack = () => {
    saveCurrentRating();
    if (currentPlayer > 0) {
      setCurrentPlayer(prev => prev - 1);
    }
  };

  const handleFinishCategory = async () => {
    saveCurrentRating();
    setIsSubmitting(true);
    
    // Отправляем данные в Firebase
    try {
      const category = CATEGORIES[currentCategory].key;
      const categoryRatings = ratings[category] || {};
      
      // Добавляем текущую оценку
      categoryRatings[PLAYERS[currentPlayer].id] = currentValue;
      
      await addDoc(collection(db, 'ratings'), {
        userName: userName,
        category: category,
        ratings: categoryRatings,
        timestamp: serverTimestamp(),
        completedAt: new Date().toISOString()
      });
      
      console.log('✅ Данные отправлены в Firebase!');
      
      // Небольшая задержка для показа успеха
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('❌ Ошибка отправки в Firebase:', error);
      alert('Ошибка сохранения данных. Проверь консоль.');
    } finally {
      setIsSubmitting(false);
    }
    
    setStage('categories');
    setCurrentPlayer(0);
  };

  const handleNextCategory = () => {
    if (currentCategory < CATEGORIES.length - 1) {
      setCurrentCategory(prev => prev + 1);
      handleStartCategory();
    }
  };

  const isCategoryCompleted = (categoryIndex) => {
    const category = CATEGORIES[categoryIndex].key;
    const categoryRatings = ratings[category];
    if (!categoryRatings) return false;
    return PLAYERS.every(player => categoryRatings[player.id] !== undefined);
  };

  const allCompleted = CATEGORIES.every((_, index) => isCategoryCompleted(index));

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">Team Rating</h1>
          <p className="text-purple-200 text-center mb-8">Оцени игроков своей команды</p>
          
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStartName()}
            placeholder="Введи своё имя / Enter your name"
            className="w-full px-6 py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 text-lg focus:outline-none focus:border-purple-400 transition-all"
          />
          
          <button
            onClick={handleStartName}
            disabled={!userName.trim()}
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Старт / Start
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Привет, {userName}! 👋</h2>
          <p className="text-purple-200 text-center mb-8">Выбери категорию для оценки</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {CATEGORIES.map((category, index) => {
              const isCompleted = isCategoryCompleted(index);
              return (
                <button
                  key={category.key}
                  onClick={() => {
                    setCurrentCategory(index);
                    handleStartCategory();
                  }}
                  disabled={isCompleted}
                  className={`p-6 rounded-xl font-semibold text-lg transition-all ${
                    isCompleted
                      ? 'bg-green-500/20 border-2 border-green-400 text-green-300 cursor-not-allowed opacity-60'
                      : 'bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 transform hover:scale-105'
                  }`}
                >
                  <div className="text-sm opacity-80">{category.en}</div>
                  <div className="text-xl">{category.ru}</div>
                  {isCompleted && (
                    <div>
                      <div className="text-2xl mt-2">✓</div>
                      <div className="text-xs mt-1">Завершено</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {allCompleted && (
            <div className="mt-8 p-6 bg-green-500/20 border-2 border-green-400 rounded-xl text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-green-300 mb-2">Все категории завершены!</h3>
              <p className="text-green-200">Спасибо за оценку команды!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'rating') {
    const category = CATEGORIES[currentCategory];
    const player = PLAYERS[currentPlayer];
    const isFirst = currentPlayer === 0;
    const isLast = currentPlayer === PLAYERS.length - 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">{category.en} / {category.ru}</h2>
            <p className="text-purple-200 text-sm mt-1">Игрок {currentPlayer + 1} из {PLAYERS.length}</p>
          </div>

          <div className="mb-6">
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-48 h-60 object-cover rounded-2xl mx-auto shadow-xl border-4 border-white/20"
            />
            <h3 className="text-2xl font-bold text-white text-center mt-4">{player.name}</h3>
          </div>

          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl font-bold px-8 py-3 rounded-xl shadow-lg">
                {currentValue}
              </div>
            </div>

            <input
              type="range"
              min="50"
              max="99"
              value={currentValue}
              onChange={handleSliderChange}
              className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(236 72 153) ${((currentValue - 50) / 49) * 100}%, rgba(255,255,255,0.2) ${((currentValue - 50) / 49) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />

            <div className="flex justify-center gap-2 mt-4">
              {[-10, -5, -1, +1, +5, +10].map(delta => (
                <button
                  key={delta}
                  onClick={() => adjustValue(delta)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold border border-white/20 transition-all hover:scale-105"
                >
                  {delta > 0 ? '+' : ''}{delta}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {!isFirst && (
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all"
              >
                ← Назад
              </button>
            )}
            
            {!isLast ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                След. →
              </button>
            ) : (
              <button
                onClick={handleFinishCategory}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>Завершить ✓</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}