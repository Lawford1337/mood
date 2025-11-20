import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Sun, Moon, Zap, Coffee, ShoppingBag, X, Plus, Minus, Trash2, ChevronDown } from 'lucide-react';

// ============================================================
// CONSTANTS & TYPES
// ============================================================

const MOODS = {
  morning: {
    id: 'morning',
    label: 'Утро',
    icon: Sun,
    theme: 'bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 text-orange-900',
    accent: 'bg-orange-500',
    accentHover: 'hover:bg-orange-600',
    quote: "Утро начинается не с кофе, а с решения быть счастливым.",
    heroEmoji: '🌅'
  },
  focus: {
    id: 'focus',
    label: 'Работа',
    icon: Zap,
    theme: 'bg-gradient-to-br from-slate-100 via-gray-200 to-zinc-200 text-slate-900',
    accent: 'bg-slate-800',
    accentHover: 'hover:bg-slate-900',
    quote: "Фокус определяет твою реальность.",
    heroEmoji: '💻'
  },
  evening: {
    id: 'evening',
    label: 'Релакс',
    icon: Moon,
    theme: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white',
    accent: 'bg-indigo-500',
    accentHover: 'hover:bg-indigo-600',
    quote: "Пусть вечер унесет заботы дня.",
    heroEmoji: '🌙'
  }
};

const MENU_ITEMS = [
  { id: 1, name: 'Двойной Эспрессо', price: 450, category: 'coffee', image: 'https://images.unsplash.com/photo-1581968627456-7537f3a55584?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGVzcHJlc3NvfGVufDB8fDB8fHww', description: 'Насыщенный и бодрящий' },
  { id: 2, name: 'Капучино Grande', price: 750, category: 'coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80', description: 'Классика с пенкой' },
  { id: 3, name: 'Матча Латте', price: 950, category: 'coffee', image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=500&q=80', description: 'Японский зеленый чай' },
  { id: 4, name: 'Круассан с миндалем', price: 650, category: 'bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80', description: 'Свежая выпечка' },
  { id: 5, name: 'Чизкейк Нью-Йорк', price: 1200, category: 'dessert', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80', description: 'Кремовый десерт' },
  { id: 6, name: 'Авокадо Тост', price: 1500, category: 'food', image: 'https://plus.unsplash.com/premium_photo-1691090282768-380cc3e34b23?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXZvY2FkbyUyMHRvYXN0fGVufDB8fDB8fHww', description: 'ЗОЖ завтрак' },
  { id: 7, name: 'Ягодный смузи', price: 1100, category: 'drinks', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=500&q=80', description: 'Свежие ягоды' },
  { id: 8, name: 'Тирамису', price: 1300, category: 'dessert', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80', description: 'Итальянский десерт' },
];

const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'coffee', label: 'Кофе' },
  { id: 'bakery', label: 'Выпечка' },
  { id: 'food', label: 'Еда' },
  { id: 'dessert', label: 'Десерты' }
];

const STORAGE_KEYS = {
  CART: 'moodCafe_cart',
  MOOD: 'moodCafe_activeMood',
  CATEGORY: 'moodCafe_category'
};

// ============================================================
// CUSTOM HOOKS
// ============================================================

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useCart = () => {
  const [cart, setCart] = useLocalStorage(STORAGE_KEYS.CART, []);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, [setCart]);

  const updateQuantity = useCallback((id, delta) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  }, [setCart]);

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    cartTotal,
    cartCount
  };
};

// ============================================================
// COMPONENTS
// ============================================================

