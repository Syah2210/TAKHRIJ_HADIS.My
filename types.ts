export interface HadithResult {
  matan: string;
  translation: string;
  status: 'Sahih' | 'Hasan' | 'Daif' | 'Palsu' | 'Maudhu' | 'Tidak Diketahui';
  sources: string[];
  explanation: string;
  similar_hadiths?: string[];
}

export interface SearchState {
  query: string;
  isLoading: boolean;
  data: HadithResult | null;
  error: string | null;
  groundingUrls: { title: string; uri: string }[];
}

export const EXTERNAL_LINKS = [
  { name: "Hadith AI", url: "https://hadith-ai.com/" },
  { name: "Hdith.com", url: "https://hdith.com/" },
  { name: "Semak Hadis", url: "https://semakhadis.com/" },
  { name: "Hadits.id", url: "https://www.hadits.id/" },
  { name: "Tazkia Hadits", url: "https://hadits.tazkia.ac.id/" },
];