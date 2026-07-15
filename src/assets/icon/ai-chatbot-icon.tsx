interface AiChatbotIconProps {
  className?: string;
  /** Unique id for gradient defs when multiple icons render on one page */
  gradientId?: string;
}

/** Friendly robot-face mark for the AI shopping assistant — brand-orange circle + white bot head. */
const AiChatbotIcon = ({
  className = "h-12 w-12",
  gradientId = "ai-chatbot-gradient",
}: AiChatbotIconProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="24"
          y1="0"
          x2="24"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF9142" />
          <stop offset="1" stopColor="#FF6600" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${gradientId})`} />

      {/* Antenna */}
      <line x1="24" y1="11" x2="24" y2="15.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="9.5" r="2" fill="#fff" />

      {/* Head */}
      <rect x="12" y="15.5" width="24" height="19" rx="8" fill="#fff" />

      {/* Eyes */}
      <circle cx="19.5" cy="25" r="2.4" fill={`url(#${gradientId})`} />
      <circle cx="28.5" cy="25" r="2.4" fill={`url(#${gradientId})`} />

      {/* Smile */}
      <path
        d="M18.5 30c1.7 1.7 3.6 2.5 5.5 2.5s3.8-.8 5.5-2.5"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Side ears */}
      <rect x="8.5" y="21" width="3" height="7" rx="1.5" fill="#fff" />
      <rect x="36.5" y="21" width="3" height="7" rx="1.5" fill="#fff" />
    </svg>
  );
};

export default AiChatbotIcon;