const AnimatedBlob = memo(({ className, delay = 0 }) => (
  <div 
    className={`absolute w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  />
));

AnimatedBlob.displayName = 'AnimatedBlob';

const BackgroundBlobs = memo(() => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <AnimatedBlob className="top-0 -left-4 bg-purple-300" delay={0} />
    <AnimatedBlob className="top-0 -right-4 bg-yellow-300" delay={2000} />
    <AnimatedBlob className="-bottom-8 left-20 bg-pink-300" delay={4000} />
  </div>
));

BackgroundBlobs.displayName = 'BackgroundBlobs';

const MoodSelector = memo(({ activeMood, onMoodChange }) => (
  <div className="mt-10 inline-flex glass rounded-full p-1.5 shadow-lg gap-1" role="tablist">
    {Object.values(MOODS).map((mood) => {
      const MoodIcon = mood.icon;
      const isActive = activeMood === mood.id;
      
      return (
        <button
          key={mood.id}
          onClick={() => onMoodChange(mood.id)}
          role="tab"
          aria-selected={isActive}
          aria-label={`Переключиться на режим: ${mood.label}`}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold 
            transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isActive 
              ? 'bg-white text-gray-900 shadow-md transform scale-105' 
              : 'hover:bg-white/10 opacity-70 hover:opacity-100'
            }
          `}
        >
          <MoodIcon size={16} aria-hidden="true" />
          <span>{mood.label}</span>
        </button>
      );
    })}
  </div>
));

MoodSelector.displayName = 'MoodSelector';

const CategoryFilter = memo(({ selectedCategory, onCategoryChange }) => (
  <div className="flex overflow-x-auto gap-4 pb-8 justify-center no-scrollbar mb-8" role="tablist">
    {CATEGORIES.map(cat => {
      const isActive = selectedCategory === cat.id;
      
      return (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          role="tab"
          aria-selected={isActive}
          aria-label={`Фильтр: ${cat.label}`}
          className={`
            px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap 
            border focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isActive 
              ? 'border-transparent text-white shadow-lg' 
              : 'border-white/20 bg-white/10 hover:bg-white/20'
            }
          `}
          style={isActive ? { backgroundColor: 'var(--accent-color)' } : {}}
        >
          {cat.label}
        </button>
      );
    })}
  </div>
));

CategoryFilter.displayName = 'CategoryFilter';

const ProductCard = memo(({ item, onAddToCart, theme }) => (
  <article 
    className="group glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col"
    role="article"
  >
    <div className="h-48 w-full mb-4 overflow-hidden rounded-xl relative">
      <img 
        src={item.image} 
        alt={item.name}
        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
      />
    </div>
    
    <div className="flex-1">
      <h3 className="text-xl font-bold mb-1">{item.name}</h3>
      <p className="text-sm opacity-70 mb-2">{item.description}</p>
      <div className="h-1 w-12 bg-current opacity-20 rounded-full"></div>
    </div>
    
    <div className="flex items-center justify-between mt-4">
      <span className="text-2xl font-bold" aria-label={`Цена: ${item.price} тенге`}>
        {item.price} ₸
      </span>
      <button 
        onClick={() => onAddToCart(item)}
        aria-label={`Добавить ${item.name} в корзину`}
        className={`
          p-3 rounded-full transition-all shadow-lg active:scale-90
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${theme.accent} ${theme.accentHover} text-white
        `}
      >
        <Plus size={20} aria-hidden="true" />
      </button>
    </div>
  </article>
));

ProductCard.displayName = 'ProductCard';

const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
    
    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
    
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-sm truncate">{item.name}</h4>
      <p className="text-xs text-gray-500">{item.price} ₸</p>
    </div>
    
    <div className="flex items-center gap-2 bg-white rounded-lg border px-1">
      <button 
        onClick={() => onUpdateQuantity(item.id, -1)}
        aria-label="Уменьшить количество"
        className="p-1 hover:text-red-500 focus:outline-none focus:ring-1 focus:ring-red-300 rounded"
      >
        <Minus size={14} />
      </button>
      
      <span className="text-sm font-bold w-6 text-center" aria-live="polite">
        {item.quantity}
      </span>
      
      <button 
        onClick={() => onUpdateQuantity(item.id, 1)}
        aria-label="Увеличить количество"
        className="p-1 hover:text-green-500 focus:outline-none focus:ring-1 focus:ring-green-300 rounded"
      >
        <Plus size={14} />
      </button>
    </div>
    
    <button
      onClick={() => onRemove(item.id)}
      aria-label={`Удалить ${item.name} из корзины`}
      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-red-300"
    >
      <Trash2 size={16} />
    </button>
  </div>
));

CartItem.displayName = 'CartItem';

