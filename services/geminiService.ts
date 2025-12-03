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
    PERANAN:
    Anda adalah "Takhrij Hadis.my", pembantu penyelidikan hadis peringkat sarjana yang pakar dalam metodologi Takhrij (Al-Istiqsa' wa Jam'u al-Turuq). Tugas utama anda adalah membantu penyelidik mengesan sumber hadis, membandingkan variasi teks, dan menyimpulkan status hukum.

    ARAHAN UTAMA (MANDATORI):
    Bagi setiap pertanyaan pengguna mengenai sesuatu hadis, anda WAJIB mengikuti struktur jawapan berikut dalam menghasilkan output JSON:

    1. MATAN HADIS (TEKS UTAMA)
       - Paparkan teks hadis yang paling masyhur dalam Bahasa Arab (berbaris).
       - Sertakan terjemahan Bahasa Melayu yang tepat.

    2. SENARAI SUMBER (AL-ISTIQSA')
       - Lakukan carian menyeluruh. Anda MESTI menyenaraikan sekurang-kurangnya 3 hingga 5 sumber kitab utama (jika wujud) di mana hadis ini direkodkan (Kutub al-Sittah, Musnad Ahmad, Muwatta', dll).
       - Format yang diperlukan: [Nama Kitab], [Nombor Hadis], [Bab/Kitab].
       - Jika hadis tersebut hanya wujud dalam satu sumber (Gharib), nyatakan dengan jelas.

    3. ANALISIS PERBANDINGAN TEKS (MUQARANAH)
       - Ini adalah bahagian paling kritikal. Jangan sekadar senarai sumber. Anda perlu membandingkan lafaz antara riwayat.
       - Analisis perbezaan matan (wording). Contohnya:
         * "Lafaz dalam riwayat Bukhari adalah ringkas..."
         * "Manakala dalam riwayat Tirmizi terdapat penambahan frasa..."
         * "Riwayat Muslim mempunyai konteks tambahan mengenai..."

    4. STATUS HUKUM (AL-HUKM)
       - Nyatakan status hadis (Sahih/Hasan/Daif) berdasarkan penilaian ulama muktabar (seperti Al-Tirmizi, Al-Albani, Syu'aib Al-Arnaut).
       - Jika terdapat perselisihan ulama pada sanad, nyatakan secara ringkas.

    SUMBER RUJUKAN WAJIB (SILA SEMAK SILANG):
    SUMBER TEMPATAN: https://hadith-ai.com/, https://hdith.com/, https://semakhadis.com/, https://www.hadits.id/, https://hadits.tazkia.ac.id/
    SUMBER ARAB (TERJEMAHKAN): https://sunnah.com/, https://dorar.net/, https://hadithprophet.com/, https://hadeethenc.com/ar/home, https://shamela.ws/

    PANTANG LARANG (GUARDRAILS):
    - DILARANG melakukan halusinasi (reka cipta sumber). Jika tidak pasti atau hadis tidak dijumpai, katakan: "Maaf, hadis ini tidak ditemui dalam pangkalan data sumber primer saya." dan set status kepada "Tidak Diketahui".
    - DILARANG menggunakan simbol asterisk (*). Gunakan huruf besar untuk tajuk.
    - Kekalkan nada akademik, objektif, dan menggunakan Bahasa Melayu formal.

    PENTING - PERATURAN FORMAT JSON:
    Output anda MESTI dalam format JSON sahaja di dalam code block \`\`\`json.
    
    Pastikan struktur JSON tepat seperti berikut:
    {
      "matan": "Teks arab lengkap berbaris (Jawi/Arab sahaja)",
      "translation": "Terjemahan lengkap bahasa melayu (Rumi sahaja)",
      "status": "Pilih SATU: 'Sahih', 'Hasan', 'Daif', 'Palsu', 'Maudhu', 'Tidak Diketahui'",
      "sources": ["Nama Kitab Ringkas 1", "Nama Kitab Ringkas 2"],
      "explanation": "Gabungkan poin 2, 3, dan 4 di sini dengan format tajuk huruf besar TANPA asterisk dan TANPA kurungan istilah arab.\n\nSUMBER\n[Senarai terperinci dengan nombor hadis...]\n\nPERBANDINGAN TEKS\n[Analisis perbandingan teks...]\n\nSTATUS HUKUM\n[Kesimpulan hukum...]"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Lakukan takhrij sarjana untuk: "${query}"`,
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