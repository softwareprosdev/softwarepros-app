import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ORG_PHONE_E164 } from "@/lib/org";

type EngagementCard = {
  id: "speak" | "type" | "upload" | "schedule";
  icon: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  featured?: boolean;
};

const CARDS: EngagementCard[] = [
  {
    id: "speak",
    icon: "microphone",
    title: "Speak",
    body: "Prefer to talk it through? Call us directly.",
    cta: "Call Us",
    href: `tel:${ORG_PHONE_E164}`,
  },
  {
    id: "type",
    icon: "keyboard",
    title: "Type",
    body: "Describe your project in writing and an engineer follows up.",
    cta: "Start a Project",
    href: "/discovery",
  },
  {
    id: "upload",
    icon: "file-arrow-up",
    title: "Upload",
    body: "Share documents and designs for review.",
    cta: "Get Started",
    href: "/discovery",
    featured: true,
  },
  {
    id: "schedule",
    icon: "calendar-check",
    title: "Schedule",
    body: "Book a discovery call with our team.",
    cta: "Book Meeting",
    href: "/contact?intent=schedule",
  },
];

export function EngagementCards() {
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
          <Link
            href={card.href}
            className="mt-auto w-full py-4 border border-white/20 rounded-full font-semibold hover:bg-white hover:text-black transition-all text-center"
          >
            {card.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
