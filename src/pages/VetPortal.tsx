import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ShieldCheck, Stethoscope, FileText, 
  MapPin, Phone, Mail, ChevronRight, CheckCircle2,
  AlertCircle, LayoutDashboard, LogOut, Video,
  MessageSquare, Settings, Upload, Globe, Clock, 
  IndianRupee, Lock, Users, Zap, Award, BarChart3,
  Camera, Check, Smartphone
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const SPECIALIZATIONS = [
  "Pet Specialist (Dogs/Cats)",
  "Dairy Farm Specialist (Cattle/Buffalo)",
  "Poultry Expert",
  "Surgery Specialist",
  "Nutrition Expert",
  "Emergency & Critical Care",
  "Wild & Exotic Animals"
];

const QUALIFICATIONS = ["BVSc", "MVSc", "PhD", "Other (Certified)"];
const LANGUAGES = ["English", "Hindi", "Punjabi", "Bengali", "Marathi", "Tamil", "Telugu", "Other"];

export default function VetPortal() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    qualification: 'BVSc',
    experience: '',
    specialization: 'Pet Specialist (Dogs/Cats)',
    languages: [] as string[],
    charges: '',
    timings: '',
    whatsappNumber: '',
    videoEnabled: true,
    audioEnabled: true,
    degreeUploaded: false,
    photoUploaded: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (u) {
        setUser(u);
        const docRef = doc(db, 'users', u.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profile = docSnap.data();
            setUserProfile(profile);
            // Auto-fill basic info if signup
            if (profile.role === 'doctor') {
               setFormData(prev => ({
                 ...prev,
                 fullName: profile.fullName || profile.name || '',
                 email: profile.email || ''
               }));
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithSocial = async (providerName: 'google' | 'whatsapp') => {
    if (providerName === 'whatsapp') {
       alert("Redirecting to WhatsApp for secure authentication...");
       return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${result.user.uid}`);
      }

      if (userSnap && !userSnap.exists()) {
        try {
          await setDoc(userRef, {
            email: result.user.email,
            name: result.user.displayName,
            role: 'doctor',
            isVerified: false,
            registrationStep: 'pending',
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`);
        }
        setUserProfile({
          email: result.user.email,
          name: result.user.displayName,
          role: 'doctor',
          isVerified: false,
          registrationStep: 'pending'
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsRegistering(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const submissionData = {
        ...userProfile,
        ...formData,
        registrationStep: 'completed',
        updatedAt: serverTimestamp()
      };
      try {
        await setDoc(userRef, submissionData, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
      setUserProfile(submissionData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-cream">
      <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
    </div>
  );

  // DASHBOARD FOR VERIFIED DOCTORS
  if (user && userProfile?.role === 'doctor' && userProfile?.isVerified) {
    return (
      <div className="bg-bg-cream min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 px-4">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold">Verified Medical Portal</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-serif italic text-brand-green">Dr. {userProfile?.fullName?.split(' ')[0] || userProfile?.name?.split(' ')[0]}</h1>
            </div>
            <div className="flex gap-4">
              <button className="bg-brand-green text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl shadow-brand-green/10">
                <Video size={18} /> Enter Consultation Space
              </button>
              <button 
                onClick={() => auth.signOut()}
                className="bg-white border border-brand-green/10 text-brand-green/60 p-4 rounded-full hover:text-red-500 transition-colors shadow-sm"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {[
                     { label: 'Weekly Revenue', val: '₹14,250', icon: IndianRupee, color: 'text-green-600' },
                     { label: 'Patient Loyalty', val: '94%', icon: Award, color: 'text-brand-gold' },
                     { label: 'Growth', val: '+22%', icon: BarChart3, color: 'text-blue-500' },
                     { label: 'Avg Feedback', val: '4.85', icon: Zap, color: 'text-purple-500' },
                   ].map(stat => (
                     <div key={stat.label} className="bg-white p-10 rounded-[3rem] border border-brand-green/5 shadow-sm hover:shadow-xl transition-all">
                        <div className={`w-12 h-12 ${stat.color} bg-current/10 rounded-2xl flex items-center justify-center mb-6`}>
                           <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/30 mb-2">{stat.label}</p>
                        <p className="text-4xl font-serif italic text-brand-green">{stat.val}</p>
                     </div>
                   ))}
                </div>

                <div className="bg-white p-12 rounded-[4rem] border border-brand-green/5 shadow-sm">
                   <div className="flex justify-between items-center mb-10">
                      <h3 className="text-3xl font-serif italic text-brand-green">Clinical Queue</h3>
                      <div className="px-5 py-2 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-full">3 Live Requests</div>
                   </div>
                   <div className="space-y-6">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-8 p-8 bg-bg-sand rounded-[2.5rem] border border-brand-green/5 group hover:bg-white hover:shadow-xl transition-all">
                           <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-brand-green/10 group-hover:text-brand-green/30 transition-colors">
                              <User size={40} />
                           </div>
                           <div className="flex-1">
                              <p className="font-serif italic text-2xl text-brand-green">Patient #00{i+24}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green/40">Remote Consult • Video Confirmed</p>
                           </div>
                           <button className="px-10 py-4 bg-brand-green text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-brand-gold hover:text-brand-green transition-all shadow-lg">
                              Open Case
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                <div className="bg-brand-green text-white p-12 rounded-[4rem] relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-[100px]" />
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-10">Doctor Portfolio</h4>
                   <div className="flex items-center gap-6 mb-10">
                      <div className="w-24 h-24 rounded-3xl border-4 border-white/10 bg-white/5 flex items-center justify-center text-white/20">
                         <Stethoscope size={48} />
                      </div>
                      <div>
                         <p className="text-2xl font-serif italic leading-tight mb-1">{userProfile?.specialization || 'Consultant'}</p>
                         <p className="text-[10px] font-bold uppercase opacity-40">Licence: {userProfile?.licenseNumber || 'Verified Medical ID'}</p>
                      </div>
                   </div>
                   <div className="space-y-5 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex justify-between border-b border-white/10 pb-5">
                         <span className="opacity-40">Consultation Fee</span>
                         <span>₹{userProfile?.charges || '---'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-5">
                         <span className="opacity-40">Language Score</span>
                         <span>{userProfile?.languages?.length || '0'} Dialects</span>
                      </div>
                      <div className="flex justify-between pb-2">
                         <span className="opacity-40">Rating</span>
                         <span className="text-brand-gold">★★★★★</span>
                      </div>
                   </div>
                   <button className="w-full mt-10 py-5 bg-white text-brand-green font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-gold transition-all shadow-xl">
                      Update Professional Data
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Auth Pages (Split Screen) ---

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col lg:flex-row overflow-hidden pt-0 lg:pt-0 pb-0">
      {/* Left Column: Branding, Imagery & Stats */}
      <div className="hidden lg:flex w-[45%] h-screen sticky top-0 bg-brand-green overflow-hidden flex-col p-20 justify-between text-white">
          <div className="absolute inset-0 opacity-10">
             <img 
               src="https://images.unsplash.com/photo-1628154791552-28af1f0bc94e?auto=format&fit=crop&q=80" 
               alt="Background" 
               className="w-full h-full object-cover grayscale"
             />
             <div className="absolute inset-0 bg-gradient-to-br from-brand-green via-brand-green to-transparent" />
          </div>

          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-green shadow-xl">
                   <Stethoscope size={24} />
                </div>
                <h1 className="text-3xl font-serif italic">VetConnect <span className="text-brand-gold">Professional</span></h1>
             </div>

             <motion.h2 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-6xl font-serif italic mb-10 leading-[1.1]"
             >
                Empowering <br /> 
                <span className="text-brand-gold italic">Elite Veterinarians</span> <br /> 
                Across Borders.
             </motion.h2>

             <div className="space-y-8 max-w-md">
                {[
                  { title: "Pan-India Reach", desc: "Connect with farmers and pet owners from rural districts to metro cities.", icon: Globe },
                  { title: "Flexible Telemedicine", desc: "Consult via Video, Audio or WhatsApp on your schedule.", icon: Smartphone },
                  { title: "Assured Earnings", desc: "Secure monthly pay-outs with transparent consultation statistics.", icon: IndianRupee }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex gap-6 items-start"
                  >
                     <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex flex-shrink-0 items-center justify-center text-brand-gold">
                        <item.icon size={20} />
                     </div>
                     <div>
                        <h4 className="text-xl font-serif italic mb-1 text-white">{item.title}</h4>
                        <p className="text-white/40 text-xs leading-relaxed font-medium">{item.desc}</p>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>

          <div className="relative z-10 bg-white/5 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem]">
             <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                   <p className="text-3xl font-serif italic text-brand-gold mb-1">15k+</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Live Consults</p>
                </div>
                <div>
                   <p className="text-3xl font-serif italic text-brand-gold mb-1">500+</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Doctor Network</p>
                </div>
                <div>
                   <p className="text-3xl font-serif italic text-brand-gold mb-1">4.9/5</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/30">User Ratings</p>
                </div>
             </div>
          </div>
      </div>

      {/* Right Column: Auth Forms */}
      <div className="flex-1 min-h-screen overflow-y-auto px-6 py-20 lg:px-24 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {!user ? (
               // INITIAL LOGIN / SOCIAL AUTH
               <motion.div 
                 key="login-view"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="text-center lg:text-left"
               >
                 <div className="mb-12">
                   <h2 className="text-5xl lg:text-7xl font-serif italic text-brand-green transition-all leading-tight">
                      {authMode === 'login' ? 'Welcome Back, Doc' : 'Join the Elite Network'}
                   </h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-green/30 mt-4 px-4">
                      Veterinary Telemedicine Platform
                   </p>
                 </div>

                 <div className="space-y-6">
                    <button 
                      onClick={() => loginWithSocial('google')}
                      className="w-full bg-white border border-brand-green/10 text-brand-green py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:shadow-2xl transition-all group shadow-sm"
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Continue with Professional ID (Google)
                    </button>
                    <button 
                      onClick={() => loginWithSocial('whatsapp')}
                      className="w-full bg-[#E7F7EF] text-[#128C7E] py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:shadow-2xl transition-all group shadow-sm"
                    >
                      <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
                      Authenticate via WhatsApp Secure
                    </button>

                    <div className="relative py-8">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-green/10"></div></div>
                       <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-bg-cream px-8 text-brand-green/20">Authorized Access Only</span></div>
                    </div>

                    <div className="bg-white p-12 rounded-[4rem] border border-brand-green/5 shadow-2xl space-y-6">
                       <div className="space-y-4">
                          <div className="relative">
                             <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green/20" />
                             <input 
                               type="email" 
                               placeholder="Medical Email / Mobile"
                               className="w-full bg-bg-sand border-none rounded-2xl pl-16 pr-6 py-5 text-brand-green placeholder:text-brand-green/20 focus:ring-2 focus:ring-brand-gold outline-none font-medium"
                             />
                          </div>
                          <div className="relative">
                             <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green/20" />
                             <input 
                               type="password" 
                               placeholder="Secure Credentials"
                               className="w-full bg-bg-sand border-none rounded-2xl pl-16 pr-6 py-5 text-brand-green placeholder:text-brand-green/20 focus:ring-2 focus:ring-brand-gold outline-none font-medium"
                             />
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center px-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-4 h-4 rounded border-brand-green/10 text-brand-green focus:ring-brand-green" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">Remember Portal</span>
                          </label>
                          <button className="text-[10px] font-black uppercase tracking-widest text-brand-gold hover:underline">Forgot Credentials?</button>
                       </div>

                       <button className="w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl shadow-brand-green/20">
                          Secure Login
                       </button>
                    </div>

                    <p className="mt-10 text-brand-green text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {authMode === 'login' ? "New to the platform?" : "Already verified?"} 
                      <button 
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="ml-2 text-brand-gold hover:underline font-black"
                      >
                         {authMode === 'login' ? "Apply for Registration" : "Login to Portal"}
                      </button>
                    </p>
                 </div>
               </motion.div>
            ) : userProfile?.registrationStep !== 'completed' ? (
               // SIGNUP / REGISTRATION STEPS
               <motion.div 
                 key="register-view"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-brand-green/5"
               >
                 <div className="mb-12 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-full">
                       <ShieldCheck size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Medical Verification Pipeline</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-serif italic text-brand-green">Professional Credentials</h2>
                    <p className="text-brand-green/30 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">Register your Veterinary Practice</p>
                 </div>

                 <form onSubmit={handleRegister} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">Medical Full Name (Verified)</label>
                          <div className="relative">
                             <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green/10" />
                             <input 
                               required
                               type="text" 
                               value={formData.fullName}
                               onChange={e => setFormData({...formData, fullName: e.target.value})}
                               placeholder="Dr. Sanjay Kumar"
                               className="w-full bg-bg-sand border-none rounded-[1.5rem] pl-16 pr-6 py-5 text-brand-green focus:ring-2 focus:ring-brand-gold outline-none"
                             />
                          </div>
                       </div>

                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">Primary Qualification</label>
                          <select 
                             value={formData.qualification}
                             onChange={e => setFormData({...formData, qualification: e.target.value})}
                             className="w-full bg-bg-sand border-none rounded-[1.5rem] px-6 py-5 text-brand-green focus:ring-2 focus:ring-brand-gold outline-none appearance-none font-medium"
                          >
                             {QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}
                          </select>
                       </div>
                       
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">Experience (Years)</label>
                          <input 
                             required
                             type="number" 
                             value={formData.experience}
                             onChange={e => setFormData({...formData, experience: e.target.value})}
                             placeholder="e.g. 8"
                             className="w-full bg-bg-sand border-none rounded-[1.5rem] px-6 py-5 text-brand-green focus:ring-2 focus:ring-brand-gold outline-none"
                          />
                       </div>

                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">Core Specialization</label>
                          <select 
                             value={formData.specialization}
                             onChange={e => setFormData({...formData, specialization: e.target.value})}
                             className="w-full bg-bg-sand border-none rounded-[1.5rem] px-6 py-5 text-brand-green focus:ring-2 focus:ring-brand-gold outline-none appearance-none font-medium"
                          >
                             {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                          </select>
                       </div>

                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">Upload Documents (Medical ID & Degree)</label>
                          <div className="grid grid-cols-2 gap-4">
                             <div 
                               onClick={() => setFormData({...formData, degreeUploaded: true})}
                               className={`border-2 border-dashed rounded-[1.5rem] p-6 text-center cursor-pointer transition-all ${
                                 formData.degreeUploaded ? 'border-green-500 bg-green-50' : 'border-brand-green/10 hover:border-brand-gold'
                               }`}
                             >
                                {formData.degreeUploaded ? <Check className="mx-auto text-green-500" /> : <FileText className="mx-auto text-brand-green/20" />}
                                <p className="text-[9px] font-black uppercase tracking-widest mt-2">{formData.degreeUploaded ? 'Degree Verified' : 'Degree Certificate'}</p>
                             </div>
                             <div 
                               onClick={() => setFormData({...formData, photoUploaded: true})}
                               className={`border-2 border-dashed rounded-[1.5rem] p-6 text-center cursor-pointer transition-all ${
                                 formData.photoUploaded ? 'border-green-500 bg-green-50' : 'border-brand-green/10 hover:border-brand-gold'
                               }`}
                             >
                                {formData.photoUploaded ? <Check className="mx-auto text-green-500" /> : <Camera className="mx-auto text-brand-green/20" />}
                                <p className="text-[9px] font-black uppercase tracking-widest mt-2">{formData.photoUploaded ? 'Photo Uploaded' : 'Profile Photo'}</p>
                             </div>
                          </div>
                       </div>

                       <div className="md:col-span-2 flex flex-wrap gap-4 pt-4">
                          <div className="flex-1 min-w-[200px]">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">Base Fee (per Session)</label>
                             <div className="relative">
                                <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green/20" />
                                <input 
                                   type="text" 
                                   value={formData.charges}
                                   onChange={e => setFormData({...formData, charges: e.target.value})}
                                   placeholder="₹299"
                                   className="w-full bg-bg-sand border-none rounded-[1.5rem] pl-16 pr-6 py-5 text-brand-green focus:ring-2 focus:ring-brand-gold outline-none"
                                />
                             </div>
                          </div>
                          <div className="flex-1 min-w-[200px]">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">Available Timings</label>
                             <div className="relative">
                                <Clock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green/20" />
                                <input 
                                   type="text" 
                                   value={formData.timings}
                                   onChange={e => setFormData({...formData, timings: e.target.value})}
                                   placeholder="10:00 AM - 06:00 PM"
                                   className="w-full bg-bg-sand border-none rounded-[1.5rem] pl-16 pr-6 py-5 text-brand-green focus:ring-2 focus:ring-brand-gold outline-none"
                                />
                             </div>
                          </div>
                       </div>

                       <div className="md:col-span-2 space-y-4 pt-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-3 px-4">P2P Channel Availability</label>
                          <div className="flex gap-4">
                             <button 
                               type="button"
                               onClick={() => setFormData({...formData, videoEnabled: !formData.videoEnabled})}
                               className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                 formData.videoEnabled ? 'bg-brand-green text-white shadow-xl' : 'bg-bg-sand text-brand-green/30'
                               }`}
                             >
                                <Video size={16} /> Video Consults
                             </button>
                             <button 
                               type="button"
                               onClick={() => setFormData({...formData, audioEnabled: !formData.audioEnabled})}
                               className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                 formData.audioEnabled ? 'bg-brand-green text-white shadow-xl' : 'bg-bg-sand text-brand-green/30'
                               }`}
                             >
                                <Phone size={16} /> Audio Consults
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 pt-4">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <input required type="checkbox" className="w-5 h-5 rounded border-brand-green/10 text-brand-green focus:ring-brand-green" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green/40 leading-relaxed group-hover:text-brand-green transition-colors">
                           I agree to the Veterinary Service Standards and Data Privacy Policy
                        </span>
                      </label>

                      <button 
                        disabled={isRegistering}
                        className="w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-brand-gold hover:text-brand-green transition-all shadow-2xl disabled:opacity-50 mt-4"
                      >
                        {isRegistering ? (
                          <div className="flex items-center justify-center gap-4">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Encrypting Credentials...
                          </div>
                        ) : "Submit Medical Application"}
                      </button>
                    </div>
                 </form>
               </motion.div>
            ) : (
               // PENDING VERIFICATION VIEW
               <motion.div 
                 key="pending-view"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white p-12 lg:p-20 rounded-[5rem] border border-brand-gold/20 shadow-2xl text-center"
               >
                 <div className="w-24 h-24 bg-brand-gold/10 text-brand-gold rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-brand-gold/20 animate-pulse">
                   <ShieldCheck size={48} />
                 </div>
                 <h2 className="text-4xl lg:text-5xl font-serif italic text-brand-green mb-6">Verification Protocol</h2>
                 <p className="text-brand-green/60 text-sm leading-relaxed mb-12 max-w-sm mx-auto">
                   Thank you for applying, Dr. {userProfile?.fullName?.split(' ')[0] || userProfile?.name?.split(' ')[0]}. Our Medical Compliance Board is validating your credentials. Access granted within 24-48 hours.
                 </p>
                 
                 <div className="bg-bg-sand p-8 rounded-[2.5rem] text-left border border-brand-green/5 mb-12">
                   <div className="space-y-4">
                     {[
                       { label: "Profile Registration", status: "complete" },
                       { label: "Certificate Validation", status: "pending" },
                       { label: "ID Verification", status: "pending" }
                     ].map((step, i) => (
                       <div key={i} className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">{step.label}</span>
                          {step.status === 'complete' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
                          )}
                       </div>
                     ))}
                   </div>
                 </div>

                 <button 
                   onClick={() => auth.signOut()}
                   className="px-12 py-5 bg-brand-green text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl"
                 >
                   Secure Logout
                 </button>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

