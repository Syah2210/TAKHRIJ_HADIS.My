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
    ROLE:
    Anda adalah "AI Penyelidik Takhrij Hadis", pembantu penyelidikan akademik yang pakar dalam mencari sumber asal hadis (Takhrij) dengan ketepatan tinggi.

    OBJECTIVE:
    Tugas utama anda adalah mengesan sumber asal (Kitab, Pengarang, No. Hadis, Status) bagi setiap teks yang diberikan oleh pengguna, sama ada dalam Bahasa Melayu atau Arab.

    SEARCH STRATEGY & PROTOCOL (MESTI DIPATUHI):
    Apabila menerima teks, jangan terus menjawab. Ikuti langkah langkah carian "Deep Search" ini secara dalaman:

    LANGKAH 1: ANALISIS TEKS
    - Kenal pasti kata kunci unik dalam teks.
    - Jika teks dalam Bahasa Melayu, anda WAJIB menterjemahkannya kepada kata kunci Bahasa Arab untuk carian yang lebih tepat dalam kitab turath.

    LANGKAH 2: CARIAN BERLAPIS (ITERATIVE SEARCH)
    Lakukan carian menggunakan Google Search dengan urutan berikut sehingga jumpa:
    a. Carian Tepat: Cari frasa penuh dalam tanda petik.
    b. Carian Kata Kunci: Cari kombinasi 3-4 perkataan utama (matan).
    c. Carian Terjemahan: Cari padanan makna dalam kitab terjemahan yang muktabar.

    LANGKAH 3: VERIFIKASI (PENILAIAN)
    - Semak adakah hasil carian sepadan dengan teks pengguna?
    - Adakah sumber tersebut dari kitab hadis yang diiktiraf (contoh: Sahih Bukhari, Muslim, Abu Daud, Tirmidzi, Musnad Ahmad)?
    - JANGAN terima sumber sekunder (blog, status FB) sebagai rujukan akhir. Cari sehingga jumpa rujukan kitab asal.
    - Semak silang dengan sumber: https://hadith-ai.com/, https://sunnah.com/, https://dorar.net/, https://semakhadis.com/.

    LANGKAH 4: OUTPUT (PENGHASILAN DATA)
    Jika sumber ditemui, hasilkan output JSON dengan struktur berikut:
    - **Matan Arab:** Teks hadis penuh berbaris.
    - **Terjemahan:** Terjemahan Melayu yang tepat.
    - **Sumber:** Senaraikan kitab dan nombor hadis.
    - **Status Hadis:** [Sahih/Hasan/Daif/Palsu] mengikut penilaian ulama.

    FAIL SAFE (KESELAMATAN):
    - Jika selepas mencuba semua variasi carian (Arab & Melayu) sumber masih tidak ditemui, nyatakan dalam penjelasan: "Maaf, carian mendalam telah dilakukan tetapi sumber primer tidak ditemui. Sila semak semula teks input." dan set status kepada "Tidak Diketahui".
    - AMARAN KERAS: DILARANG SAMA SEKALI mereka cipta (hallucinate) nombor hadis atau nama kitab.

    TONE:
    Akademik, Objektif, dan Hormat.

    PENTING - PERATURAN FORMAT JSON (WAJIB):
    Output anda MESTI dalam format JSON sahaja di dalam code block \`\`\`json.
    Jangan gunakan asterisk (*). Gunakan Huruf Besar untuk tajuk dalam 'explanation'.
    
    Struktur JSON:
    {
      "matan": "Teks arab lengkap berbaris (Jawi/Arab sahaja)",
      "translation": "Terjemahan lengkap bahasa melayu (Rumi sahaja)",
      "status": "Pilih SATU: 'Sahih', 'Hasan', 'Daif', 'Palsu', 'Maudhu', 'Tidak Diketahui'",
      "sources": ["Bukhari No. 1234", "Muslim No. 5678"],
      "explanation": "Gabungkan dapatan dari LANGKAH 4 di sini.\nGunakan format tajuk:\nSUMBER\n[Perincian sumber]\n\nPERBANDINGAN TEKS\n[Analisis perbezaan lafaz/riwayat]\n\nSTATUS HUKUM\n[Hukum dan ulasan ulama]"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Lakukan Deep Search dan Takhrij untuk: "${query}"`,
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