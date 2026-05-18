interface MessengerIconProps {
  className?: string;
  /** Unique id for gradient defs when multiple icons render on one page */
  gradientId?: string;
}

/** Facebook Messenger brand mark (gradient circle + bolt). */
const MessengerIcon = ({
  className = "h-12 w-12",
  gradientId = "messenger-gradient",
}: MessengerIconProps) => {
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
          <stop stopColor="#00B2FF" />
          <stop offset="1" stopColor="#006AFF" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${gradientId})`} />
      <g transform="translate(1.75, 0)">
        <path
          fill="#fff"
          d="M34.368 16.784l-5.11-2.413a1.002 1.002 0 0 0-.96.087l-3.887 2.423-5.41-2.538a1 1 0 0 0-1.032.183l-9.31 8.558a.501.501 0 0 0 .614.757l3.84-1.85 2.52 4.73a1 1 0 0 0 1.58.215l2.615-2.475 6.158 3.24a1 1 0 0 0 1.452-.89l1.37-8.222a1 1 0 0 0-1.453-1.009z"
        />
      </g>
    </svg>
  );
};

export default MessengerIcon;
