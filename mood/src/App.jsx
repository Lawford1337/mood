import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Sun, Moon, Zap, Coffee, ShoppingBag, X, Plus, Minus, Trash2, Edit2, Save, Shield, Upload, Image as ImageIcon } from 'lucide-react';

// ============================================================
// CONSTANTS
// ============================================================

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Двойной Эспрессо', price: 450, category: 'coffee', image: 'https://images.unsplash.com/photo-1510591509098-f40962d43898?auto=format&fit=crop&w=500&q=80', description: 'Насыщенный и бодрящий' },
  { id: 2, name: 'Капучино Grande', price: 750, category: 'coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80', description: 'Классика с пенкой' },
  { id: 3, name: 'Матча Латте', price: 950, category: 'coffee', image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=500&q=80', description: 'Японский зеленый чай' },
  { id: 4, name: 'Круассан с миндалем', price: 650, category: 'bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80', description: 'Свежая выпечка' },
  { id: 5, name: 'Чизкейк Нью-Йорк', price: 1200, category: 'dessert', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80', description: 'Кремовый десерт' },
  { id: 6, name: 'Авокадо Тост', price: 1500, category: 'food', image: 'https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=500&q=80', description: 'ЗОЖ завтрак' },
];

const MOODS = {
  morning: { id: 'morning', label: 'Утро', icon: Sun, theme: 'bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 text-orange-900', accent: 'bg-orange-500', accentHover: 'hover:bg-orange-600', quote: "Утро начинается не с кофе, а с решения быть счастливым.", heroEmoji: '🌅' },
  focus: { id: 'focus', label: 'Работа', icon: Zap, theme: 'bg-gradient-to-br from-slate-100 via-gray-200 to-zinc-200 text-slate-900', accent: 'bg-slate-800', accentHover: 'hover:bg-slate-900', quote: "Фокус определяет твою реальность.", heroEmoji: '💻' },
  evening: { id: 'evening', label: 'Релакс', icon: Moon, theme: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white', accent: 'bg-indigo-500', accentHover: 'hover:bg-indigo-600', quote: "Пусть вечер унесет заботы дня.", heroEmoji: '🌙' }
};

const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'coffee', label: 'Кофе' },
  { id: 'bakery', label: 'Выпечка' },
  { id: 'food', label: 'Еда' },
  { id: 'dessert', label: 'Десерты' },
  { id: 'drinks', label: 'Напитки' }
];

const STORAGE_KEYS = {
  CART: 'moodCafe_cart',
  MOOD: 'moodCafe_activeMood',
  CATEGORY: 'moodCafe_category',
  PRODUCTS: 'moodCafe_products' // Новый ключ для хранения товаров
};

// ============================================================
// HOOKS
// ============================================================

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// ============================================================
// COMPONENTS
// ============================================================

