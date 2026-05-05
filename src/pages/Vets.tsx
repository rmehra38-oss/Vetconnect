import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Star, Clock, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const VETERINARIANS = [
  {
    id: 1,
    name: "Dr. Ananya Sharma",
    specialization: "Small Animal Specialist",
    experience: "12 years",
    rating: 4.9,
    reviews: 1240,
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400",
    tags: ["Dogs", "Cats", "Surgery"],
    languages: ["English", "Hindi", "Marathi"]
  },
  {
    id: 2,
    name: "Dr. Rajesh Kumar",
    specialization: "Livestock & Dairy Expert",
    experience: "15 years",
    rating: 4.8,
    reviews: 890,
    availability: "In 30 mins",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    tags: ["Cattle", "Buffalo", "Nutrition"],
    languages: ["Hindi", "Punjabi", "English"]
  },
  {
    id: 3,
    name: "Dr. Sarah D'Souza",
    specialization: "Avian & Exotic Excellence",
    experience: "8 years",
    rating: 4.9,
    reviews: 450,
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
    tags: ["Birds", "Reptiles", "Exotics"],
    languages: ["English", "Hindi", "Konkani"]
  },
  {
    id: 4,
    name: "Dr. Vikram Singh",
    specialization: "Poultry Health Specialist",
    experience: "10 years",
    rating: 4.7,
    reviews: 670,
    availability: "Tomorrow",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    tags: ["Poultry", "Avian Flu", "Farm"],
    languages: ["Hindi", "English", "Punjabi"]
  },
  {
    id: 5,
    name: "Dr. Meera Iyer",
    specialization: "Veterinary Dermatologist",
    experience: "7 years",
    rating: 4.9,
    reviews: 320,
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
    tags: ["Skin", "Allergy", "Dogs"],
    languages: ["English", "Tamil", "Hindi"]
  },
  {
    id: 6,
    name: "Dr. Amit Patel",
    specialization: "Behavioral Consultant",
    experience: "9 years",
    rating: 4.8,
    reviews: 510,
    availability: "In 1 hour",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    tags: ["Behavior", "Training", "Anxiety"],
    languages: ["Gujarati", "Hindi", "English"]
  }
];

const SPECIALIZATIONS = [
  "All",
  "Small Animal Specialist",
  "Livestock & Dairy Expert",
  "Avian & Exotic Excellence",
  "Poultry Health Specialist",
  "Veterinary Dermatologist",
  "Behavioral Consultant"
];

const AVAILABILITY_OPTIONS = ["All", "Available Now", "Today", "Tomorrow"];
const RATING_OPTIONS = ["All", "4.5+", "4.0+", "3.5+"];
const LANGUAGES = ["All", "English", "Hindi", "Punjabi", "Marathi", "Tamil", "Gujarati"];

export default function Vets() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [availFilter, setAvailFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [langFilter, setLangFilter] = useState("All");

  const filteredVets = VETERINARIANS.filter(vet => {
    const matchesSearch = vet.name.toLowerCase().includes(search.toLowerCase()) || 
                         vet.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "All" || vet.specialization === filter;
    
    const matchesAvail = availFilter === "All" || 
                        (availFilter === "Available Now" && vet.availability === "Available Now") ||
                        (availFilter === "Today" && (vet.availability === "Available Now" || vet.availability.includes("mins") || vet.availability.includes("hour"))) ||
                        (availFilter === "Tomorrow" && vet.availability === "Tomorrow");
    
    const minRating = ratingFilter === "All" ? 0 : parseFloat(ratingFilter.replace('+', ''));
    const matchesRating = vet.rating >= minRating;

    const matchesLang = langFilter === "All" || vet.languages.includes(langFilter);

    return matchesSearch && matchesFilter && matchesAvail && matchesRating && matchesLang;
  });

  return (
    <div className="flex-1 bg-bg-cream">
      {/* Header */}
      <section className="pt-24 pb-12 px-6 lg:px-20 bg-white border-b border-brand-green/5">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold mb-4">Expert Network</h2>
              <h1 className="text-5xl lg:text-7xl font-serif italic text-brand-green leading-tight">Find Your <br /> Expert Personal Vet.</h1>
            </div>
            
            <div className="flex flex-col gap-6 w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 sm:w-80">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/30" />
                  <input 
                    type="text" 
                    placeholder="Search by name, pet type, or issue..."
                    className="w-full pl-12 pr-6 py-4 bg-bg-sand border border-brand-green/10 rounded-2xl focus:outline-none focus:border-brand-green text-brand-green font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/30 pointer-events-none" />
                  <select 
                    className="appearance-none w-full pl-12 pr-10 py-4 bg-white border border-brand-green/10 rounded-2xl focus:outline-none focus:border-brand-green text-brand-green font-bold uppercase tracking-widest text-[10px]"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 px-2">Availability</label>
                  <select 
                    className="bg-bg-sand/50 border border-brand-green/5 rounded-xl px-4 py-2.5 text-[10px] font-bold text-brand-green outline-none focus:border-brand-green/20"
                    value={availFilter}
                    onChange={(e) => setAvailFilter(e.target.value)}
                  >
                    {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[100px]">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 px-2">Rating</label>
                  <select 
                    className="bg-bg-sand/50 border border-brand-green/5 rounded-xl px-4 py-2.5 text-[10px] font-bold text-brand-green outline-none focus:border-brand-green/20"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    {RATING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 px-2">Language</label>
                  <select 
                    className="bg-bg-sand/50 border border-brand-green/5 rounded-xl px-4 py-2.5 text-[10px] font-bold text-brand-green outline-none focus:border-brand-green/20"
                    value={langFilter}
                    onChange={(e) => setLangFilter(e.target.value)}
                  >
                    {LANGUAGES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vet Grid */}
      <section className="py-20 px-6 lg:px-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVets.map((vet, i) => (
              <motion.div
                key={vet.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[3rem] border border-brand-green/5 shadow-sm hover:shadow-2xl hover:border-brand-green/10 transition-all group overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={vet.image} 
                    alt={vet.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                    <Star size={12} className="text-brand-gold fill-brand-gold" />
                    <span className="text-[10px] font-black text-brand-green">{vet.rating} <span className="opacity-40 italic">({vet.reviews})</span></span>
                  </div>
                  {vet.availability === "Available Now" && (
                    <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-brand-green text-white px-3 py-1.5 rounded-full shadow-lg">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{vet.availability}</span>
                    </div>
                  )}
                </div>

                <div className="p-8 lg:p-10 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-serif italic text-brand-green">{vet.name}</h3>
                    <Award size={20} className="text-brand-gold" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6">{vet.specialization}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {vet.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-bg-sand rounded-full text-brand-green/50">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 border-t border-brand-green/5 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-brand-green font-serif italic text-xl">{vet.experience}</span>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-brand-green/30">Experience</span>
                    </div>
                    <Link 
                      to={`/consult?vetId=${vet.id}`}
                      className="px-8 py-4 bg-brand-green text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-green transition-all shadow-xl shadow-brand-green/10"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredVets.length === 0 && (
            <div className="py-32 text-center">
              <ShieldCheck size={48} className="text-brand-green/10 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-brand-green mb-4">No experts found matching your criteria.</h3>
              <button 
                onClick={() => {
                  setSearch(""); 
                  setFilter("All");
                  setAvailFilter("All");
                  setRatingFilter("All");
                  setLangFilter("All");
                }}
                className="text-brand-gold font-bold uppercase tracking-widest text-[10px]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
