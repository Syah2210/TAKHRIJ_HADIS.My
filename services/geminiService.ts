import { GoogleGenAI } from "@google/genai";
import { HadithResult } from "../types";

// Helper to extract JSON from markdown code blocks
const extractJson = (text: string): any => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return JSON.parse(jsonMatch[1]);
  }
  // Fallback: try parsing the whole text if it's raw JSON
  return JSON.parse(text);
};

export const searchHadith = async (query: string): Promise<{ data: HadithResult; groundingUrls: any[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key tidak dijumpai. Sila pastikan API_KEY disetkan.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Anda adalah pakar rujuk Hadis (Muhaddith) yang berwibawa, teliti, dan akademik. 
    Tugas anda adalah mencari, menyemak, dan mengesahkan hadis berdasarkan input pengguna.
    
    Sila buat semakan silang menggunakan sumber-sumber autoriti berikut:
    
    SUMBER TEMPATAN & NUSANTARA:
    1. https://hadith-ai.com/
    2. https://hdith.com/
    3. https://semakhadis.com/
    4. https://www.hadits.id/
    5. https://hadits.tazkia.ac.id/

    SUMBER RUJUKAN TAMBAHAN (ARAB/ANTARABANGSA):
    Sila semak pangkalan data ini untuk ketepatan matan dan status. 
    PENTING: Terjemahkan dapatan daripada sumber Arab ini ke dalam Bahasa Melayu.
    1. https://sunnah.com/
    2. https://dorar.net/ (Dorar Saniyyah - Rujukan Utama Status)
    3. https://hadithprophet.com/
    4. https://hadeethenc.com/ar/home 
    5. https://shamela.ws/ (Maktabah Shamela)

    PANDUAN PROSES:
    1. Cari matan penuh hadis (teks Arab).
    2. Cari terjemahan Bahasa Melayu yang tepat.
    3. Tentukan status hadis (Sahih, Hasan, Daif, atau Palsu).
    4. Lakukan Takhrij: Kenal pasti kitab mana yang merekodkannya.
    5. Lakukan Analisis Sanad (Jarh wa Ta'dil) ringkas jika hadis itu bermasalah.
    
    PENTING - PERATURAN FORMAT JSON:
    Output anda MESTI dalam format JSON sahaja di dalam code block \`\`\`json.
    
    JANGAN sesekali mencampurkan tulisan Arab dan Rumi dalam satu perkataan.
    
    Pastikan struktur JSON tepat seperti berikut:
    {
      "matan": "Teks arab lengkap berbaris (Jawi/Arab sahaja)",
      "translation": "Terjemahan lengkap bahasa melayu (Rumi sahaja)",
      "status": "Mesti pilih SATU sahaja daripada: 'Sahih', 'Hasan', 'Daif', 'Palsu', 'Maudhu', atau 'Tidak Diketahui'. (JANGAN guna teks Arab di sini)",
      "sources": ["Nama Kitab 1 (contoh: Sahih Bukhari)", "Nama Kitab 2"],
      "explanation": "Huraian mestilah SANGAT TERPERINCI dan AKADEMIK (3-4 perenggan). Sila nyatakan: 1. Di mana hadis ini direkodkan (No. Hadis jika ada). 2. Mengapa statusnya begitu? (Contoh: Jika Sahih, sebut syarat Bukhari/Muslim. Jika Daif/Palsu, nyatakan nama perawi yang cacat/kazzab atau sanad yang terputus). 3. Pandangan ulama muktabar (contoh: Al-Albani, Ibn Hajar, Az-Zahabi). 4. Kesimpulan hukum beramal dengannya."
    }

    PANDUAN STATUS:
    - Sahih (صحيح) -> Tulis "Sahih"
    - Hasan (حسن) -> Tulis "Hasan"
    - Daif/Lemah (ضعيف) -> Tulis "Daif"
    - Mawdu'/Palsu/Kadzib (موضوع/كذب) -> Tulis "Palsu"
    
    CONTOH PENULISAN 'EXPLANATION' YANG BAIK:
    "Hadis ini diriwayatkan oleh Imam Tirmidhi dalam Sunannya (No. 1234) dan beliau berkata hadis ini Hasan Gharib. Namun, Syeikh Al-Albani menilainya sebagai Daif dalam Silsilah Al-Ahadith Al-Daifah (No. 567). Kelemahan hadis ini berpunca daripada perawi bernama 'Fulan bin Fulan' yang dikategorikan sebagai 'Matruk' (ditinggalkan hadisnya) oleh Imam An-Nasa'i kerana hafalan yang sangat buruk. Oleh itu, hadis ini tidak boleh dijadikan hujah dalam menetapkan hukum syarak, namun sebahagian ulama membenarkan penggunaannya dalam Fadhail Amal dengan syarat tidak meyakini ia daripada Nabi SAW."

    Jika hadis tidak dijumpai atau bukan hadis (kata-kata hikmah), nyatakan status sebagai "Tidak Diketahui" dan jelaskan dalam "explanation".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Lakukan takhrij dan semakan terperinci untuk: "${query}"`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, 
        tools: [{ googleSearch: {} }], 
      },
    });

    const text = response.text;
    
    let groundingUrls: any[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      groundingUrls = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title);
    }

    try {
      const parsedData = extractJson(text);
      return { data: parsedData as HadithResult, groundingUrls };
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      console.log("Raw text:", text);
      throw new Error("Gagal memproses data hadis. Sila cuba lagi.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};