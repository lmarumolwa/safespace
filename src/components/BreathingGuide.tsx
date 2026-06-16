import React, { useState, useEffect, useRef } from "react";
import { Play, Square, Wind, HelpCircle } from "lucide-react";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale";

export default function BreathingGuide() {
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase === "idle") {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(0);
      return;
    }

    // Set duration based on restorative 4-7-8 technique
    let duration = 4;
    if (phase === "inhale") duration = 4;
    else if (phase === "hold") duration = 7;
    else if (phase === "exhale") duration = 8;

    setSecondsLeft(duration);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Transition to next state
          setPhase((currentPhase) => {
            if (currentPhase === "inhale") return "hold";
            if (currentPhase === "hold") return "exhale";
            if (currentPhase === "exhale") {
              setCycles((c) => c + 1);
              return "inhale";
            }
            return "idle";
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleStart = () => {
    setCycles(0);
    setPhase("inhale");
  };

  const handleStop = () => {
    setPhase("idle");
    setCycles(0);
  };

  // Determine scaling & color of the breathing sphere
  let scaleClass = "scale-100";
  let bgClass = "bg-[#8DA08E]/10 border-[#8DA08E]/30";
  let pulseText = "Ready to Begin";
  let instruction = "Press start to cycle through the restorative 4-7-8 breathing method.";

  if (phase === "inhale") {
    scaleClass = "scale-150";
    bgClass = "bg-[#8DA08E]/25 border-[#8DA08E]/45 animate-pulse";
    pulseText = "Inhale";
    instruction = "Breathe in slowly and deeply through your nose. Feel your chest expand.";
  } else if (phase === "hold") {
    scaleClass = "scale-150";
    bgClass = "bg-[#E6DFCF]/35 border-[#E6DFCF]/55";
    pulseText = "Hold";
    instruction = "Gently maintain the breath. Rest in this still, quiet space.";
  } else if (phase === "exhale") {
    scaleClass = "scale-100";
    bgClass = "bg-[#D3DED4]/35 border-[#D3DED4]/55 animate-pulse";
    pulseText = "Exhale";
    instruction = "Release the breath fully through your mouth, relaxing your shoulders.";
  }

  return (
    <div
      id="breathing-guide"
      className="p-6 rounded-2xl border border-[#E6E2D3] bg-white/70 backdrop-blur-md text-[#3D3D33] shadow-xs"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-[#D3DED4] text-[#5A5A40]">
          <Wind className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-medium text-base tracking-tight text-[#5A5A40]">
            Grounding Breathing Space
          </h3>
          <p className="text-xs text-[#A8A892]">Provide immediate comfort for stress, worry, and panic.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6 min-h-[220px]">
        {/* Animated breathing circle */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Outermost breathing feedback border */}
          <div
            id="breathing-outer-ring"
            className={`absolute inset-0 rounded-full border-2 transition-all ease-in-out duration-[4000ms] ${
              phase === "exhale" ? "duration-[8000ms]" : ""
            } ${scaleClass} ${bgClass}`}
          />

          {/* Innermost central container */}
          <div className="relative w-24 h-24 rounded-full bg-[#3D3D33]/5 backdrop-blur-xs flex flex-col items-center justify-center border border-[#E6E2D3]">
            <span className="font-sans font-bold text-xs tracking-wider text-[#5A5A40] uppercase">
              {pulseText}
            </span>
            {phase !== "idle" && (
              <span className="text-xl font-mono font-semibold text-[#5A5A40] mt-1">
                {secondsLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Dynamic breathing directions */}
        <div className="mt-8 text-center max-w-sm px-4">
          <p className="text-xs font-mono font-medium tracking-wider text-[#8DA08E] uppercase">
            {phase !== "idle" ? `Cycle ${cycles + 1}` : "Restorative 4-7-8 Breath"}
          </p>
          <p className="text-sm font-medium text-[#3D3D33] mt-1.5 leading-relaxed min-h-[40px]">
            {instruction}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {phase === "idle" ? (
          <button
            onClick={handleStart}
            id="start-breath-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#5A5A40] hover:bg-[#3D3D33] text-white shadow-xs transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Begin Guided Breath</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            id="stop-breath-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#E6E2D3]/60 hover:bg-[#E6E2D3] text-[#3D3D33] transition-all border border-[#E6E2D3] cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>End Session</span>
          </button>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E6E2D3] flex gap-2 items-start text-[11px] text-[#A8A892]">
        <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#A8A892]" />
        <p>
          Derived from yogic breathing practices, this rhythm relaxes the heart rate, signals calmness to the amygdala, and helps steady full-body tension.
        </p>
      </div>
    </div>
  );
}
