import React from "react";

interface LocationIconProps {
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
}

const LocationIcon: React.FC<LocationIconProps> = ({
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
        d="M9 0C3.99844 0 0 3.99844 0 9C0 10.7297 0.515625 12.0656 1.41094 13.4203L8.05313 23.4984C8.25469 23.8031 8.60156 24 9 24C9.39844 24 9.75 23.7984 9.94688 23.4984L16.5891 13.4203C17.4844 12.0656 18 10.7297 18 9C18 3.99844 14.0016 0 9 0ZM9 13.9969C6.23906 13.9969 3.99844 11.7563 3.99844 8.99063C3.99844 6.225 6.23906 3.98438 9 3.98438C11.7609 3.98438 14.0016 6.225 14.0016 8.99063C14.0016 11.7563 11.7609 13.9969 9 13.9969ZM9 6C7.34062 6 6 7.34062 6 9C6 10.6594 7.34062 12 9 12C10.6594 12 12 10.6594 12 9C12 7.34062 10.6594 6 9 6Z"
        fill={fill}
      />
    </svg>
  );
};

export default LocationIcon;
