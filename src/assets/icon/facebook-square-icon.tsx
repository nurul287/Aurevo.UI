import React from "react";

interface FacebookSquareIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const FacebookSquareIcon: React.FC<FacebookSquareIconProps> = ({
  className,
  width = 24,
  height = 24,
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
      <g clipPath="url(#clip0_fb_square)">
        <path
          d="M18.5807 0H5.41931C2.42631 0 0 2.43754 0 5.44441V18.5556C0 21.5625 2.42631 24 5.41931 24H18.5807C21.5737 24 24 21.5625 24 18.5556V5.44441C24 2.43754 21.5737 0 18.5807 0Z"
          fill="#0866FF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.4537 24.0002H9.101V15.6727H6.62646V11.9887H9.101V10.4013C9.101 6.29795 10.9494 4.396 14.9593 4.396C15.7195 4.396 17.0313 4.5458 17.5679 4.69555V8.03508C17.2847 8.00513 16.7928 7.9902 16.1816 7.9902C14.2139 7.9902 13.4537 8.73897 13.4537 10.6858V11.9887H17.3733L16.7 15.6727H13.4537V24.0002Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_fb_square">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default FacebookSquareIcon;
