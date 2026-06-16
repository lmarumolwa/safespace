import React, { useState, useEffect } from "react";
import { Smile, Trash2, Calendar, ClipboardList } from "lucide-react";
import { MoodEntry } from "../types";

export default function MoodCheckIn() {
  const [moodLog, setMoodLog] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodEntry["mood"]>("Calm");
  const [note, setNote] = useState("");

  const moods: { label: MoodEntry["mood"]; emoji: string; activeColor: string }[] = [
    { label: "Anxious", emoji: "😰", activeColor: "bg-[#E6DFCF] border-[#5A5A40] text-[#3D3D33]" },
    { label: "Stressed", emoji: "🤯", activeColor: "bg-[#E6DFCF] border-[#5A5A40] text-[#3D3D33]" },
    { label: "Overwhelmed", emoji: "🥺", activeColor: "bg-[#E6DFCF] border-[#5A5A40] text-[#3D3D33]" },
    { label: "Calm", emoji: "😌", activeColor: "bg-[#D3DED4] border-[#8DA08E] text-[#3D3D33]" },
    { label: "Sad", emoji: "😔", activeColor: "bg-[#E6DFCF] border-[#A8A892] text-[#3D3D33]" },
    { label: "Hopeful", emoji: "🌱", activeColor: "bg-[#D3DED4] border-[#8DA08E] text-[#3D3D33]" },
    { label: "Peaceful", emoji: "🧘", activeColor: "bg-[#D3DED4] border-[#5A5A40] text-[#3D3D33]" },
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("safemind_moods");
      if (stored) {
        setMoodLog(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MoodEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleString("en-ZA", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      mood: selectedMood,
      note: note.trim(),
    };

    const updated = [newEntry, ...moodLog];
    setMoodLog(updated);
    localStorage.setItem("safemind_moods", JSON.stringify(updated));
    setNote("");
  };

  const handleDelete = (id: string) => {
    const updated = moodLog.filter((item) => item.id !== id);
    setMoodLog(updated);
    localStorage.setItem("safemind_moods", JSON.stringify(updated));
  };

  return (
    <div
      id="mood-check-in"
      className="p-6 rounded-2xl border border-[#E6E2D3] bg-white/70 backdrop-blur-md text-[#3D3D33] shadow-xs"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-[#D3DED4] text-[#5A5A40]">
          <Smile className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-medium text-base tracking-tight text-[#5A5A40]">
            Emotional Reflection Journal
          </h3>
          <p className="text-xs text-[#A8A892]">Track stress triggers and clear overwhelming thoughts.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider mb-2">
            Select Current Feeling
          </label>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => {
              const active = selectedMood === m.label;
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(m.label)}
                  id={`mood-select-${m.label.toLowerCase()}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                    active ? m.activeColor : "bg-white border-[#E6E2D3] hover:border-[#8DA08E] text-[#5A5A40]"
                  }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider mb-2">
            Reflective Journal Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What is happening in your life right now? Writing down stressful topics can help ease mental tension..."
            className="w-full h-20 p-3 rounded-xl border border-[#E6E2D3] outline-none text-sm transition-all bg-white hover:border-[#8DA08E] focus:border-[#5A5A40] text-[#3D3D33]"
          />
        </div>

        <button
          type="submit"
          id="save-journal-btn"
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#5A5A40] hover:bg-[#3D3D33] text-white transition-colors cursor-pointer"
        >
          Check In & Save Note
        </button>
      </form>

      {/* History section */}
      {moodLog.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between border-t border-[#E6E2D3] pt-4 mb-3">
            <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Reflections History</span>
            </span>
            <span className="text-[10px] font-mono text-[#A8A892]">{moodLog.length} logs saved</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {moodLog.map((item) => {
              const pairedMood = moods.find((m) => m.label === item.mood);
              return (
                <div
                  key={item.id}
                  id={`journal-log-${item.id}`}
                  className="p-3 rounded-xl border border-[#E6E2D3] bg-[#F7F5F0]/60 flex flex-col gap-2 relative group hover:border-[#8DA08E] transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{pairedMood?.emoji || "😌"}</span>
                      <span className="font-semibold text-[#3D3D33]">{item.mood}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#A8A892] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        id={`del-journal-btn-${item.id}`}
                        className="p-1 rounded text-[#A8A892] hover:text-red-500 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.note && (
                    <p className="text-[#3D3D33]/85 font-sans leading-relaxed italic border-l-2 border-[#8DA08E] pl-2">
                      "{item.note}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
