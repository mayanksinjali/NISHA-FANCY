import { whatsappGeneralUrl } from "@/lib/whatsapp";

/**
 * Small fixed WhatsApp square, mobile only. Most customers are on a phone and
 * ordering happens in chat, so keep that one action always reachable.
 */
export default function WhatsappFloat() {
  return (
    <a
      href={whatsappGeneralUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center bg-terracotta text-paper transition-colors hover:bg-terracotta-deep md:hidden"
    >
      {/* Inline SVG keeps this dependency-free */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
        aria-hidden
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.31-1.93 1.36-.53.05-1.02.24-3.42-.72-2.88-1.16-4.68-4.14-4.82-4.33-.14-.19-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.31.26-.29.56-.36.75-.36s.38 0 .55.01c.17.01.41-.07.64.49.24.58.79 1.94.86 2.08.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.12.58.17.29.75 1.25 1.62 2.02 1.11.99 2.05 1.3 2.34 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.26.1 1.66.78 1.95.92.29.14.48.22.55.34.07.12.07.72-.17 1.4Z" />
      </svg>
    </a>
  );
}
