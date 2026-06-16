import React, { useState } from "react";
import { Phone, Copy, Check, ShieldAlert, HeartHandshake, ExternalLink } from "lucide-react";

interface Contact {
  name: string;
  number: string;
  description: string;
  subText?: string;
}

export const helplines: Contact[] = [
  {
    name: "SADAG Suicide Crisis Helpline",
    number: "0800 567 567",
    description: "24/7 emergency line operated by the South African Depression and Anxiety Group.",
    subText: "Toll-free from any South African network.",
  },
  {
    name: "SADAG Mental Health Line",
    number: "011 234 4837",
    description: "Support line for coping with panic, depression, general anxiety, and mental stress.",
    subText: "Standard regional call rates apply.",
  },
  {
    name: "LifeLine South Africa",
    number: "0861 322 322",
    description: "24/7 telephone counseling, emotional support, and healing dialogue.",
    subText: "Confidential and empathetic listing.",
  },
  {
    name: "DSD Substance Abuse Line",
    number: "0800 12 13 14",
    description: "Department of Social Development's direct line for dependency and abuse support.",
    subText: "Toll-free crisis assistance.",
  },
];

export default function HelplineHub({ highlightUrgent = false }: { highlightUrgent?: boolean }) {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number.replace(/\s+/g, ""));
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div
      id="helpline-hub"
      className={`rounded-2xl border transition-all duration-300 ${
        highlightUrgent
          ? "border-[#E6E2D3] border-l-4 border-l-rose-400 bg-[#F9F7F2] shadow-sm text-[#3D3D33]"
          : "border-[#E6E2D3] bg-white/70 backdrop-blur-md text-[#3D3D33]"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-2.5 rounded-xl ${
              highlightUrgent ? "bg-rose-50 text-rose-750" : "bg-[#D3DED4] text-[#5A5A40]"
            }`}
          >
            {highlightUrgent ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : (
              <HeartHandshake className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-serif font-medium text-lg tracking-tight text-[#5A5A40]">
              {highlightUrgent ? "Immediate Professional Assistance" : "South African Support Helplines"}
            </h3>
            <p className="text-xs mt-1 text-[#A8A892] leading-relaxed">
              {highlightUrgent
                ? "If you or someone you know is in severe distress or expressing thoughts of self-harm, please connect with these crisis counseling teams instantly. Help is available."
                : "Free, confidential, and compassionate professional services available 24 hours a day."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-4">
          {helplines.map((item, index) => {
            const isCopied = copiedNumber === item.number;
            return (
              <div
                key={index}
                id={`helpline-item-${index}`}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  highlightUrgent
                    ? "border-rose-100 bg-white/60 hover:bg-white/90"
                    : "border-[#E6E2D3] bg-[#F7F5F0]/55 hover:bg-[#F7F5F0]"
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-[#3D3D33]">{item.name}</h4>
                  <p className="text-xs text-[#5A5A40] mt-1 max-w-sm">{item.description}</p>
                  {item.subText && <p className="text-[10px] font-mono mt-1 text-[#A8A892]">{item.subText}</p>}
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <a
                    href={`tel:${item.number.replace(/\s+/g, "")}`}
                    id={`tel-link-${index}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5A5A40] hover:bg-[#3D3D33] text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-serif text-sm">{item.number}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(item.number)}
                    id={`copy-btn-${index}`}
                    className="p-2 rounded-lg border border-[#E6E2D3] text-[#A8A892] hover:text-[#3D3D33] hover:bg-white transition-all bg-transparent cursor-pointer"
                    title="Copy number"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-[#E6E2D3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#A8A892]">
            SADAG represents Africa's largest mental health support advocacy group.
          </p>
          <a
            href="https://www.sadag.org"
            target="_blank"
            referrerPolicy="no-referrer"
            id="sadag-web-link"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8DA08E] hover:underline hover:text-[#5A5A40] cursor-pointer"
          >
            <span>Visit SADAG Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
