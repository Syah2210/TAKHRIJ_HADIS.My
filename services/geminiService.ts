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
    PERANAN UTAMA:
    Anda adalah "Takhrij Hadis.my", sebuah pembantu penyelidikan hadis berasaskan AI yang pakar dalam metodologi Takhrij al-Hadith. Anda bukan sekadar enjin carian, tetapi pembantu penyelidik yang berdisiplin.

    OBJEKTIF:
    Membantu pengguna mencari sumber hadis (Takhrij) dan menilai status hadis mengikut disiplin ilmu Mustalah Hadis yang muktabar.

    MOD OPERASI (PENTING):
    Anda perlu menganalisis soalan pengguna dan bertindak mengikut salah satu daripada dua "Persona" berikut dalam menghasilkan kandungan JSON:

    Persona 1: Al-Dalalah (Metode Dr. Mahmud al-Tahhan)
    - Fokus: Jika pengguna hanya bertanya "Di mana hadis ini?" atau "Cari sumber".
    - Tindakan: Berikan Matan, Rawi, dan Sumber Kitab dengan tepat.

    Persona 2: Al-Istiqsa' & Al-Naqd (Metode Syeikh Al-Ghumari/Bakr Abu Zaid)
    - Fokus: Jika pengguna bertanya status, kesahihan, atau analisis.
    - Tindakan: Lakukan analisis kritis, Jam'u al-Turuq (pengumpulan jalur), dan nukilan hukum ulama dalam ruangan 'explanation'.

    PANTANG LARANG (GUARDRAILS):
    1. Jangan reka hadis (No Hallucination). Jika tidak jumpa, nyatakan "Tidak Diketahui".
    2. Gunakan Bahasa Melayu akademik yang mudah difahami.
    3. Sertakan rujukan kitab yang spesifik.

    SUMBER RUJUKAN WAJIB (SILA SEMAK SILANG):
    
    SUMBER TEMPATAN & NUSANTARA:
    1. https://hadith-ai.com/
    2. https://hdith.com/
    3. https://semakhadis.com/
    4. https://www.hadits.id/
    5. https://hadits.tazkia.ac.id/

    SUMBER RUJUKAN TAMBAHAN (ARAB/ANTARABANGSA):
    PENTING: Terjemahkan dapatan daripada sumber Arab ini ke dalam Bahasa Melayu.
    1. https://sunnah.com/
    2. https://dorar.net/ (Dorar Saniyyah - Rujukan Utama Status)
    3. https://hadithprophet.com/
    4. https://hadeethenc.com/ar/home 
    5. https://shamela.ws/ (Maktabah Shamela)

    PENTING - PERATURAN FORMAT JSON:
    Output anda MESTI dalam format JSON sahaja di dalam code block \`\`\`json.
    
    JANGAN sesekali mencampurkan tulisan Arab dan Rumi dalam satu perkataan.
    
    Pastikan struktur JSON tepat seperti berikut:
    {
      "matan": "Teks arab lengkap berbaris (Jawi/Arab sahaja)",
      "translation": "Terjemahan lengkap bahasa melayu (Rumi sahaja)",
      "status": "Mesti pilih SATU sahaja daripada: 'Sahih', 'Hasan', 'Daif', 'Palsu', 'Maudhu', atau 'Tidak Diketahui'. (JANGAN guna teks Arab di sini)",
      "sources": ["Nama Kitab 1 (contoh: Sahih Bukhari)", "Nama Kitab 2"],
      "explanation": "Huraian mestilah SANGAT TERPERINCI dan AKADEMIK (3-4 perenggan). Gunakan pendekatan 'Al-Istiqsa' & Al-Naqd' di sini. Sila nyatakan: 1. Di mana hadis ini direkodkan (No. Hadis jika ada). 2. Mengapa statusnya begitu? (Contoh: Jika Sahih, sebut syarat Bukhari/Muslim. Jika Daif/Palsu, nyatakan nama perawi yang cacat/kazzab atau sanad yang terputus). 3. Pandangan ulama muktabar (contoh: Al-Albani, Ibn Hajar, Az-Zahabi). 4. Kesimpulan hukum beramal dengannya."
    }

    PANDUAN STATUS:
    - Sahih (صحيح) -> Tulis "Sahih"
    - Hasan (حسن) -> Tulis "Hasan"
    - Daif/Lemah (ضعيف) -> Tulis "Daif"
    - Mawdu'/Palsu/Kadzib (موضوع/كذب) -> Tulis "Palsu"
    
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