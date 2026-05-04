import { motion } from 'motion/react';
import { Shield, Users, Leaf, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-bg-cream min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] uppercase font-black tracking-[0.5em] text-brand-gold mb-4 block"
          >
            Since 2024
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl lg:text-8xl font-serif italic text-brand-green mb-8"
          >
            Our Mission is <br/> Every <span className="text-brand-gold not-italic font-sans font-black">LIFE.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-green/60 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            We are building India's most trusted digital ecosystem for animal health, connecting millions of farmers and pet owners with expert veterinary care at the click of a button.
          </motion.p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {[
            { icon: Shield, title: 'Safe & Secure', desc: 'Encrypted consultations and verified pharmaceutical products.' },
            { icon: Users, title: 'Farmer First', desc: 'Built by understanding the unique challenges of rural livestock management.' },
            { icon: Leaf, title: 'Sustainable', desc: 'Promoting organic feed and healthy growth practices for dairy and poultry.' },
            { icon: Heart, title: 'Compassionate', desc: 'Because every animal deserves the highest standard of medical attention.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white p-10 rounded-[3rem] border border-brand-green/5 shadow-sm hover:shadow-2xl transition-all group"
            >
              <div className="w-16 h-16 bg-bg-sand rounded-2xl flex items-center justify-center text-brand-green mb-8 group-hover:bg-brand-gold transition-colors">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-serif italic text-brand-green mb-4">{item.title}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-green/30 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Farmer Hub Specifics */}
        <div className="bg-brand-green rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[10px] uppercase font-black tracking-[0.5em] text-brand-gold mb-4 block">The Farmer Hub</span>
              <h2 className="text-5xl font-serif italic mb-8">Specialized Rural Ecosystem</h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10">
                Farmers face unique challenges. Our platform provides multilingual audio support, low-bandwidth video calls, and a supply chain that reaches the last mile of rural India.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="border-l-2 border-brand-gold pl-6">
                  <p className="text-3xl font-serif italic">100k+</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Registered Farmers</p>
                </div>
                <div className="border-l-2 border-brand-gold pl-6">
                  <p className="text-3xl font-serif italic">24/7</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Livestock Experts</p>
                </div>
              </div>
            </div>
            <div className="rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
                alt="Farmer working with livestock" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
