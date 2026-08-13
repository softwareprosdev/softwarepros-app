"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useVoiceModal } from "@/components/VoiceModalProvider";

type EngagementCard = {
  id: "speak" | "type" | "upload" | "schedule";
  icon: string;
  title: string;
  body: string;
  cta: string;
  featured?: boolean;
};

const CARDS: EngagementCard[] = [
  {
    id: "speak",
    icon: "microphone",
    title: "Speak",
    body: "Describe your project verbally to our AI architect.",
    cta: "Start Voice Call",
  },
  {
    id: "type",
    icon: "keyboard",
    title: "Type",
    body: "Chat in real-time with detailed requirements.",
    cta: "Open Chat",
  },
  {
    id: "upload",
    icon: "file-arrow-up",
    title: "Upload",
    body: "Share documents and designs for review.",
    cta: "Upload Files",
    featured: true,
  },
  {
    id: "schedule",
    icon: "calendar-check",
    title: "Schedule",
    body: "Book a discovery call with our team.",
    cta: "Book Meeting",
  },
];

export function EngagementCards() {
  const router = useRouter();
  const { open } = useVoiceModal();

  function activate(id: EngagementCard["id"]) {
    if (id === "speak") return open();
    if (id === "type") return router.push("/discovery");
    if (id === "upload") return router.push("/discovery?mode=upload");
    return router.push("/contact?intent=schedule");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {CARDS.map((card) => (
        <div
          key={card.id}
          className={`glass-card p-8 rounded-hex flex flex-col ${
            card.featured ? "ring-1 ring-primary" : ""
          }`}
        >
          <Icon name={card.icon} className="text-3xl text-primary mb-6" />
          <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
          <p className="text-gray-400 text-sm mb-8">{card.body}</p>
          <button
            type="button"
            onClick={() => activate(card.id)}
            className="mt-auto w-full py-4 border border-white/20 rounded-full font-semibold hover:bg-white hover:text-black transition-all"
          >
            {card.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
