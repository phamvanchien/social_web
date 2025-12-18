import React from "react";

type IconShareProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

const IconShare: React.FC<IconShareProps> = ({ size = 20, className, ...props }) => {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 8L10.7 0.5V4.25C7.3 4.25 0.5 6.5 0.5 15.5C0.5 14.2496 2.54 11.75 10.7 11.75V15.5L17.5 8Z" fill="white" stroke="#5B5252" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};

export default IconShare;