const CartDrawer = memo(({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onClearCart,
  total, 
  theme 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = useCallback(() => {
    if (items.length === 0) return;
    
    alert(`Заказ на ${total} ₸ оформлен!\n\nВ реальном приложении здесь была бы интеграция с платежной системой.`);
    onClearCart();
    onClose();
  }, [items.length, total, onClearCart, onClose]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } text-gray-900`}
        role="dialog"
        aria-label="Корзина"
        aria-modal="true"
      >
        <div className="h-full flex flex-col">
          <header className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag aria-hidden="true" /> 
              <span>Ваш заказ</span>
            </h2>
            <button 
              onClick={onClose}
              aria-label="Закрыть корзину"
              className="p-2 hover:bg-gray-200 rounded-full transition focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <X />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Coffee size={48} className="mb-4" aria-hidden="true" />
                <p>Корзина пуста</p>
              </div>
            ) : (
              <>
                {items.map(item => (
                  <CartItem 
                    key={item.id} 
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemove}
                  />
                ))}
                
                <button
                  onClick={onClearCart}
                  className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Очистить корзину
                </button>
              </>
            )}
          </div>

          <footer className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>Итого:</span>
              <span aria-live="polite">{total} ₸</span>
            </div>
            
            <button 
              disabled={items.length === 0}
              onClick={handleCheckout}
              aria-label={`Оплатить заказ на сумму ${total} тенге`}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg 
                transition transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${theme.accent} ${theme.accentHover}
                ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Оплатить заказ
            </button>
          </footer>
        </div>
      </aside>
    </>
  );
});

CartDrawer.displayName = 'CartDrawer';

// ============================================================
// MAIN APP
// ============================================================

function App() {
  const [activeMood, setActiveMood] = useLocalStorage(STORAGE_KEYS.MOOD, 'morning');
  const [selectedCategory, setSelectedCategory] = useLocalStorage(STORAGE_KEYS.CATEGORY, 'all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    cartTotal,
    cartCount
  } = useCart();

  const currentTheme = MOODS[activeMood];

  const handleAddToCart = useCallback((product) => {
    addToCart(product);
    setIsCartOpen(true);
  }, [addToCart]);

  const filteredItems = useMemo(() => {
    return selectedCategory === 'all' 
      ? MENU_ITEMS 
      : MENU_ITEMS.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  // Set CSS variable for dynamic accent color
  useEffect(() => {
    const root = document.documentElement;
    const accentColor = currentTheme.accent.replace('bg-', '');
    const colorMap = {
      'orange-500': '#f97316',
      'slate-800': '#1e293b',
      'indigo-500': '#6366f1'
    };
    root.style.setProperty('--accent-color', colorMap[accentColor] || '#f97316');
  }, [currentTheme]);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${currentTheme.theme}`}>
      <BackgroundBlobs />

      <header className="sticky top-0 z-30 glass shadow-sm transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Coffee className="text-current" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Mood Café</h1>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            aria-label={`Корзина. Товаров: ${cartCount}`}
            className="relative p-3 rounded-full hover:bg-white/20 transition group focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <ShoppingBag aria-hidden="true" />
            {cartCount > 0 && (
              <span 
                className={`absolute top-1 right-1 w-5 h-5 ${currentTheme.accent} text-white 
                  text-xs flex items-center justify-center rounded-full font-bold shadow-md 
                  transform group-hover:scale-110 transition`}
                aria-hidden="true"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <div 
            className="inline-block text-6xl mb-6 hover:animate-bounce cursor-default 
              transition transform hover:scale-110 duration-300"
            role="img"
            aria-label={currentTheme.label}
          >
            {currentTheme.heroEmoji}
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            {currentTheme.label}
          </h2>
          
          <p className="text-xl md:text-2xl opacity-80 max-w-2xl mx-auto font-light italic">
            {currentTheme.quote}
          </p>
          
          <MoodSelector 
            activeMood={activeMood} 
            onMoodChange={setActiveMood} 
          />
        </div>

        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ProductCard 
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
              theme={currentTheme}
            />
          ))}
        </div>
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onClearCart={clearCart}
        total={cartTotal}
        theme={currentTheme}
      />

      <footer className="text-center py-10 opacity-60 text-sm relative z-10">
        <p>© 2025 Mood Café Enterprise. Crafted with React & Vite.</p>
      </footer>
    </div>
  );
}

export default App;