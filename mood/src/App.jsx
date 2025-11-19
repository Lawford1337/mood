import { useState, useEffect, useMemo } from 'react'
import { Sun, Moon, Zap, Coffee, ShoppingBag, X, Plus, Minus } from 'lucide-react'

// --- DATA CONSTANTS ---
const MOODS = {
    morning: {
        id: 'morning',
        label: 'Утро',
        icon: Sun,
        theme: 'bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 text-orange-900',
        accent: 'bg-orange-500',
        quote: "Утро начинается не с кофе, а с решения быть счастливым.",
        heroEmoji: '🌅'
    },
    focus: {
        id: 'focus',
        label: 'Работа',
        icon: Zap,
        theme: 'bg-gradient-to-br from-slate-100 via-gray-200 to-zinc-200 text-slate-900',
        accent: 'bg-slate-800',
        quote: "Фокус определяет твою реальность.",
        heroEmoji: '💻'
    },
    evening: {
        id: 'evening',
        label: 'Релакс',
        icon: Moon,
        theme: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white',
        accent: 'bg-indigo-500',
        quote: "Пусть вечер унесет заботы дня.",
        heroEmoji: '🌙'
    }
};

const MENU_ITEMS = [
    { id: 1, name: 'Двойной Эспрессо', price: 450, category: 'coffee', image: '☕' },
    { id: 2, name: 'Капучино Grande', price: 750, category: 'coffee', image: '🥛' },
    { id: 3, name: 'Матча Латте', price: 950, category: 'coffee', image: '🍵' },
    { id: 4, name: 'Круассан с миндалем', price: 650, category: 'bakery', image: '🥐' },
    { id: 5, name: 'Чизкейк Нью-Йорк', price: 1200, category: 'dessert', image: '🍰' },
    { id: 6, name: 'Авокадо Тост', price: 1500, category: 'food', image: '🥑' },
    { id: 7, name: 'Ягодный смузи', price: 1100, category: 'drinks', image: '🥤' },
    { id: 8, name: 'Тирамису', price: 1300, category: 'dessert', image: '🍮' },
];

// --- COMPONENTS ---

const CartDrawer = ({ isOpen, onClose, items, updateQuantity, total, accentColor }) => {
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} text-gray-900`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingBag /> Ваш заказ
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-50">
                                <Coffee size={48} className="mb-4" />
                                <p>Корзина пуста</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                                    <span className="text-2xl">{item.image}</span>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <p className="text-xs text-gray-500">{item.price} ₸</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white rounded-lg border px-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-red-500"><Minus size={14}/></button>
                                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-green-500"><Plus size={14}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t bg-gray-50">
                        <div className="flex justify-between items-center mb-4 text-lg font-bold">
                            <span>Итого:</span>
                            <span>{total} ₸</span>
                        </div>
                        <button 
                            disabled={items.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${accentColor} ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                            onClick={() => alert('Интеграция с платежной системой...')}
                        >
                            Оплатить заказ
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- MAIN APP ---

function App() {
    const [activeMood, setActiveMood] = useState('morning');
    const [cart, setCart] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('moodCart');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const currentTheme = MOODS[activeMood];

    useEffect(() => {
        localStorage.setItem('moodCart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? {...item, quantity: item.quantity + 1} : item);
            }
            return [...prev, {...product, quantity: 1}];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) return {...item, quantity: Math.max(0, item.quantity + delta)};
        }).filter(item => item.quantity > 0));
    };

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    const filteredItems = useMemo(() => {
        return selectedCategory === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${currentTheme.theme}`}>
            
            {/* Dynamic Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob`}></div>
                <div className={`absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000`}></div>
                <div className={`absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000`}></div>
            </div>

            <header className="sticky top-0 z-30 glass shadow-sm transition-all duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            <Coffee className="text-current" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Mood Café</span>
                    </div>

                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-3 rounded-full hover:bg-white/20 transition group"
                    >
                        <ShoppingBag />
                        {cartCount > 0 && (
                            <span className={`absolute top-1 right-1 w-5 h-5 ${currentTheme.accent} text-white text-xs flex items-center justify-center rounded-full font-bold shadow-md transform group-hover:scale-110 transition`}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16 animate-fade-in">
                    <div className="inline-block text-6xl mb-6 hover:animate-bounce cursor-default transition transform hover:scale-110 duration-300">
                        {currentTheme.heroEmoji}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                        {currentTheme.label}
                    </h1>
                    <p className="text-xl md:text-2xl opacity-80 max-w-2xl mx-auto font-light italic">
                        {currentTheme.quote}
                    </p>
                    
                    <div className="mt-10 inline-flex glass rounded-full p-1.5 shadow-lg gap-1">
                        {Object.values(MOODS).map((mood) => {
                            const MoodIcon = mood.icon;
                            return (
                                <button
                                    key={mood.id}
                                    onClick={() => setActiveMood(mood.id)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300
                                        ${activeMood === mood.id 
                                            ? 'bg-white text-gray-900 shadow-md transform scale-105' 
                                            : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <MoodIcon size={16} />
                                    {mood.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-4 pb-8 justify-center no-scrollbar mb-8">
                    {[
                        {id: 'all', label: 'Все'},
                        {id: 'coffee', label: 'Кофе'},
                        {id: 'bakery', label: 'Выпечка'},
                        {id: 'food', label: 'Еда'},
                        {id: 'dessert', label: 'Десерты'}
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`
                                px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border
                                ${selectedCategory === cat.id 
                                    ? `${currentTheme.accent} border-transparent text-white shadow-lg ring-2 ring-offset-2 ring-offset-transparent` 
                                    : 'border-white/20 bg-white/10 hover:bg-white/20'
                                }
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <div 
                            key={item.id}
                            className="group glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col"
                        >
                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition duration-500 self-center">
                                {item.image}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                                <div className="h-1 w-12 bg-current opacity-20 rounded-full mb-4"></div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-2xl font-bold">{item.price} ₸</span>
                                <button 
                                    onClick={() => addToCart(item)}
                                    className={`
                                        p-3 rounded-full transition-all shadow-lg active:scale-90
                                        ${activeMood === 'evening' ? 'bg-white text-indigo-900 hover:bg-indigo-50' : `${currentTheme.accent} text-white hover:brightness-110`}
                                    `}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)}
                items={cart}
                updateQuantity={updateQuantity}
                total={cartTotal}
                accentColor={currentTheme.accent}
            />

            <footer className="text-center py-10 opacity-60 text-sm relative z-10">
                <p>© 2025 Mood Café Enterprise. Developed on Vite.</p>
            </footer>
        </div>
    )
}

export default App