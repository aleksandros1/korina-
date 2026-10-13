"use client";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";

type Answer = {
  id: string;
  city: string;
  location: string;
  activity: string;
  outfit: string;
  xemonaxiasma: string;
  timestamp: string;
};

export default function AdminPanel() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Διαβάζουμε τα δεδομένα από τον κόμβο 'dates'
    const answersRef = ref(database, 'dates');
    
    // Το onValue ακούει για αλλαγές σε πραγματικό χρόνο
    const unsubscribe = onValue(answersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Μετατροπή του αντικειμένου σε array και ταξινόμηση (τα πιο πρόσφατα πρώτα)
        const formattedData = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setAnswers(formattedData);
      } else {
        setAnswers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse">Φόρτωση απαντήσεων...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Οι Απαντήσεις της Κορίνας</h1>
          <p className="text-gray-500">Όλες οι επιλογές ανανεώνονται ζωντανά</p>
        </div>
        
        {answers.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 text-xl">Δεν έχει απαντήσει ακόμα. Περίμενε! ⏳</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {answers.map((ans) => (
              <div 
                key={ans.id} 
                className="bg-white p-6 rounded-3xl shadow-md border-l-8 border-black space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-sm font-medium text-gray-400">
                    {new Date(ans.timestamp).toLocaleString("el-GR", { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                    {ans.city}
                  </span>
                </div>
                
                <div className="space-y-2 text-lg">
                  <p><strong className="text-gray-400">📍 Μέρος:</strong> {ans.location}</p>
                  <p><strong className="text-gray-400">🎯 Πλάνο:</strong> {ans.activity}</p>
                  
                  {ans.outfit && ans.outfit !== "Δεν απαιτείται" && (
                    <p><strong className="text-gray-400">👗 Ρούχα:</strong> {ans.outfit}</p>
                  )}
                  
                  {ans.xemonaxiasma && (
                    <p><strong className="text-gray-400">🔥 Ξεμοναχιασμα:</strong> <span className="font-bold text-xl">{ans.xemonaxiasma}/10</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}