"use client";
import { useState, useEffect } from "react";
// ΠΡΟΣΟΧΗ: Προσθέσαμε το "update" στην εισαγωγή της Firebase!
import { ref, onValue, push, remove, update } from "firebase/database";
import { database } from "../../firebase";
import { getPublicImages } from "../actions";

// Προσθέσαμε το secretNote στους τύπους
type Polaroid = { id: string; url: string; date: string; context: string; timestamp: string; secretNote?: string };
type InteractiveCard = { id: string; url: string; question: string; options: string[]; correctOption: number; date: string; context: string; timestamp: string; secretNote?: string };

const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

export default function AdminPanel() {
  const [polaroids, setPolaroids] = useState<Polaroid[]>([]);
  const [cards, setCards] = useState<InteractiveCard[]>([]);
  const [availableMedia, setAvailableMedia] = useState<string[]>([]);
  
  const [uploadType, setUploadType] = useState<'SIMPLE' | 'QUIZ'>('SIMPLE');
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [opt0, setOpt0] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [correctOpt, setCorrectOpt] = useState<number>(0);
  const [date, setDate] = useState("");
  const [context, setContext] = useState("");
  const [secretNote, setSecretNote] = useState(""); // Νέο state για το χαρτάκι
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getPublicImages().then(media => setAvailableMedia(media));

    onValue(ref(database, 'polaroids'), (snapshot) => {
      const data = snapshot.val();
      if (data) setPolaroids(Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      else setPolaroids([]);
    });

    onValue(ref(database, 'interactive_cards'), (snapshot) => {
      const data = snapshot.val();
      if (data) setCards(Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      else setCards([]);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !date || !context) return alert("Συμπλήρωσε τα βασικά πεδία!");
    if (uploadType === 'QUIZ' && (!question || !opt0 || !opt1 || !opt2 || !opt3)) return alert("Συμπλήρωσε την ερώτηση και όλες τις απαντήσεις!");
    
    setIsSaving(true);
    try {
      if (uploadType === 'SIMPLE') {
        await push(ref(database, 'polaroids'), { url, date, context, secretNote, timestamp: new Date().toISOString() });
      } else {
        await push(ref(database, 'interactive_cards'), {
          url, question, options: [opt0, opt1, opt2, opt3], correctOption: correctOpt, date, context, secretNote, timestamp: new Date().toISOString()
        });
      }
      setUrl(""); setQuestion(""); setOpt0(""); setOpt1(""); setOpt2(""); setOpt3(""); setCorrectOpt(0); setDate(""); setContext(""); setSecretNote("");
    } catch (error) {
      alert("Σφάλμα αποθήκευσης");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSimple = async (id: string) => { if (confirm("Διαγραφή απλής καταχώρησης;")) await remove(ref(database, `polaroids/${id}`)); };
  const handleDeleteQuiz = async (id: string) => { if (confirm("Διαγραφή καταχώρησης με κουίζ;")) await remove(ref(database, `interactive_cards/${id}`)); };

  // Νέα συνάρτηση για προσθήκη χαρτιού σε ΥΠΑΡΧΟΥΣΑ κάρτα!
  const handleUpdateNote = async (id: string, type: 'SIMPLE' | 'QUIZ', currentNote: string = "") => {
    const newNote = prompt("Γράψε το μυστικό σημείωμα για το χαρτάκι (ή άσε το κενό για να το αφαιρέσεις):", currentNote);
    if (newNote !== null) {
      const path = type === 'SIMPLE' ? `polaroids/${id}` : `interactive_cards/${id}`;
      try {
        await update(ref(database, path), { secretNote: newNote });
      } catch (error) {
        alert("Σφάλμα κατά την ενημέρωση!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-black">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Διαχείριση Δώρου 🎁</h1>
          <p className="text-gray-500">Πρόσθεσε απλές Polaroids, Κουίζ και Μυστικά Χαρτάκια!</p>
        </div>

        <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-8">
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button type="button" onClick={() => setUploadType('SIMPLE')} className={`flex-1 py-3 font-bold rounded-lg transition-colors ${uploadType === 'SIMPLE' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Απλή Φωτογραφία/Βίντεο</button>
            <button type="button" onClick={() => setUploadType('QUIZ')} className={`flex-1 py-3 font-bold rounded-lg transition-colors ${uploadType === 'QUIZ' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>Με Κουίζ</button>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">1. Αρχείο</h3>
            {availableMedia.length === 0 ? (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm">Βάλε φωτογραφίες (.jpg) ή βίντεο (.mp4) στον φάκελο public.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-4 bg-gray-100 rounded-xl border shadow-inner">
                {availableMedia.map((media) => (
                  <div 
                    key={media} 
                    onClick={() => setUrl(media)} 
                    className={`relative h-40 cursor-pointer rounded-lg overflow-hidden border-4 bg-white transition-transform ${url === media ? 'border-rose-500 shadow-lg scale-95' : 'border-transparent hover:border-gray-300 hover:scale-105'}`}
                  >
                    {isVideo(media) ? <video src={media} className="w-full h-full object-contain p-1" muted /> : <img src={media} className="w-full h-full object-contain p-1" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadType === 'QUIZ' && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <h3 className="text-xl font-bold mb-3">2. Το Κουίζ</h3>
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ερώτηση..." className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-black outline-none font-bold" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[opt0, opt1, opt2, opt3].map((opt, idx) => (
                  <div key={idx} className={`p-3 border rounded-xl flex items-center gap-3 bg-white ${correctOpt === idx ? 'bg-green-50 border-green-400' : ''}`}>
                    <input type="radio" checked={correctOpt === idx} onChange={() => setCorrectOpt(idx)} className="w-5 h-5 cursor-pointer accent-green-600" />
                    <input type="text" value={idx === 0 ? opt0 : idx === 1 ? opt1 : idx === 2 ? opt2 : opt3} onChange={(e) => {
                      const val = e.target.value;
                      if (idx === 0) setOpt0(val); else if (idx === 1) setOpt1(val); else if (idx === 2) setOpt2(val); else setOpt3(val);
                    }} placeholder={`Απάντηση ${idx + 1}`} className="w-full bg-transparent outline-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold mb-3">3. Στοιχεία Polaroid & Χαρτάκι</h3>
            <div className="space-y-4">
              <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Ημερομηνία (π.χ. 12 Οκτωβρίου 2024)" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none" />
              <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Η ιστορία πίσω από τη φωτογραφία/βίντεο..." rows={3} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none resize-none" />
              <input type="text" value={secretNote} onChange={(e) => setSecretNote(e.target.value)} placeholder="Μικρό σημείωμα σε φθαρμένο χαρτί (Προαιρετικό)" className="w-full p-3 border border-yellow-300 bg-yellow-50 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none placeholder-yellow-600/50" />
            </div>
          </div>

          <button type="submit" disabled={isSaving || !url} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50">
            {isSaving ? "Αποθήκευση..." : "Δημιουργία Polaroid"}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Υπάρχουσες Καταχωρήσεις</h2>
            
            {polaroids.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {isVideo(p.url) ? <video src={p.url} className="w-full h-full object-contain" /> : <img src={p.url} className="w-full h-full object-contain" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{p.date}</p>
                  {p.secretNote && <p className="text-xs text-yellow-600 font-bold">📝 {p.secretNote}</p>}
                </div>
                <button onClick={() => handleUpdateNote(p.id, 'SIMPLE', p.secretNote)} className="text-yellow-600 text-sm font-bold bg-yellow-50 p-2 rounded-lg hover:bg-yellow-100">📝 Χαρτάκι</button>
                <button onClick={() => handleDeleteSimple(p.id)} className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg">Διαγραφή</button>
              </div>
            ))}

            {cards.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {isVideo(c.url) ? <video src={c.url} className="w-full h-full object-contain" /> : <img src={c.url} className="w-full h-full object-contain" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Q: {c.question}</p>
                  {c.secretNote && <p className="text-xs text-yellow-600 font-bold">📝 {c.secretNote}</p>}
                </div>
                <button onClick={() => handleUpdateNote(c.id, 'QUIZ', c.secretNote)} className="text-yellow-600 text-sm font-bold bg-yellow-50 p-2 rounded-lg hover:bg-yellow-100">📝 Χαρτάκι</button>
                <button onClick={() => handleDeleteQuiz(c.id)} className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg">Διαγραφή</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}