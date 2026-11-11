"use client";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

type Polaroid = { id: string; url: string; date: string; context: string; timestamp: string; secretNote?: string; };
type InteractiveCard = { id: string; url: string; question: string; options: string[]; correctOption: number; date: string; context: string; timestamp: string; secretNote?: string; };

type FeedItem = 
  | { type: 'SIMPLE'; data: Polaroid; timestamp: number }
  | { type: 'QUIZ'; data: InteractiveCard; timestamp: number };

const isVideo = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

const getCandidateUrls = (rawUrl: string): string[] => {
  if (!rawUrl) return [];
  let clean = rawUrl.trim();
  try { clean = decodeURIComponent(clean); } catch {}
  if (!clean.startsWith('/') && !clean.startsWith('http')) clean = '/' + clean;

  const nfc = clean.normalize('NFC');
  const nfd = clean.normalize('NFD');
  const enFile = nfc.replace(/Αρχείο|αρχείο/gi, 'file');

  const baseCandidates = Array.from(new Set([enFile, nfc, nfd, clean]));
  const allCandidates: string[] = [];

  for (const base of baseCandidates) {
    allCandidates.push(base);
    const withoutExt = base.replace(/\.(jpg|jpeg|png|heic)$/i, '');
    if (withoutExt !== base) {
      allCandidates.push(`${withoutExt}.jpg`);
      allCandidates.push(`${withoutExt}.jpeg`);
      allCandidates.push(`${withoutExt}.JPG`);
      allCandidates.push(`${withoutExt}.JPEG`);
    }
  }
  return Array.from(new Set(allCandidates));
};

const MediaRenderer = ({ url }: { url: string }) => {
  const candidates = getCandidateUrls(url);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [url]);

  const currentSrc = candidates[attempt] || url;

  if (isVideo(currentSrc)) {
    return (
      <video
        key={currentSrc}
        src={currentSrc}
        controls
        playsInline
        onError={() => {
          if (attempt < candidates.length - 1) setAttempt(a => a + 1);
        }}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt="Μνήμη"
      onError={() => {
        if (attempt < candidates.length - 1) setAttempt(a => a + 1);
      }}
      className="w-full h-full object-cover"
    />
  );
};

const SCATTER_CLASSES = [
  "-rotate-2 -translate-x-1 md:-rotate-3 md:-translate-x-12",
  "rotate-2 translate-x-1 md:rotate-6 md:translate-x-16",
  "-rotate-2 -translate-x-1 md:-rotate-6 md:-translate-x-20",
  "rotate-2 translate-x-1 md:rotate-4 md:translate-x-12",
  "-rotate-1 translate-x-0 md:-rotate-2 md:-translate-x-4",
];

const NotebookNote = ({ text, isLeft }: { text: string, isLeft: boolean }) => {
  const rotClass = isLeft ? "rotate-2" : "-rotate-3";
    
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, type: "spring", bounce: 0.5 }}
      viewport={{ once: true, margin: "50px" }}
      className={`relative z-20 mt-4 md:mt-8 w-[92%] max-w-[280px] md:max-w-none md:w-80 shadow-xl ${rotClass} mx-auto md:mx-0`}
      style={{
        backgroundColor: "#fdf6e3",
        boxShadow: "2px 8px 20px rgba(0,0,0,0.15), inset 0 0 40px rgba(139,69,19,0.12), inset 0 0 10px rgba(139,69,19,0.08)",
        backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(100, 150, 200, 0.25) 31px, rgba(100, 150, 200, 0.25) 32px)",
        backgroundSize: "100% 32px",
        borderRadius: "3px 15px 5px 25px / 25px 5px 15px 3px",
        paddingTop: "32px", 
        paddingBottom: "32px",
        minHeight: "130px"
      }}
    >
      <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[2px] bg-red-800 opacity-15"></div>
      
      <div 
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-14 h-7 bg-white/20 backdrop-blur-sm border border-black/5 shadow-sm" 
        style={{ 
          clipPath: "polygon(3% 12%, 96% 2%, 98% 90%, 5% 96%)",
          rotate: isLeft ? "-5deg" : "4deg"
        }}
      ></div>
      
      <div className="pl-10 md:pl-12 pr-4 calligraphy text-2xl md:text-4xl text-[#3e2723]" style={{ lineHeight: "32px" }}>
        {text}
      </div>
    </motion.div>
  );
};

