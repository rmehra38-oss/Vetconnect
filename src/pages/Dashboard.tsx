import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User, LayoutDashboard, Calendar, History, ShoppingBag, 
  Settings, Plus, ChevronRight, Activity, ShieldCheck, 
  Dog, Cat, Bird, Info, LogOut, Stethoscope
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { WHATSAPP_LINK } from '../constants';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('tab') || 'Overview';
  const setActiveView = (tab: string) => setSearchParams({ tab });

  const [userProfile, setUserProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [consults, setConsults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserProfile(userSnap.data());
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${auth.currentUser.uid}`);
      }

      try {
        const petsSnap = await getDocs(query(collection(db, 'pets'), where('ownerId', '==', auth.currentUser.uid)));
        setPets(petsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'pets');
      }

      try {
        const consultsSnap = await getDocs(query(collection(db, 'consultations'), where('userId', '==', auth.currentUser.uid)));
        setConsults(consultsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'consultations');
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
    </div>
  );

  if (!auth.currentUser) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-cream px-6 py-20">
      <div className="w-24 h-24 bg-brand-green text-brand-gold rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
        <User size={48} />
      </div>
      <h2 className="text-4xl font-serif italic text-brand-green mb-4">Secure Area</h2>
      <p className="text-brand-green/50 text-[10px] font-black uppercase tracking-[0.4em] mb-12 text-center max-w-sm">Please login to access your clinical database and medical registry.</p>
      <button 
        onClick={async () => {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
          window.location.reload();
        }}
        className="bg-brand-green text-white px-12 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl shadow-brand-green/20"
      >
        Sign in with Google
      </button>
    </div>
  );

  const sidebarItems = [
    { id: 'Overview', icon: LayoutDashboard, label: 'Central Hub' },
    { id: 'Pets', icon: Dog, label: 'My Specimens' },
    { id: 'Consultations', icon: Activity, label: 'Medical Records' },
    { id: 'Orders', icon: ShoppingBag, label: 'Order History' },
    { id: 'Insurance', icon: ShieldCheck, label: 'Health Plans' },
    { id: 'Settings', icon: Settings, label: 'Security' },
  ];

  return (
    <div className="bg-bg-cream min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-serif italic text-brand-green mb-2">Welcome Back, {userProfile?.name?.split(' ')[0] || 'Member'}</h1>
          <p className="text-brand-green/50 text-[10px] font-black uppercase tracking-[0.4em]">Managing health protocols for your animals</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-3">
            {userProfile?.role === 'doctor' && (
              <Link 
                to="/vet-portal"
                className="w-full mb-6 flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-gold text-brand-green shadow-xl shadow-brand-gold/20 hover:scale-105 transition-all"
              >
                <Stethoscope size={20} />
                Doctor Portal
              </Link>
            )}
            {sidebarItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === item.id ? 'bg-brand-green text-white shadow-2xl shadow-brand-green/20' : 'text-brand-green/40 hover:bg-white hover:text-brand-green'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <div className="pt-6 mt-6 border-t border-brand-green/5">
              <button 
                onClick={() => {
                  auth.signOut();
                  window.location.href = '/';
                }}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                Terminate Session
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow space-y-12">
            {activeView === 'Overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { 
                      id: 'Pets',
                      label: 'Registered Specimens', 
                      value: pets.length, 
                      icon: Dog, 
                      color: 'bg-brand-green',
                      trend: '+2 this month',
                      protocol: 'Database Active'
                    },
                    { 
                      id: 'Consultations',
                      label: 'Clinical Sessions', 
                      value: consults.length, 
                      icon: Calendar, 
                      color: 'bg-brand-gold',
                      trend: '3 pending review',
                      protocol: 'Clinical Active'
                    },
                    { 
                      id: 'Orders',
                      label: 'Credits Balance', 
                      value: '₹450', 
                      icon: ShoppingBag, 
                      color: 'bg-bg-sand',
                      trend: 'Reward points: 120',
                      protocol: 'Account Secure'
                    },
                  ].map(stat => (
                    <div 
                      key={stat.label} 
                      onClick={() => setActiveView(stat.id)}
                      className="bg-white p-8 rounded-[2.5rem] border border-brand-green/5 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-bg-sand/30 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700" />
                      <div className={`w-12 h-12 ${stat.color} ${stat.color === 'bg-bg-sand' ? 'text-brand-green' : 'text-white'} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform relative z-10`}>
                        <stat.icon size={24} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-brand-green/30 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-serif italic text-brand-green mb-4">{stat.value}</h3>
                        
                        <div className="flex flex-col gap-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">{stat.trend}</p>
                          <div className="flex items-center gap-2">
                             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-green/20">{stat.protocol}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pets Section - Preview */}
                <section>
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h2 className="text-3xl font-serif italic text-brand-green">My Specimens</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/30">Livestock & Pet Registry</p>
                    </div>
                    <button 
                      onClick={() => setActiveView('Pets')}
                      className="text-[10px] font-black uppercase tracking-widest text-brand-gold hover:text-brand-green transition-colors"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {pets.slice(0, 2).map(pet => (
                      <div key={pet.id} className="bg-white p-8 rounded-[3rem] border border-brand-green/5 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-bg-sand rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="w-20 h-20 bg-bg-sand rounded-3xl flex items-center justify-center text-brand-green/40 group-hover:bg-brand-gold group-hover:text-brand-green transition-colors">
                            {pet.species.toLowerCase() === 'dog' ? <Dog size={40} /> : pet.species.toLowerCase() === 'cat' ? <Cat size={40} /> : <Info size={40} />}
                          </div>
                          <div>
                            <h4 className="font-serif italic text-2xl text-brand-green">{pet.name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/30">{pet.species} • {pet.breed}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pets.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-bg-cream rounded-[3rem] border-2 border-dashed border-brand-green/10">
                        <p className="text-brand-green/30 font-black uppercase tracking-widest">No Specimens found</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeView === 'Pets' && (
              <section className="space-y-10">
                <div className="flex justify-between items-end border-b border-brand-green/5 pb-8">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-serif italic text-brand-green">Specimen Database</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-green/30">Active medical registry</p>
                  </div>
                  <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-brand-gold text-brand-green px-8 py-3 rounded-full hover:bg-brand-green hover:text-white transition-all shadow-xl shadow-brand-gold/10">
                    <Plus size={18} /> Register New
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {pets.length > 0 ? pets.map(pet => (
                    <motion.div 
                      key={pet.id} 
                      whileHover={{ y: -10 }}
                      className="bg-white p-10 rounded-[3.5rem] border border-brand-green/5 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-bg-sand rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
                      <div className="relative z-10">
                        <div className="w-24 h-24 bg-bg-sand rounded-[2rem] flex items-center justify-center text-brand-green/30 group-hover:bg-brand-gold group-hover:text-brand-green transition-all shadow-xl shadow-black/5 mb-8">
                          {pet.species.toLowerCase() === 'dog' ? <Dog size={48} /> : pet.species.toLowerCase() === 'cat' ? <Cat size={48} /> : <Info size={48} />}
                        </div>
                        <h4 className="font-serif italic text-3xl text-brand-green mb-2">{pet.name}</h4>
                        <div className="flex items-center gap-3 mb-8">
                          <span className="px-3 py-1 bg-brand-green/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-green/60">
                            {pet.species}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-green/20">•</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">{pet.breed}</span>
                        </div>
                        
                        <div className="space-y-4 pt-6 border-t border-brand-green/5">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-green/30">
                            <span>Age Indicator</span>
                            <span className="text-brand-green">{pet.age || 'N/A'} Years</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-green/30">
                            <span>Status</span>
                            <span className="text-green-500">Verified Health</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 mt-8">
                          <Link 
                            to={`/consult?pet=${pet.species}&name=${pet.name}`}
                            className="flex-1 py-4 bg-bg-sand text-brand-green rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-brand-green hover:text-white transition-all text-center flex items-center justify-center whitespace-nowrap"
                          >
                            Analytics
                          </Link>
                          <a 
                            href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hi, I need assistance for my ${pet.species} named ${pet.name}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:opacity-90 transition-all text-center flex items-center justify-center whitespace-nowrap"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-[4rem] border-4 border-dashed border-brand-green/10">
                      <div className="w-20 h-20 bg-bg-sand rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green/20">
                         <Dog size={32} />
                      </div>
                      <p className="text-brand-green/30 font-black uppercase tracking-[0.5em] mb-6">Database clear. No specimens found.</p>
                      <button className="text-brand-green font-serif italic text-3xl hover:text-brand-gold transition-colors">Start your registry</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeView === 'Consultations' && (
              <section>
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-serif italic text-brand-green">Clinical Timeline</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/30">Medical session history</p>
                  </div>
                </div>
                <div className="bg-white rounded-[3rem] border border-brand-green/5 shadow-sm overflow-hidden">
                  {consults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-bg-sand text-brand-green/30 text-[10px] font-black uppercase tracking-widest">
                          <tr>
                            <th className="px-10 py-6">Timeline Date</th>
                            <th className="px-10 py-6">Consult Type</th>
                            <th className="px-10 py-6">Status Protocol</th>
                            <th className="px-10 py-6">Resources</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold uppercase tracking-widest text-brand-green">
                          {consults.map(c => (
                            <tr key={c.id} className="border-t border-brand-green/5 hover:bg-bg-sand/30 transition-colors">
                              <td className="px-10 py-6 font-serif italic text-lg opacity-60">
                                {new Date(c.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                              </td>
                              <td className="px-10 py-6 opacity-60">{c.type}</td>
                              <td className="px-10 py-6">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  c.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-brand-gold/10 text-brand-gold'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-10 py-6">
                                <button className="flex items-center gap-2 text-brand-green hover:text-brand-gold transition-colors">
                                  <Info size={14} /> Report
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-20 text-center text-brand-green/30 font-black uppercase tracking-[0.5em]">
                      Timeline Clear.
                    </div>
                  )}
                </div>
              </section>
            )}
            
            {/* Simple placeholders for other views */}
            {['Orders', 'Insurance', 'Settings'].includes(activeView) && (
              <section className="bg-white p-20 rounded-[4rem] text-center border border-brand-green/5">
                <h3 className="font-serif italic text-3xl text-brand-green mb-4">{activeView} Protocol</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/30">System module currently initializing</p>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

