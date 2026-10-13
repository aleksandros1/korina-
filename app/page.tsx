"use client";
import { useState } from "react";
import { ref, push } from "firebase/database";
import { database } from "../firebase";

type Step = 
  | 'WELCOME' 
  | 'CITY' 
  | 'LOC_DRAMA' 
  | 'LOC_KAVALA' 
  | 'ACT_DRAMA' 
  | 'ACT_KAVALA_PALIO' 
  | 'OUTFIT' 
  | 'XEMONAXIASMA' 
  | 'CONFIRM' 
  | 'RESULT';

export default function KorinaApp() {
  const [step, setStep] = useState<Step>('WELCOME');
  
  const [city, setCity] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [activity, setActivity] = useState<string>("");
  const [outfit, setOutfit] = useState<string>("");
  const [xemonaxiasma, setXemonaxiasma] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const resetFlow = () => {
    setCity("");
    setLocation("");
    setActivity("");
    setOutfit("");
    setXemonaxiasma("");
    setIsSaved(false);
    setStep('CITY');
  };

  const saveToFirebase = async () => {
    setIsSaving(true);
    try {
      const responsesRef = ref(database, 'dates');
      await push(responsesRef, {
        city,
        location,
        activity,
        outfit: outfit || "Δεν απαιτείται",
        xemonaxiasma,
        timestamp: new Date().toISOString()
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Σφάλμα αποθήκευσης:", error);
      alert("Κάτι πήγε στραβά με την αποθήκευση. Ξαναδοκίμασε!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 font-sans">
      
      {/* 1. Καλωσόρισμα */}
      {step === 'WELCOME' && (
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Καλώς όρισες Κορίνα
          </h1>
          <p className="text-xl text-gray-500 font-light">
            Επιλογές για το Σάββατο
          </p>
          <div className="pt-8">
            <button 
              onClick={() => setStep('CITY')}
              className="px-10 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Συνέχεια
            </button>
          </div>
        </div>
      )}

      {/* 2. Επιλογή Πόλης */}
      {step === 'CITY' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Πού θες να βγούμε;</h2>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => { setCity("ΔΡΑΜΑ"); setStep('LOC_DRAMA'); }}
              className="w-full py-4 border-2 border-black rounded-2xl text-xl font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              ΔΡΑΜΑ
            </button>
            <button 
              onClick={() => { setCity("ΚΑΒΑΛΑ"); setStep('LOC_KAVALA'); }}
              className="w-full py-4 border-2 border-black rounded-2xl text-xl font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              ΚΑΒΑΛΑ
            </button>
          </div>
        </div>
      )}

      {/* 3. Επιλογή Τοποθεσίας Δράμα */}
      {step === 'LOC_DRAMA' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Σε ποιο μέρος;</h2>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => { setLocation("Κορύλοβος (Γρασίδια)"); setStep('ACT_DRAMA'); }}
              className="w-full py-4 border-2 border-black rounded-2xl text-xl font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              Κορύλοβος (Γρασίδια)
            </button>
            <button 
              onClick={() => { setLocation("Αερογέφυρα"); setStep('ACT_DRAMA'); }}
              className="w-full py-4 border-2 border-black rounded-2xl text-xl font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              Αερογέφυρα
            </button>
          </div>
        </div>
      )}

      {/* 4. Επιλογή Δραστηριότητας Δράμα */}
      {step === 'ACT_DRAMA' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Τι θέλεις να κάνουμε;</h2>
          <div className="flex flex-col space-y-4">
            {location === "Κορύλοβος (Γρασίδια)" && (
              <>
                <button 
                  onClick={() => { setActivity("Άραγμα με κρασί και πίτσα και ταινία"); setStep('XEMONAXIASMA'); }}
                  className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
                >
                  Άραγμα με κρασί, πίτσα και ταινία
                </button>
                <button 
                  onClick={() => { setActivity("Οτιδήποτε άλλο θες"); setStep('XEMONAXIASMA'); }}
                  className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
                >
                  Οτιδήποτε άλλο θες
                </button>
              </>
            )}
            {location === "Αερογέφυρα" && (
              <>
                <button 
                  onClick={() => { setActivity("Άραγμα στο αμάξι για ταινία με φαΐ από Γιάφκα"); setStep('XEMONAXIASMA'); }}
                  className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
                >
                  Ταινία στο αμάξι με φαΐ από Γιάφκα
                </button>
                <button 
                  onClick={() => { setActivity("Άραγμα στο αμάξι με φαΐ της επιλογής σου"); setStep('XEMONAXIASMA'); }}
                  className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
                >
                  Άραγμα στο αμάξι με φαΐ της επιλογής σου
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Επιλογή Τοποθεσίας Καβάλα */}
      {step === 'LOC_KAVALA' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Πού στην Καβάλα;</h2>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => { 
                setLocation("Λιμάνι"); 
                setActivity("Ποτό στο λιμάνι όπως την πρώτη φορά (χωρίς την βροχή κατα προτίμηση)"); 
                setStep('OUTFIT'); 
              }}
              className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
            >
              Ποτό στο λιμάνι όπως την πρώτη φορά (χωρίς την βροχή κατα προτίμηση)
            </button>
            <button 
              onClick={() => { 
                setLocation("Παλιό (άραγμα στην θάλασσα)"); 
                setStep('ACT_KAVALA_PALIO'); 
              }}
              className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
            >
              Παλιό (άραγμα στην θάλασσα)
            </button>
          </div>
        </div>
      )}

      {/* 6. Επιλογή Δραστηριότητας Καβάλα - Παλιό */}
      {step === 'ACT_KAVALA_PALIO' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Τι να φάμε;</h2>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => { setActivity("Άραγμα με κρασί και πίτσα"); setStep('XEMONAXIASMA'); }}
              className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
            >
              Άραγμα με κρασί και πίτσα
            </button>
            <button 
              onClick={() => { setActivity("Φαΐ της επιλογής σου"); setStep('XEMONAXIASMA'); }}
              className="w-full py-4 border-2 border-black rounded-2xl text-lg font-bold hover:bg-black hover:text-white transition-colors px-4 cursor-pointer"
            >
              Φαΐ της επιλογής σου
            </button>
          </div>
        </div>
      )}

      {/* 7. Ερώτηση ρούχων (Μόνο για Καβάλα Λιμάνι) */}
      {step === 'OUTFIT' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Τι θα φορέσεις;</h2>
          <input 
            type="text" 
            value={outfit} 
            onChange={(e) => setOutfit(e.target.value)} 
            placeholder="Γράψε εδώ..."
            className="w-full p-4 border-2 border-black rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button 
            onClick={() => { if(outfit.trim() !== "") setStep('XEMONAXIASMA'); }}
            className={`w-full py-4 rounded-2xl text-xl font-bold transition-colors ${outfit.trim() !== "" ? "bg-black text-white hover:bg-gray-800 cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            disabled={outfit.trim() === ""}
          >
            Συνέχεια
          </button>
        </div>
      )}

      {/* 8. Ερώτηση Ξεμοναχιάσματος (Κοινή για όλα) */}
      {step === 'XEMONAXIASMA' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Από το 1 έως το 10 πόσο θα με ξεμοναχιάσεις;</h2>
          <input 
            type="number" 
            min="1" 
            max="10"
            value={xemonaxiasma} 
            onChange={(e) => setXemonaxiasma(e.target.value)} 
            placeholder="Βάλε αριθμό"
            className="w-full p-4 border-2 border-black rounded-2xl text-center text-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button 
            onClick={() => { if(xemonaxiasma !== "") setStep('CONFIRM'); }}
            className={`w-full py-4 rounded-2xl text-xl font-bold transition-colors ${xemonaxiasma !== "" ? "bg-black text-white hover:bg-gray-800 cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            disabled={xemonaxiasma === ""}
          >
            Συνέχεια
          </button>
        </div>
      )}

      {/* 9. Τελική Επιβεβαίωση */}
      {step === 'CONFIRM' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Εντάξει σου κάνει;</h2>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setStep('RESULT')}
              className="w-full py-4 bg-black text-white rounded-2xl text-xl font-bold hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Ναι
            </button>
            <button 
              onClick={resetFlow}
              className="w-full py-4 border-2 border-black text-black rounded-2xl text-xl font-bold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Όχι
            </button>
          </div>
        </div>
      )}

      {/* 10. Ολοκλήρωση & Αποθήκευση */}
      {step === 'RESULT' && (
        <div className="text-center w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Τέλεια!</h2>
            <p className="text-gray-500">Η επιλογή σου κλείδωσε.</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl text-left space-y-2 border border-gray-200">
            <p><strong>Πόλη:</strong> {city}</p>
            <p><strong>Μέρος:</strong> {location}</p>
            <p><strong>Πλάνο:</strong> {activity}</p>
            {outfit && <p><strong>Ρούχα:</strong> {outfit}</p>}
            <p><strong>Ξεμοναχιασμα:</strong> {xemonaxiasma}/10</p>
          </div>

          {!isSaved ? (
            <button 
              onClick={saveToFirebase}
              disabled={isSaving}
              className="w-full py-4 bg-black text-white rounded-2xl text-xl font-bold hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Αποστολή..." : "Αποστολή στον Αλέξανδρο"}
            </button>
          ) : (
            <div className="w-full py-4 bg-green-500 text-white rounded-2xl text-xl font-bold">
              Στάλθηκαν επιτυχώς! ✔️
            </div>
          )}

          <button 
            onClick={resetFlow}
            className="mt-4 text-gray-500 underline text-sm cursor-pointer"
          >
            Ξεκίνα από την αρχή
          </button>
        </div>
      )}

    </div>
  );
}