const FancyBloomingRose = ({ className }: { className?: string }) => (
  <motion.svg className={className} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 8px rgba(225, 29, 72, 0.3))' }}>
    <motion.circle cx="50" cy="40" r="30" fill="none" stroke="#fda4af" strokeWidth="1" strokeDasharray="3 8" initial={{ rotate: 0, opacity: 0 }} whileInView={{ rotate: 360, opacity: 0.8 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "50% 40%" }} />
    {[ { cx: 20, cy: 30, delay: 0 }, { cx: 80, cy: 20, delay: 0.5 }, { cx: 30, cy: 10, delay: 1 }, { cx: 70, cy: 60, delay: 1.5 } ].map((sparkle, i) => (
      <motion.circle key={i} cx={sparkle.cx} cy={sparkle.cy} r="1.5" fill="#f43f5e" initial={{ y: 0, opacity: 0 }} whileInView={{ y: -20, opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: sparkle.delay, ease: "easeOut" }} />
    ))}
    <motion.path d="M50,95 Q45,75 52,55" fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-green-500 opacity-90" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} viewport={{ once: false, amount: 0.3 }} />
    <motion.path d="M48,75 Q35,70 30,60" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-green-400 opacity-90" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} viewport={{ once: false, amount: 0.3 }} />
    <motion.path d="M50,85 Q65,80 70,70" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-green-400 opacity-90" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7 }} viewport={{ once: false, amount: 0.3 }} />
    <motion.path d="M45,35 C30,35 25,50 35,60 C40,65 55,65 65,60 C75,50 70,35 55,35 C45,35 40,45 50,50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="stroke-red-400" initial={{ pathLength: 0, scale: 0.2, transformOrigin: "50% 60%" }} whileInView={{ pathLength: 1, scale: 1 }} transition={{ duration: 1.5, delay: 0.8, type: "spring", bounce: 0.4 }} viewport={{ once: false, amount: 0.3 }} />
    <motion.path d="M38,47 C38,40 48,40 52,47 C56,53 48,57 45,55" strokeWidth="1.5" strokeLinecap="round" fill="none" className="stroke-rose-500 opacity-80" initial={{ pathLength: 0, scale: 0.5, transformOrigin: "50% 50%" }} whileInView={{ pathLength: 1, scale: 1 }} transition={{ duration: 1.2, delay: 1.6, ease: "easeOut" }} viewport={{ once: false, amount: 0.3 }} />
  </motion.svg>
);

const FancyAnimatedHeart = ({ className }: { className?: string }) => (
  <motion.svg className={className} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 8px rgba(244, 63, 94, 0.3))' }}>
    {[ { x: 15, y: 40, delay: 0.2 }, { x: 85, y: 30, delay: 0.8 }, { x: 50, y: 15, delay: 1.4 } ].map((sparkle, i) => (
      <motion.path key={i} d="M5 3.5C5 3.5 1.5 0.5 1.5 -2C1.5 -3.5 3.5 -3.5 5 -2C6.5 -3.5 8.5 -3.5 8.5 -2C8.5 0.5 5 3.5 5 3.5Z" fill="#f43f5e" style={{ transform: `translate(${sparkle.x}px, ${sparkle.y}px) scale(0.5)` }} initial={{ y: 0, opacity: 0 }} whileInView={{ y: -15, opacity: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: sparkle.delay, ease: "easeOut" }} />
    ))}
    <motion.path d="M50 85C50 85 15 55 15 30C15 15 35 15 50 30C65 15 85 15 85 30C85 55 50 85 50 85Z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="stroke-rose-400" strokeDasharray="60 2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} viewport={{ once: false, amount: 0.3 }} />
    <motion.path d="M50 82C50 82 20 55 20 33C20 20 35 20 50 33C65 20 80 20 80 33C80 55 50 82 50 82Z" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" className="stroke-pink-300 opacity-60" initial={{ pathLength: 0, scale: 0.9, transformOrigin: "50% 50%" }} whileInView={{ pathLength: 1, scale: [0.9, 1.05, 0.95, 1] }} transition={{ duration: 2, delay: 1, ease: "easeInOut" }} viewport={{ once: false, amount: 0.3 }} />
  </motion.svg>
);

