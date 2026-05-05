/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, MessageSquare, Phone, Video, AlertCircle, ShoppingBag, 
  User, LayoutDashboard, LogOut, ChevronRight, Github, Twitter, Instagram,
  Soup, ShieldCheck, FileText, Zap, Scissors, Bird, Brain, Scale, Milk, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import Shop from './pages/Shop';
import Consult from './pages/Consult';
import Vets from './pages/Vets';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import VetPortal from './pages/VetPortal';
import Login from './pages/Login';

import { WHATSAPP_LINK } from './constants';


// Pages
import { requestNotificationPermission, sendNotification } from './services/notificationService';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const SERVICES_LIST = [
  {
    title: "Nutrition & Diet Planning",
    desc: "Personalized diet plans for dogs, cats, cows, buffaloes, poultry, goats, and other animals based on age, breed, and health condition.",
    icon: Soup,
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Vaccination Services",
    desc: "Vaccination schedules, reminders, and preventive healthcare guidance.",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1628154791552-28af1f0bc94e?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Pet Pharmacy & Store",
    desc: "Online shopping for pet food, supplements, medicines, grooming products, and farm healthcare supplies.",
    icon: ShoppingBag,
    image: "https://images.unsplash.com/photo-1625316708582-7c3873423af9?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Online Prescription Services",
    desc: "Digital prescriptions and medicine recommendations from certified veterinary doctors.",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Skin & Allergy Treatment",
    desc: "Treatment support for itching, hair fall, infections, ticks, allergies, and skin diseases.",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Pet Grooming Guidance",
    desc: "Professional advice for grooming, hygiene, coat care, and bathing routines.",
    icon: Scissors,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Dairy Farm Health Management",
    desc: "Expert consultation for milk production, buffalo health, cow nutrition, mastitis prevention, and dairy productivity improvement.",
    icon: Milk,
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Poultry Farm Consultation",
    desc: "Disease prevention, vaccination, feed management, and productivity optimization for poultry farms.",
    icon: Bird,
    image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Pet Behavioral Consultation",
    desc: "Advice for aggression, anxiety, barking, eating disorders, stress, and training behavior.",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Weight Management Programs",
    desc: "Specialized weight gain and weight loss diet programs for pets and livestock.",
    icon: Scale,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
  }
];

