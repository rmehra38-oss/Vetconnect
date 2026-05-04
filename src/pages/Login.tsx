import { motion } from 'motion/react';
import { Stethoscope, MessageSquare, ChevronRight, ShieldCheck } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', result.user.uid);
      let targetPath = from;
      
      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            name: result.user.displayName,
            role: 'user',
            createdAt: serverTimestamp()
          });
        } else {
          // If already a doctor, redirect to portal
          const userData = userSnap.data();
          if (userData.role === 'doctor') {
            targetPath = '/vet-portal';
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${result.user.uid}`);
      }
      
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const loginWithWhatsApp = () => {
    // Simulating a successful WhatsApp OTP / Auth flow for demo
    alert("WhatsApp Authentication Successful (Mocked)");
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-20 h-20 bg-brand-green text-brand-gold rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-6">
            <Stethoscope size={40} />
          </div>
          <h1 className="text-4xl font-serif italic text-brand-green mb-2">VetConnect</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Health in your Hands</p>
        </div>

        {/* Minimal Auth Card */}
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-brand-green/5 border border-brand-green/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl" />
          
          <h2 className="text-2xl font-serif italic text-brand-green mb-8 leading-tight">
            Consult a Doctor <br /> in Minutes.
          </h2>

          <div className="space-y-4">
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-white border border-brand-green/10 text-brand-green py-5 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:shadow-xl transition-all group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Continue with Google
            </button>

            <button 
              onClick={loginWithWhatsApp}
              className="w-full bg-brand-green text-white py-5 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl shadow-brand-green/20 group"
            >
              <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
              Continue with WhatsApp
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-brand-green/20">
            <ShieldCheck size={12} />
            <span>Secure Passwordless Access</span>
          </div>
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 space-y-4"
        >
          <p className="text-xs text-brand-green/40 px-8 leading-relaxed">
            By continuing, you agree to our <span className="text-brand-gold font-bold">Terms of Service</span> and <span className="text-brand-gold font-bold">Privacy Policy</span>.
          </p>
          
          <div className="flex items-center justify-center gap-8 pt-8 opacity-20">
             <div className="text-[10px] font-black uppercase tracking-widest">ISO Certified</div>
             <div className="text-[10px] font-black uppercase tracking-widest">256-bit AES</div>
             <div className="text-[10px] font-black uppercase tracking-widest">HiPAA Ready</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
