import MessengerIcon from "@/assets/icon/messenger-icon";
import { useLocation } from "react-router-dom";

const pageId = import.meta.env.VITE_FACEBOOK_PAGE_ID?.trim();

function messengerUrl(pageIdValue: string) {
  return `https://m.me/${pageIdValue}`;
}

/**
 * Floating Messenger contact button (opens m.me chat with your Page).
 * Set VITE_FACEBOOK_PAGE_ID (e.g. from https://m.me/855862097613203).
 */
export function MessengerChat() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  if (!pageId || isAdminRoute) {
    return null;
  }

  const href = messengerUrl(pageId);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on Messenger"
      className="group fixed bottom-3 right-0 z-[9999] flex flex-col items-center overflow-visible motion-reduce:transition-none sm:bottom-6"
      style={{ paddingRight: "max(0px, env(safe-area-inset-right))" }}
    >
      <span
        className="pointer-events-none mb-2 max-w-[calc(100vw-2rem)] translate-y-1 scale-95 whitespace-nowrap rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 sm:mb-3 sm:px-4 sm:py-2 sm:text-sm"
        aria-hidden
      >
        Message Us
      </span>

      <span className="origin-center rounded-full shadow-[0_3px_14px_rgba(0,106,255,0.4)] transition-transform duration-200 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transform-none sm:shadow-[0_4px_20px_rgba(0,106,255,0.45)]">
        <MessengerIcon
          className="h-11 w-11 sm:h-14 sm:w-14"
          gradientId="messenger-fab-gradient"
        />
      </span>
    </a>
  );
}

export { messengerUrl };
