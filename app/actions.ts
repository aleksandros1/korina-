"use server";
import fs from "fs";
import path from "path";

export async function getPublicImages() {
  const publicDir = path.join(process.cwd(), "public");
  
  try {
    const files = fs.readdirSync(publicDir);
    // Προσθέσαμε το mp4 και το webm στις επιτρεπτές καταλήξεις
    const media = files.filter(file => /\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i.test(file));
    
    return media.map(file => `/${file}`);
  } catch (error) {
    console.error("Σφάλμα κατά την ανάγνωση του φακέλου public:", error);
    return [];
  }
}