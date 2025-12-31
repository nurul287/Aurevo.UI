import React from "react";

interface PhoneIconProps {
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
}

const PhoneIcon: React.FC<PhoneIconProps> = ({
  className,
  width = 24,
  height = 23,
  fill = "currentColor",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16.7416 14.7555L16.1342 15.3681C16.1342 15.3681 14.6908 16.8245 10.7508 12.8492C6.81082 8.87397 8.25426 7.41761 8.25426 7.41761L8.63666 7.03176C9.57879 6.08127 9.66759 4.55524 8.84559 3.44118L7.16434 1.16228C6.14703 -0.216584 4.18127 -0.398731 3.01526 0.777709L0.922463 2.88924C0.344304 3.47257 -0.0431357 4.22875 0.00385093 5.0676C0.124051 7.21365 1.08094 11.8311 6.42047 17.2184C12.0828 22.9313 17.3957 23.1584 19.5684 22.9528C20.2556 22.8879 20.8532 22.5328 21.3348 22.0468L23.2289 20.1359C24.5074 18.8458 24.1469 16.6343 22.511 15.732L19.9637 14.3269C18.8896 13.7344 17.581 13.9084 16.7416 14.7555Z"
        fill={fill}
      />
    </svg>
  );
};

export default PhoneIcon;
