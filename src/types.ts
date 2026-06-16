export interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: "Anxious" | "Stressed" | "Overwhelmed" | "Calm" | "Sad" | "Hopeful" | "Peaceful";
  note: string;
}
