import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Phone, Video, AlertCircle, Sparkles, 
  ChevronRight, CheckCircle2, Dog, Cat, Bird, 
  ShoppingBag, Calendar, ArrowLeft, CreditCard, Plus
} from 'lucide-react';
import { getSymptomAnalysis } from '../services/geminiService';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { WHATSAPP_LINK } from '../constants';
import Markdown from 'react-markdown';

const SERVICES = [
  { id: 'whatsapp', icon: MessageSquare, title: "WhatsApp Chat", price: "₹99", color: "bg-green-50 text-green-600", desc: "Text, photo & video messages via WhatsApp Business API" },
  { id: 'audio', icon: Phone, title: "Audio Call", price: "₹199", color: "bg-blue-50 text-blue-600", desc: "Scheduled or instant voice call with our top veterinarians" },
  { id: 'video', icon: Video, title: "Video Call", price: "₹299", color: "bg-purple-50 text-purple-600", desc: "Live visual examination and report analysis with screen sharing" },
  { id: 'emergency', icon: AlertCircle, title: "Emergency", price: "₹999", color: "bg-red-50 text-red-600", desc: "Priority 24/7 access with response time under 10 minutes" },
];

export default function Consult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  
  // Selection State
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [customPet, setCustomPet] = useState(searchParams.get('pet') || '');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // New Pet Registration State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: ''
  });

  const fetchPets = async () => {
    if (!auth.currentUser) {
      setLoadingPets(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'pets'),
        where('ownerId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const petsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setPets(petsList);
      
      // Auto-select if directed from dashboard
      const petName = searchParams.get('name');
      if (petName) {
        const found = petsList.find(p => p.name === petName);
        if (found) setSelectedPet(found);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [searchParams]);

  const handleRegisterPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newPet.name) return;
    
    setIsRegistering(true);
    try {
      const docRef = await addDoc(collection(db, 'pets'), {
        ...newPet,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      const createdPet = { id: docRef.id, ...newPet };
      setPets(prev => [createdPet, ...prev]);
      setSelectedPet(createdPet);
      setShowRegisterModal(false);
      setNewPet({ name: '', species: 'Dog', breed: '', age: '' });
    } catch (error) {
      console.error("Error adding pet:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAnalyze = async () => {
    const petInfo = selectedPet ? `${selectedPet.species} (${selectedPet.name})` : customPet;
    if (!symptoms || !petInfo) return;
    setIsAnalyzing(true);
    const result = await getSymptomAnalysis(symptoms, petInfo);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const currentService = SERVICES.find(s => s.id === selectedService);
  const petDisplayName = selectedPet ? selectedPet.name : (customPet || 'General Patient');

  const handlePayment = async () => {
    setIsBooking(true);
    // Simulate payment gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsBooking(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-bg-cream min-h-screen pt-32 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[4rem] p-12 text-center shadow-2xl border border-brand-green/5"
        >
          <div className="w-24 h-24 bg-brand-gold text-brand-green rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-brand-gold/20">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-serif italic text-brand-green mb-4">Booking Confirmed</h2>
          <p className="text-brand-green/50 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Session Reference: #VET-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          
          <div className="bg-bg-sand p-8 rounded-3xl mb-10 text-left">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-brand-green text-white rounded-xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">Appointment</p>
                 <p className="text-sm font-bold text-brand-green">Instant Connection Ready</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const message = `Hi, I booked a ${currentService?.title} for ${petDisplayName}. My symptoms are: ${symptoms}`;
                window.open(`${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <MessageSquare size={16} /> Start Session on WhatsApp
            </button>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl"
          >
            Go to Hub
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-bg-cream min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-brand-green/5 -translate-y-1/2 z-0" />
          {[1, 2, 3, 4].map(num => (
            <div 
              key={num}
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] transition-all duration-500 ${
                step === num ? 'bg-brand-gold text-brand-green scale-125 shadow-lg shadow-brand-gold/20' : 
                step > num ? 'bg-brand-green text-white border-none' : 'bg-white text-brand-green/20 border border-brand-green/10'
              }`}
            >
              {step > num ? <CheckCircle2 size={16} /> : num}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl font-serif italic text-brand-green mb-4">Select Patient</h1>
                <p className="text-brand-green/50 text-[10px] font-black uppercase tracking-[0.3em]">Choose a registered specimen or enter details</p>
              </div>

              {loadingPets ? (
                <div className="flex justify-center p-20">
                   <div className="w-12 h-12 border-4 border-brand-green/5 border-t-brand-gold rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                   {pets.map(pet => (
                      <div 
                        key={pet.id}
                        onClick={() => setSelectedPet(pet)}
                        className={`p-8 bg-white rounded-[2.5rem] border transition-all cursor-pointer group flex items-center gap-6 ${
                          selectedPet?.id === pet.id ? 'border-brand-green shadow-xl ring-4 ring-brand-green/5' : 'border-brand-green/5 hover:border-brand-green/10 shadow-sm'
                        }`}
                      >
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                           selectedPet?.id === pet.id ? 'bg-brand-gold text-brand-green' : 'bg-bg-sand text-brand-green group-hover:bg-brand-gold/20'
                         }`}>
                            {pet.species?.toLowerCase() === 'dog' ? <Dog size={32} /> : 
                             pet.species?.toLowerCase() === 'cat' ? <Cat size={32} /> : <Bird size={32} />}
                         </div>
                         <div>
                            <p className="text-xl font-serif italic text-brand-green">{pet.name}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green/30">{pet.breed || pet.species}</p>
                         </div>
                      </div>
                   ))}

                   <div 
                    onClick={() => setShowRegisterModal(true)}
                    className="p-8 bg-white/50 border border-brand-green/20 border-dashed rounded-[2.5rem] transition-all cursor-pointer group flex items-center gap-6 hover:border-brand-green hover:bg-white"
                   >
                      <div className="w-16 h-16 rounded-2xl bg-white border border-brand-green/5 flex items-center justify-center text-brand-green/40 group-hover:text-brand-green">
                         <Plus size={32} />
                      </div>
                      <div>
                        <p className="text-xl font-serif italic text-brand-green/40 group-hover:text-brand-green">Register New Specimen</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green/20">Add to Clinical Profile</p>
                      </div>
                   </div>
                </div>
              )}

              <div className="flex justify-center">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!selectedPet}
                  className="px-12 py-5 bg-brand-green text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl disabled:opacity-50 flex items-center gap-4"
                >
                  Continue to Symptoms <ChevronRight size={16} />
                </button>
              </div>

              {/* Registration Modal */}
              <AnimatePresence>
                {showRegisterModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowRegisterModal(false)}
                      className="absolute inset-0 bg-brand-green/60 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white/20"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif italic text-brand-green mb-2">New Specimen Profile</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/30">Registration for Clinical History</p>
                      </div>

                      <form onSubmit={handleRegisterPet} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-2 px-4">Specimen Name</label>
                             <input 
                              required
                              type="text" 
                              value={newPet.name}
                              onChange={e => setNewPet({...newPet, name: e.target.value})}
                              placeholder="e.g. Leo, Max"
                              className="w-full bg-bg-sand border-none rounded-2xl px-6 py-4 text-brand-green placeholder:text-brand-green/20 focus:ring-2 focus:ring-brand-gold outline-none font-medium"
                             />
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-2 px-4">Species</label>
                             <select 
                              value={newPet.species}
                              onChange={e => setNewPet({...newPet, species: e.target.value})}
                              className="w-full bg-bg-sand border-none rounded-2xl px-6 py-4 text-brand-green focus:ring-2 focus:ring-brand-gold outline-none font-medium appearance-none"
                             >
                               <option>Dog</option>
                               <option>Cat</option>
                               <option>Bird</option>
                               <option>Cattle</option>
                               <option>Horse</option>
                               <option>Other</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-2 px-4">Age (Years)</label>
                             <input 
                              type="text" 
                              value={newPet.age}
                              onChange={e => setNewPet({...newPet, age: e.target.value})}
                              placeholder="e.g. 3"
                              className="w-full bg-bg-sand border-none rounded-2xl px-6 py-4 text-brand-green placeholder:text-brand-green/20 focus:ring-2 focus:ring-brand-gold outline-none font-medium"
                             />
                          </div>
                          <div className="col-span-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 block mb-2 px-4">Breed/Variety</label>
                             <input 
                              type="text" 
                              value={newPet.breed}
                              onChange={e => setNewPet({...newPet, breed: e.target.value})}
                              placeholder="e.g. German Shepherd"
                              className="w-full bg-bg-sand border-none rounded-2xl px-6 py-4 text-brand-green placeholder:text-brand-green/20 focus:ring-2 focus:ring-brand-gold outline-none font-medium"
                             />
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button 
                            type="button"
                            onClick={() => setShowRegisterModal(false)}
                            className="flex-1 py-4 bg-bg-sand text-brand-green font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-green/5 transition-colors"
                           >
                              Cancel
                           </button>
                           <button 
                            type="submit"
                            disabled={isRegistering}
                            className="flex-[2] py-4 bg-brand-green text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl flex items-center justify-center gap-2"
                           >
                              {isRegistering ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Registering...
                                </>
                              ) : "Save specimen"}
                           </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
               <div className="bg-brand-green text-white p-12 lg:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-12">
                      <button onClick={() => setStep(1)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <ArrowLeft size={20} />
                      </button>
                      <h2 className="text-4xl font-serif italic text-brand-gold">Clinical Symptoms</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-3">Patient Profile</label>
                          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-brand-gold font-serif italic text-xl">
                            {petDisplayName}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-3">Describe Condition</label>
                          <textarea 
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            rows={6}
                            placeholder="Detail out the behavioral or physical changes..."
                            className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-white placeholder-white/20 focus:outline-none focus:border-brand-gold transition-colors font-medium text-sm leading-relaxed resize-none"
                          />
                        </div>
                        <button 
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !symptoms}
                          className="w-full py-5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-brand-gold hover:text-brand-green transition-all disabled:opacity-50"
                        >
                          {isAnalyzing ? "Processing Matrix..." : "AI System Check"}
                          <Sparkles size={16} />
                        </button>
                      </div>

                      <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 border border-white/10 flex flex-col">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">AI Diagnostics Output</p>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-xs leading-relaxed text-white/80">
                           {analysis ? (
                             <div className="markdown-body">
                                <style dangerouslySetInnerHTML={{ __html: `.markdown-body h3 { color: #FFB703; font-family: serif; font-size: 1rem; margin-bottom: 0.5rem; }` }} />
                                <Markdown>{analysis}</Markdown>
                             </div>
                           ) : (
                             <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                <AlertCircle size={48} className="mb-4" />
                                <p>Run System Check to view insights</p>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                       <button 
                        onClick={() => setStep(3)}
                        disabled={!symptoms}
                        className="px-16 py-6 bg-white text-brand-green font-black uppercase tracking-[0.3em] text-xs rounded-full hover:bg-brand-gold transition-all shadow-2xl disabled:opacity-50"
                       >
                         Next: Select Channel
                       </button>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
               <div className="text-center mb-16">
                  <h2 className="text-5xl font-serif italic text-brand-green mb-4">Choose Channel</h2>
                  <p className="text-brand-green/50 text-[10px] font-black uppercase tracking-[0.3em]">Select your preferred clinical access method</p>
               </div>

               <div className="grid md:grid-cols-2 gap-8 mb-16">
                  {SERVICES.map(service => (
                    <div 
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-10 bg-white rounded-[3rem] border transition-all cursor-pointer group relative ${
                        selectedService === service.id ? 'border-brand-green shadow-2xl ring-4 ring-brand-green/5' : 'border-brand-green/5 shadow-sm hover:shadow-xl hover:border-brand-green/10'
                      }`}
                    >
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 ${service.color}`}>
                          <service.icon size={32} />
                       </div>
                       <h3 className="text-2xl font-serif italic text-brand-green mb-3">{service.title}</h3>
                       <p className="text-xs font-medium text-brand-green/50 leading-relaxed max-w-[240px] mb-8">{service.desc}</p>
                       <div className="flex justify-between items-center">
                          <span className="text-3xl font-serif italic text-brand-green">{service.price}</span>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedService === service.id ? 'bg-brand-gold border-brand-gold text-brand-green' : 'border-brand-green/10 text-transparent'
                          }`}>
                             <CheckCircle2 size={16} />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="flex justify-between max-w-sm mx-auto">
                  <button onClick={() => setStep(2)} className="px-10 py-5 text-brand-green/40 font-black uppercase tracking-[0.2em] text-[10px] hover:text-brand-green transition-colors">
                     Back
                  </button>
                  <button 
                    onClick={() => setStep(4)}
                    disabled={!selectedService}
                    className="px-12 py-5 bg-brand-green text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl disabled:opacity-50"
                  >
                     Review Booking
                  </button>
               </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div 
               key="step4"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
             >
                <div className="max-w-xl mx-auto">
                   <div className="text-center mb-12">
                      <h2 className="text-5xl font-serif italic text-brand-green mb-4">Confirmation</h2>
                      <p className="text-brand-green/50 text-[10px] font-black uppercase tracking-[0.3em]">Final secure review before session initialization</p>
                   </div>

                   <div className="bg-white rounded-[4rem] p-12 shadow-2xl border border-brand-green/5">
                      <div className="space-y-8 mb-12">
                         <div className="flex justify-between items-center">
                            <span className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest">Patient Name</span>
                            <span className="text-brand-green font-serif italic text-xl">{petDisplayName}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest">Clinical Channel</span>
                            <span className="text-brand-green font-bold text-xs uppercase tracking-widest">{currentService?.title}</span>
                         </div>
                         <div className="bg-bg-sand/30 p-6 rounded-2xl border border-brand-green/5">
                            <p className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest mb-3">Presenting Condition</p>
                            <p className="text-xs font-medium text-brand-green/70 italic line-clamp-2">"{symptoms}"</p>
                         </div>
                         <div className="border-t border-brand-green/5 pt-8">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest">Consultation Fee</span>
                               <span className="text-brand-green font-serif italic text-2xl">{currentService?.price}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest">Tax (18% GST)</span>
                               <span className="text-brand-green font-serif italic text-sm">Included</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <button 
                          onClick={handlePayment}
                          disabled={isBooking}
                          className="w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl flex items-center justify-center gap-3"
                        >
                          {isBooking ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Securing...
                            </>
                          ) : (
                            <>
                              Proceed to Pay {currentService?.price}
                              <CreditCard size={18} />
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => setStep(3)}
                          className="w-full py-4 text-brand-green/40 font-black uppercase tracking-[0.2em] text-[10px] hover:text-brand-green transition-colors"
                        >
                          Modify Details
                        </button>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