const Home = () => {
  return (
    <div className="flex-1 flex">
      {/* Left Rail: Vertical Branding */}
      <div className="hidden lg:flex w-20 border-r border-brand-green/10 flex-col justify-between py-10 items-center bg-bg-sand">
        <span className="rotate-180 [writing-mode:vertical-rl] uppercase text-[10px] tracking-[0.4em] font-bold opacity-30">Trusted by 50k+ Farmers</span>
        <div className="space-y-4">
          <div className="w-1 h-12 bg-brand-gold rounded-full"></div>
          <div className="w-1 h-8 bg-brand-green/20 rounded-full"></div>
          <div className="w-1 h-8 bg-brand-green/20 rounded-full"></div>
        </div>
        <span className="[writing-mode:vertical-rl] uppercase text-[10px] tracking-[0.4em] font-bold opacity-30">ESTD 2024</span>
      </div>

      {/* Hero Area */}
      <div className="flex-1 flex flex-col p-6 lg:p-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Big Headline */}
          <div className="lg:col-span-7 flex flex-col justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-green/40">Direct Video Access • Vets Online</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl lg:text-8xl font-serif leading-[0.9] text-brand-green italic"
            >
              Expert Care <br/> For Every <span className="text-brand-gold not-italic font-sans font-black">LIFE.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg lg:text-xl text-brand-green/70 max-w-md leading-relaxed"
            >
              Instant veterinary support for your pets and livestock through 
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="text-brand-gold font-bold hover:underline mx-1">WhatsApp</a>, 
              <Link to="/consult?service=audio" className="text-brand-green font-bold hover:underline mx-1">audio</Link>, and 
              <Link to="/consult?service=video" className="text-brand-green font-bold hover:underline mx-1">video</Link> consultations.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 mt-6"
            >
              <Link to="/consult?service=video" className="bg-brand-green text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl shadow-brand-green/20">
                <Video size={18} /> Book Consultation
              </Link>
              <Link to="/consult?service=audio" className="bg-white border border-brand-green/10 text-brand-green px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-brand-green hover:text-white transition-all shadow-sm">
                <Phone size={18} /> Audio Consultation
              </Link>
              <Link to="/consult?service=whatsapp" className="bg-white border border-brand-green/10 text-brand-green px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-brand-green hover:text-white transition-all shadow-sm">
                <MessageSquare size={18} /> WhatsApp Chat
              </Link>
            </motion.div>
            
            <div className="mt-8 flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-40">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-bg-cream bg-slate-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                  </div>
                ))}
              </div>
              <p>50k+ Happy Farmers & Pet Owners</p>
            </div>
          </div>

          {/* Main Visual / Video Call Mockup */}
          <div className="lg:col-span-5 relative">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white rounded-[3rem] shadow-2xl p-4 border border-brand-green/5 relative overflow-hidden"
            >
              {/* Mock Video Call UI */}
              <div className="aspect-[4/5] bg-bg-sand rounded-[2.5rem] overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" 
                  alt="Doctor on call" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlays */}
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">Live: Dr. Sharma</span>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl p-3 rounded-[2rem] border border-white/20">
                    <Link 
                     to="/consult?service=audio"
                     className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-red-600 transition-colors"
                    >
                      <Phone size={18} />
                    </Link>
                    <Link 
                     to="/consult?service=video"
                     className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/40 transition-colors"
                    >
                      <Video size={18} />
                    </Link>
                   <Link to="/consult" className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-brand-green cursor-pointer hover:bg-white transition-all">
                     <MessageSquare size={18} />
                   </Link>
                </div>

                {/* Self View */}
                <div className="absolute bottom-24 right-6 w-32 aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-3">
                   <img 
                    src="https://images.unsplash.com/photo-1544168190-79c17527004f?auto=format&fit=crop&q=80&w=400" 
                    alt="Pet owner" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                   />
                </div>
              </div>

              {/* Floating Banner */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -left-8 top-1/2 -translate-y-1/2 bg-brand-gold p-6 rounded-3xl shadow-xl z-20 hidden xl:block"
              >
                 <Video size={24} className="text-brand-green mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">Next Availability</p>
                 <p className="text-lg font-serif italic text-brand-green">In 2 Minutes</p>
              </motion.div>
            </motion.div>

            {/* Quick Feature Cards Overlay */}
            <div className="absolute -bottom-10 left-10 right-10 grid grid-cols-2 gap-4 hidden lg:grid">
               <Link to="/consult">
                 <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[2rem] shadow-xl border border-brand-green/5 flex items-center gap-4 h-full"
                 >
                   <div className="w-10 h-10 bg-bg-sand rounded-xl flex items-center justify-center text-brand-green shrink-0">
                      <AlertCircle size={20} />
                   </div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-brand-green/40">
                     Symptom Checker
                   </div>
                 </motion.div>
               </Link>
               <Link to="/about">
                 <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-brand-green p-6 rounded-[2rem] shadow-xl border border-white/5 flex items-center gap-4 h-full"
                 >
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-gold shrink-0">
                      <ShoppingBag size={20} />
                   </div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-white/40">
                     Farmer Hub
                   </div>
                 </motion.div>
               </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <section className="grid md:grid-cols-4 gap-8 mt-24">
          {[
            { label: 'Available Doctors', val: '24/7' },
            { label: 'Expert Vets', val: '500+' },
            { label: 'Success Rate', val: '98%' },
            { label: 'Wait Time', val: '< 10m' }
          ].map(s => (
            <div key={s.label} className="border-l border-brand-green/10 pl-6 py-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mb-1">{s.label}</p>
              <p className="text-3xl font-serif italic text-brand-green">{s.val}</p>
            </div>
          ))}
        </section>

        {/* Service Area */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-green/30 mb-4">Our Service Area</h2>
            <h3 className="text-4xl lg:text-6xl font-serif italic text-brand-green">Comprehensive Animal Healthcare</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[
              { id: 'video', title: "Video Consultation", desc: "Face-to-face clinical checkups from home.", icon: Video, color: "bg-purple-50 text-purple-600" },
              { id: 'audio', title: "Audio Consultation", desc: "Expert voice consultations for quick queries.", icon: Phone, color: "bg-blue-50 text-blue-600" },
              { id: 'whatsapp', title: "WhatsApp Support", desc: "Send photos & get text advice instantly.", icon: MessageSquare, color: "bg-green-50 text-green-600" },
              { id: 'emergency', title: "Emergency Care", desc: "Priority 24/7 access for critical cases.", icon: AlertCircle, color: "bg-red-50 text-red-600" },
            ].map((s, i) => (
              <Link to={`/consult?service=${s.id}`} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[3rem] border border-brand-green/5 shadow-sm hover:shadow-xl hover:border-brand-green/10 transition-all group overflow-hidden flex flex-col h-full p-8 lg:p-10"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${s.color}`}>
                    <s.icon size={24} />
                  </div>
                  <h4 className="text-2xl font-serif italic text-brand-green mb-4 leading-tight">{s.title}</h4>
                  <p className="text-brand-green/60 text-xs leading-relaxed font-medium mb-8">{s.desc}</p>
                  <div className="mt-auto flex items-center gap-2 text-brand-gold font-bold text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    Book Now <ChevronRight size={12} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Components
function Navbar({ user, userProfile, loading }: { user: any, userProfile: any, loading: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const loginWithGoogle = () => {
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-gold rounded-full animate-pulse" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-green">VET<span className="text-brand-gold">CONNECT</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em]">
          <Link to="/vets" className={`${isActive('/vets') ? 'text-brand-gold' : 'text-brand-green/70'} hover:text-brand-gold transition-colors`}>Our Experts</Link>
          <Link to="/consult" className={`${isActive('/consult') ? 'text-brand-gold' : 'text-brand-green/70'} hover:text-brand-gold transition-colors`}>Consultation</Link>
          <Link to="/shop" className={`${isActive('/shop') ? 'text-brand-gold' : 'text-brand-green/70'} hover:text-brand-gold transition-colors`}>Product Store</Link>
          <Link to="/about" className={`${isActive('/about') ? 'text-brand-gold' : 'text-brand-green/70'} hover:text-brand-gold transition-colors`}>Farmer Hub</Link>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {/* If doctor role is present in session, show Vet Portal link */}
              {userProfile?.role === 'doctor' && (
                <Link to="/vet-portal" className="hidden xl:flex px-6 py-2 rounded-full border border-brand-gold text-brand-gold text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all">
                  Doctor Portal
                </Link>
              )}
              <Link to="/dashboard" className="px-6 py-2 rounded-full border border-brand-green text-[10px] font-bold uppercase tracking-widest hover:bg-brand-green hover:text-white transition-all">
                Dashboard
              </Link>
              <button 
                onClick={() => auth.signOut()} 
                className="p-2 text-brand-green/40 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="px-6 py-2 rounded-full border border-brand-green text-[10px] font-bold uppercase tracking-widest hover:bg-brand-green hover:text-white transition-all">
              Login
            </button>
          )}
          <Link to="/consult?service=emergency" className="px-6 py-2 bg-brand-gold text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-brand-gold/20">
            Emergency 24/7
          </Link>
        </div>

        <button className="lg:hidden p-2 text-brand-green" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-8 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col gap-6 text-brand-green font-bold uppercase tracking-widest text-sm">
              <Link to="/vets" onClick={() => setIsOpen(false)}>Our Experts</Link>
              <Link to="/consult" onClick={() => setIsOpen(false)}>Consultation</Link>
              <Link to="/shop" onClick={() => setIsOpen(false)}>Product Store</Link>
              <Link to="/about" onClick={() => setIsOpen(false)}>Farmer Hub</Link>
              <div className="h-[1px] bg-slate-100" />
              {user ? (
                <>
                  {userProfile?.role === 'doctor' && (
                    <Link to="/vet-portal" onClick={() => setIsOpen(false)} className="text-brand-gold">Doctor Portal</Link>
                  )}
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-brand-gold">Dashboard</Link>
                </>
              ) : (
                <button onClick={() => { loginWithGoogle(); setIsOpen(false); }} className="text-left text-brand-gold">Login</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-green text-white/50 py-16 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-gold">Live Doctors Online</span>
          <div className="flex -space-x-3 mb-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-brand-green bg-slate-600 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="doctor" />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-4 border-brand-green bg-brand-gold flex items-center justify-center text-brand-green text-xs font-black">+14</div>
          </div>
          <Link to="/vet-portal" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-brand-gold transition-colors flex items-center gap-2">
            Join as a Veterinarian <ChevronRight size={12} />
          </Link>
        </div>

        <div className="hidden lg:block h-20 w-[1px] bg-white/10" />

        <div className="flex-[2] flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Essential Products</span>
          <div className="flex flex-wrap gap-4">
            {['Cattle Feed', 'Pet Shampoo', 'Vet-Meds Kit'].map((item, i) => (
              <Link key={i} to="/shop" className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
                <span className="text-white font-medium">{item}</span>
                <span className="text-brand-gold font-bold">₹{i === 0 ? '450' : i === 1 ? '199' : '899'}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          <Link to="/consult?service=emergency" className="text-right cursor-pointer group hover:scale-105 transition-transform">
            <p className="text-white text-4xl font-serif italic leading-none mb-1 group-hover:text-brand-gold transition-colors">10 Min</p>
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-brand-gold">Emergency Response</p>
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
        <p>© 2026 VetConnect India. Quality care for every life.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        requestNotificationPermission();
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col pt-0">
        <Navbar user={user} userProfile={userProfile} loading={loading} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vets" element={<Vets />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/consult" element={<Consult />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/vet-portal" element={<VetPortal />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
        {/* Floating WhatsApp Button */}
        <a 
          href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hi, I need help with my pet/livestock.')}`} 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-8 right-8 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_40px_-10px_rgba(37,211,102,0.5)] hover:scale-110 transition-transform flex items-center justify-center"
          title="Chat with expert"
        >
          <MessageSquare size={28} />
          <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-green text-[8px] font-black px-2 py-1 rounded-full animate-bounce">24/7</span>
        </a>
      </div>
    </BrowserRouter>
  );
}