function QuizPolaroid({ card, scatterClass }: { card: InteractiveCard, scatterClass: string }) {
  const [solved, setSolved] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [status, setStatus] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (idx: number) => {
    if (status || solved) return;
    setSelectedOpt(idx);
    if (idx === card.correctOption) {
      setStatus('correct');
      setTimeout(() => setSolved(true), 600);
    } else {
      setStatus('wrong');
      setTimeout(() => { setSelectedOpt(null); setStatus(null); }, 800);
    }
  };

  return (
    <div className={`w-[92%] max-w-sm mx-auto bg-white p-4 pb-8 polaroid-shadow relative transform transition-transform duration-300 hover:scale-[1.02] md:hover:scale-[1.05] hover:z-50 ${scatterClass}`}>
      <div className="w-full aspect-square bg-gray-100 relative overflow-hidden z-10">
        <MediaRenderer url={card.url} />
      </div>
      <div className="mt-5 px-1 md:px-2 flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px] w-full z-10 relative">
        <div className="w-full space-y-3 relative z-10">
          <p className="font-bold text-gray-800 text-center text-[14px] md:text-[15px] leading-tight">{card.question}</p>
          <div className="grid grid-cols-1 gap-2">
            {card.options.map((opt, idx) => {
              let btnStyle = "bg-gray-50 border-gray-200 text-gray-700";
              if (selectedOpt === idx) {
                if (status === 'correct' || solved) btnStyle = "bg-green-500 text-white border-green-500 shadow-sm";
                else if (status === 'wrong') btnStyle = "bg-red-500 text-white border-red-500 animate-shake";
              } else {
                if (!solved) btnStyle += " hover:border-rose-300 hover:bg-rose-50 cursor-pointer";
                else btnStyle += " opacity-40 cursor-default";
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={solved} className={`w-full p-3 md:p-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${btnStyle}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        <AnimatePresence>
          {solved && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full overflow-hidden text-center z-10">
              <div className="pt-4 md:pt-5 mt-4 md:mt-5 border-t-2 border-dashed border-gray-200 w-full">
                <span className="handwritten text-black text-2xl md:text-3xl font-bold border-b border-gray-200 pb-1 mb-2 md:mb-3 inline-block">{card.date}</span>
                <p className="handwritten text-black text-xl md:text-2xl leading-snug">{card.context}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SimplePolaroid({ card, scatterClass }: { card: Polaroid, scatterClass: string }) {
  return (
    <div className={`w-[92%] max-w-sm mx-auto bg-white p-4 pb-10 polaroid-shadow relative transform transition-transform duration-300 hover:scale-[1.02] md:hover:scale-[1.05] hover:z-50 ${scatterClass}`}>
      <div className="w-full aspect-square bg-gray-100 relative overflow-hidden z-10">
        <MediaRenderer url={card.url} />
      </div>
      <div className="mt-5 px-1 md:px-2 flex flex-col items-center justify-center min-h-[120px] md:min-h-[160px] text-center w-full z-10 relative">
        <span className="handwritten text-black text-2xl md:text-3xl font-bold border-b border-gray-200 pb-1 mb-2 md:mb-3 inline-block">{card.date}</span>
        <p className="handwritten text-black text-xl md:text-2xl leading-snug">{card.context}</p>
      </div>
    </div>
  );
}

export default function BirthdayApp() {
  const [step, setStep] = useState<'LETTER' | 'GIFT'>('LETTER');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    let pData: FeedItem[] = [];
    let cData: FeedItem[] = [];

    const mergeData = () => {
      const merged = [...pData, ...cData].sort((a, b) => a.timestamp - b.timestamp);
      setFeedItems(merged);
    };

    onValue(ref(database, 'polaroids'), (snapshot) => {
      const data = snapshot.val();
      if (data) pData = Object.keys(data).map(k => ({ type: 'SIMPLE', data: {id: k, ...data[k]}, timestamp: new Date(data[k].timestamp).getTime() }));
      else pData = [];
      mergeData();
    });

    onValue(ref(database, 'interactive_cards'), (snapshot) => {
      const data = snapshot.val();
      if (data) cData = Object.keys(data).map(k => ({ type: 'QUIZ', data: {id: k, ...data[k]}, timestamp: new Date(data[k].timestamp).getTime() }));
      else cData = [];
      mergeData();
    });
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 relative overflow-x-hidden selection:bg-rose-200">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Dancing+Script:wght@500;700&display=swap');
        
        .handwritten { font-family: 'Caveat', cursive; line-height: 1.3; }
        .calligraphy { font-family: 'Dancing Script', cursive; } 
        
        .paper-shadow { box-shadow: 0 10px 40px -10px rgba(200, 100, 120, 0.2), 0 0 20px rgba(0,0,0,0.05); }
        .polaroid-shadow { box-shadow: 0 15px 35px -5px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.05); }
        @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-5px);} 75% {transform: translateX(5px);} }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}} />

      {step === 'LETTER' && (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="w-[95%] max-w-md bg-white p-8 md:p-16 rounded-sm paper-shadow relative" style={{ transform: 'rotate(-2deg)' }}
          >
            <div className="text-center space-y-6">
              <h1 className="handwritten text-4xl sm:text-5xl md:text-6xl text-black leading-tight font-bold">
                Χρόνια πολλά <br/> <span className="text-rose-500">έρωτα μου</span> <br/> ανεπανάληπτε
              </h1>
              <div className="pt-8 md:pt-12">
                <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep('GIFT'); }} className="px-6 md:px-8 py-3 bg-transparent border-2 border-rose-400 text-rose-500 rounded-full font-bold tracking-wide hover:bg-rose-50 transition-colors cursor-pointer text-sm md:text-base">
                  Άνοιξε το ❤️
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-pink-50 border-l border-t border-gray-100 transform rotate-45 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4"></div>
          </motion.div>
        </div>
      )}

      {step === 'GIFT' && (
        <div className="min-h-screen py-12 md:py-16 px-2 md:px-8 relative z-10 flex flex-col items-center">
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="text-center space-y-2 mb-16 md:mb-20">
            <h2 className="handwritten text-3xl md:text-4xl text-rose-500 font-bold px-2">
            </h2>
          </motion.div>
          
          <div className="flex flex-col items-center w-full max-w-2xl space-y-16 md:space-y-32">
            {feedItems.map((item, index) => {
              const scatterClass = SCATTER_CLASSES[index % SCATTER_CLASSES.length];
              const isLeft = index % 2 === 0;
              
              return (
                <div key={item.data.id} className="relative w-full flex flex-col items-center">
                  
                  <motion.div 
                    initial={{ rotate: isLeft ? -70 : 70, y: 50, opacity: 0, scale: 0.5 }}
                    whileInView={{ rotate: isLeft ? -15 : 15, y: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 2, type: "spring", bounce: 0.4 }}
                    viewport={{ once: false, amount: 0.2 }}
                    className={`absolute ${isLeft ? 'left-0 md:-left-24' : 'right-0 md:-right-24'} top-1/4 w-20 md:w-36 pointer-events-none z-0`}
                  >
                    {isLeft ? <FancyAnimatedHeart /> : <FancyBloomingRose />}
                  </motion.div>
                  
                  <div className="z-10 w-full flex justify-center">
                     {item.type === 'SIMPLE' 
                       ? <SimplePolaroid card={item.data} scatterClass={scatterClass} /> 
                       : <QuizPolaroid card={item.data} scatterClass={scatterClass} />
                     }
                  </div>

                  {item.data.secretNote && (
                    <div className={`w-full flex justify-center md:${isLeft ? 'justify-start' : 'justify-end'} px-2 md:px-12`}>
                      <NotebookNote text={item.data.secretNote} isLeft={isLeft} />
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {feedItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="pt-16 pb-20 text-center space-y-4 border-t border-rose-200/50 w-full max-w-sm mt-24 md:mt-32 px-4"
            >
              <h2 className="handwritten text-4xl md:text-5xl text-black font-bold pt-8">
              </h2>
              <p className="handwritten text-3xl md:text-4xl text-rose-500 font-bold">
              </p>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}