const ProductCard = memo(({ item, onAddToCart, theme, isAdmin, onEdit, onDelete }) => (
  <article className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full relative">
    
    {/* Картинка товара */}
    <div className="h-48 w-full overflow-hidden relative">
      {item.image ? (
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">☕</div>
      )}
      
      {/* Кнопки админа поверх картинки */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
    
    <div className="flex-1 p-6 pt-4">
      <h3 className="text-xl font-bold mb-1">{item.name}</h3>
      <p className="text-sm opacity-70 mb-2">{item.description}</p>
    </div>
    
    <div className="flex items-center justify-between mt-auto p-6 pt-0">
      <span className="text-2xl font-bold">{item.price} ₸</span>
      <button 
        onClick={() => onAddToCart(item)}
        className={`p-3 rounded-full shadow-lg active:scale-90 transition-all ${theme.accent} ${theme.accentHover} text-white`}
      >
        <Plus size={20} />
      </button>
    </div>
  </article>
));

// Форма админа (Glassmorphism стиль)
const AdminForm = ({ formData, setFormData, onSubmit, onCancel, theme }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mb-10 glass p-6 rounded-2xl animate-fade-in border-2 border-dashed border-white/40">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Edit2 size={20} />
        {formData.id ? 'Редактирование товара' : 'Добавление нового товара'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Название" className="p-3 rounded-xl bg-white/50 border-none focus:ring-2 ring-purple-400" />
        <select name="category" value={formData.category} onChange={handleChange} className="p-3 rounded-xl bg-white/50 border-none focus:ring-2 ring-purple-400">
          {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Цена" className="p-3 rounded-xl bg-white/50 border-none focus:ring-2 ring-purple-400" />
        
        {/* Загрузка фото */}
        <div className="flex gap-2">
           <input name="image" value={formData.image} onChange={handleChange} placeholder="Ссылка на фото..." className="p-3 w-full rounded-xl bg-white/50 border-none text-sm" />
           <label className="p-3 bg-white/50 rounded-xl cursor-pointer hover:bg-white/80 transition">
             <Upload size={20} />
             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
           </label>
        </div>
        
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Описание" className="md:col-span-2 p-3 rounded-xl bg-white/50 border-none focus:ring-2 ring-purple-400" rows="2" />
      </div>

      <div className="flex gap-3">
        <button onClick={onSubmit} className={`px-6 py-2 rounded-xl text-white font-bold shadow-lg ${theme.accent} hover:opacity-90 flex items-center gap-2`}>
          <Save size={18} /> Сохранить
        </button>
        <button onClick={onCancel} className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 flex items-center gap-2">
          <X size={18} /> Отмена
        </button>
      </div>
    </div>
  );
};

const CartDrawer = memo(({ isOpen, onClose, items, onUpdateQuantity, onRemove, onClearCart, total, theme }) => {
  // ... Код корзины остался без изменений (для краткости я его свернул, но он должен быть тут)
  // Если нужно, я скопирую его полностью. Вставь сюда код корзины из предыдущего ответа.
   return (
    <>
      <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} text-gray-900`}>
        <div className="h-full flex flex-col">
          <header className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag /> Ваш заказ</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X /></button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1"><h4 className="font-bold text-sm">{item.name}</h4><p className="text-xs">{item.price} ₸</p></div>
                <div className="flex items-center gap-2 bg-white rounded-lg border px-1">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1"><Minus size={14}/></button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1"><Plus size={14}/></button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-red-500"><Trash2 size={16}/></button>
              </div>
            ))}
            {items.length === 0 && <div className="text-center opacity-50 mt-10">Корзина пуста</div>}
          </div>
          <footer className="p-6 border-t bg-gray-50">
             <div className="flex justify-between text-lg font-bold mb-4"><span>Итого:</span><span>{total} ₸</span></div>
             <button onClick={() => { alert('Заказ отправлен!'); onClearCart(); onClose(); }} disabled={items.length === 0} className={`w-full py-4 rounded-xl font-bold text-white ${theme.accent} ${items.length===0?'opacity-50':''}`}>Оплатить</button>
          </footer>
        </div>
      </aside>
    </>
  );
});

// ============================================================
// MAIN APP
// ============================================================

function App() {
  // Основные состояния
  const [activeMood, setActiveMood] = useLocalStorage(STORAGE_KEYS.MOOD, 'morning');
  const [products, setProducts] = useLocalStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const [cart, setCart] = useLocalStorage(STORAGE_KEYS.CART, []);
  const [selectedCategory, setSelectedCategory] = useLocalStorage(STORAGE_KEYS.CATEGORY, 'all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Состояния Админки
  const [isAdmin, setIsAdmin] = useState(false); // Режим админа
  const [showForm, setShowForm] = useState(false); // Показать форму
  const [formData, setFormData] = useState({ id: null, name: '', price: '', category: 'coffee', image: '', description: '' });

  const currentTheme = MOODS[activeMood];

  // --- Логика Корзины ---
  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(i => i.id === product.id);
      return exist 
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(i => i.quantity > 0));
  };

  // --- Логика Админки ---
  const handleEdit = (product) => {
    setFormData({ ...product, price: product.price.toString() }); // Конвертируем цену в строку для инпута
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (confirm('Удалить этот товар?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) return alert('Заполните имя и цену!');
    
    const newProduct = {
      ...formData,
      id: formData.id || Date.now(), // Если ID нет, генерируем новый
      price: parseFloat(formData.price)
    };

    if (formData.id) {
      // Обновление
      setProducts(prev => prev.map(p => p.id === formData.id ? newProduct : p));
    } else {
      // Создание
      setProducts(prev => [...prev, newProduct]);
    }
    
    setShowForm(false);
    setFormData({ id: null, name: '', price: '', category: 'coffee', image: '', description: '' });
  };

  // --- Фильтрация ---
  const filteredItems = useMemo(() => {
    return selectedCategory === 'all' ? products : products.filter(i => i.category === selectedCategory);
  }, [selectedCategory, products]);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${currentTheme.theme} font-sans`}>
      {/* Header */}
      <header className="sticky top-0 z-30 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md"><Coffee /></div>
            <h1 className="text-2xl font-bold hidden sm:block">Mood Café</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Кнопка админа */}
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`p-2 rounded-full transition ${isAdmin ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-white/20'}`}
              title="Режим админа"
            >
              <Shield size={20} />
            </button>

            {/* Кнопка корзины */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 rounded-full hover:bg-white/20 transition">
              <ShoppingBag />
              {cart.reduce((a,c)=>a+c.quantity,0) > 0 && (
                <span className={`absolute top-1 right-1 w-5 h-5 ${currentTheme.accent} text-white text-xs flex items-center justify-center rounded-full font-bold`}>
                  {cart.reduce((a,c)=>a+c.quantity,0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Заголовок Настроения */}
        <div className="text-center mb-12">
           <div className="text-6xl mb-4 animate-bounce">{currentTheme.heroEmoji}</div>
           <h2 className="text-5xl font-extrabold mb-4">{currentTheme.label}</h2>
           <p className="text-xl opacity-80 italic">{currentTheme.quote}</p>
           
           {/* Переключатель настроения */}
           <div className="mt-8 inline-flex glass rounded-full p-1 shadow-lg">
             {Object.values(MOODS).map(mood => (
               <button key={mood.id} onClick={() => setActiveMood(mood.id)} className={`px-6 py-2 rounded-full font-bold transition ${activeMood === mood.id ? 'bg-white text-gray-900 shadow' : 'opacity-70 hover:opacity-100'}`}>
                 {mood.label}
               </button>
             ))}
           </div>
        </div>

        {/* Панель управления админа */}
        {isAdmin && (
          <div className="mb-8 flex justify-center">
            {!showForm && (
              <button onClick={() => { setFormData({ id: null, name: '', price: '', category: 'coffee', image: '', description: '' }); setShowForm(true); }} 
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-600 flex items-center gap-2 transform hover:scale-105 transition">
                <Plus size={20} /> Добавить новый товар
              </button>
            )}
          </div>
        )}

        {/* Форма редактирования */}
        {isAdmin && showForm && (
          <AdminForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleSaveProduct} 
            onCancel={() => setShowForm(false)} 
            theme={currentTheme}
          />
        )}

        {/* Категории */}
        <div className="flex overflow-x-auto gap-4 pb-4 justify-center mb-8 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} 
              className={`px-5 py-2 rounded-xl font-semibold transition whitespace-nowrap ${selectedCategory===cat.id ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 hover:bg-white/20'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Сетка товаров */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ProductCard 
              key={item.id} 
              item={item} 
              onAddToCart={addToCart} 
              theme={currentTheme}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQuantity={updateQuantity} 
        onRemove={(id) => setCart(p => p.filter(i => i.id !== id))}
        onClearCart={() => setCart([])}
        total={cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}
        theme={currentTheme}
      />
    </div>
  );
}

export default App;