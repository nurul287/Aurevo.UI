import React from "react";

interface TikTokIconProps {
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
}

const TikTokIcon: React.FC<TikTokIconProps> = ({
  className,
  width = 24,
  height = 24,
  fill = "currentColor",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1V9.4a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.7a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.48z"
        fill={fill}
      />
</svg>
  );
};

export default TikTokIcon;
