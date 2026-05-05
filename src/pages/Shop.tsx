import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Search, Filter, ChevronRight, Star, CreditCard } from 'lucide-react';
import { openRazorpay } from '../lib/razorpay';
import { auth } from '../lib/firebase';

const PRODUCTS = [
  { id: 1, name: "Premium Dog Food", price: 1200, category: "pet", sub: "Food", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400", rating: 4.8 },
  { id: 2, name: "Cattle Feed (20kg)", price: 850, category: "farm", sub: "Feed", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400", rating: 4.5 },
  { id: 3, name: "Cat Calcium Supplement", price: 450, category: "pet", sub: "Medicine", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400", rating: 4.9 },
  { id: 4, name: "Poultry Feed Mix", price: 650, category: "farm", sub: "Feed", img: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=400", rating: 4.2 },
  { id: 5, name: "Milking Machine Lube", price: 300, category: "farm", sub: "Equipment", img: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=400", rating: 4.6 },
  { id: 6, name: "Durable Dog Leash", price: 250, category: "pet", sub: "Accessories", img: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=400", rating: 4.7 },
  { id: 7, name: "Buffalo Protein Booster", price: 950, category: "farm", sub: "Supplement", img: "https://images.unsplash.com/photo-1596733430284-f7237943adfd?auto=format&fit=crop&q=80&w=400", rating: 4.8 },
  { id: 8, name: "Cat Interactive Toy", price: 150, category: "pet", sub: "Toys", img: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=400", rating: 4.4 },
];

export default function Shop() {
  const [filter, setFilter] = useState<'all' | 'pet' | 'farm'>('all');
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState<number | null>(null);

  const handleAddToCart = (id: number) => {
    setAddedId(id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleBuyNow = (product: typeof PRODUCTS[0]) => {
    openRazorpay({
      amount: product.price * 100,
      name: 'Vet Connect Shop',
      description: `Purchase: ${product.name}`,
      prefill: {
        name: auth.currentUser?.displayName || '',
        email: auth.currentUser?.email || '',
      },
      handler: (response: any) => {
        alert('Purchase Successful! Order ID: ' + response.razorpay_payment_id);
      }
    });
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesFilter = filter === 'all' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-bg-cream min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div>
            <h1 className="text-5xl lg:text-7xl font-serif italic text-brand-green mb-4">VetConnect Store</h1>
            <p className="text-brand-green/50 text-xs font-bold uppercase tracking-[0.4em]">Surgical quality products for your animals</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green/30" size={20} />
              <input 
                type="text" 
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-brand-green/10 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green transition-all" 
              />
            </div>
            <button className="p-4 bg-white border border-brand-green/10 rounded-2xl text-brand-green hover:bg-brand-green hover:text-white transition-all shadow-sm">
              <Filter size={24} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {['all', 'pet', 'farm'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                filter === f ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20' : 'bg-white text-brand-green border border-brand-green/10 hover:border-brand-green/30'
              }`}
            >
              {f === 'all' ? 'Inventory' : `${f} Care`}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={product.id}
              className="bg-white rounded-[2.5rem] p-6 border border-brand-green/5 shadow-sm hover:shadow-2xl transition-all group cursor-pointer"
            >
              <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-bg-sand">
                <img 
                  src={product.img} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-brand-green/20 hover:text-brand-gold transition-colors">
                  <Star size={20} fill="currentColor" />
                </button>
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    product.category === 'pet' ? 'bg-blue-600 text-white' : 'bg-brand-gold text-brand-green'
                  }`}>
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-brand-green/30 font-black uppercase tracking-widest">{product.sub}</span>
                <div className="flex items-center gap-1 text-[10px] font-black text-brand-gold">
                  <Star size={12} fill="currentColor" />
                  {product.rating}
                </div>
              </div>
              
              <h3 className="text-xl font-serif italic text-brand-green mb-6 group-hover:translate-x-2 transition-transform">{product.name}</h3>
              
              <div className="flex items-center justify-between mt-auto gap-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-serif italic text-brand-green">₹{product.price}</span>
                  <span className="text-[10px] text-brand-green/30 font-bold uppercase tracking-widest">Net Price</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAddToCart(product.id)}
                    className={`p-4 rounded-xl transition-all shadow-md active:scale-90 flex items-center justify-center ${
                      addedId === product.id ? 'bg-brand-gold text-brand-green' : 'bg-bg-sand text-brand-green hover:bg-brand-green/5'
                    }`}
                    title="Add to Cart"
                  >
                    {addedId === product.id ? (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2">Added</span>
                    ) : (
                      <ShoppingBag size={20} />
                    )}
                  </button>
                  <button 
                    onClick={() => handleBuyNow(product)}
                    className="p-4 bg-brand-green text-white rounded-xl transition-all shadow-xl hover:bg-brand-gold hover:text-brand-green active:scale-95 flex items-center justify-center"
                    title="Buy Now"
                  >
                    <CreditCard size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
