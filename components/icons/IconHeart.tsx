import React from "react";

type IconHeartProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  borderColor?: string
  background?: string
};

// oklch(63.7% .237 25.331)

const IconHeart: React.FC<IconHeartProps> = ({ size = 20, background = 'white', borderColor = '#5B5252' }) => {
  return (
    <svg width={size} height={size * 15 / 17} viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.9971 0.5C14.4352 0.5 16.4998 2.44121 16.5 4.94434C16.5 6.6046 15.8175 8.03764 14.8438 9.27246L14.6455 9.5166C13.5687 10.8055 12.1678 11.8999 10.8682 12.8369L8.61523 14.4609C8.57804 14.4876 8.53816 14.5 8.5 14.5C8.46172 14.5 8.42109 14.4878 8.38379 14.4609H8.38477L6.13184 12.8369C4.83299 11.8997 3.43124 10.8056 2.35352 9.5166C1.27626 8.22749 0.5 6.71512 0.5 4.94434C0.500152 2.44121 2.56482 0.5 5.00293 0.5C6.22445 0.500024 7.3291 1.11159 8.14258 1.94434L8.5 2.31055L8.85742 1.94434C9.67095 1.11155 10.7746 0.500024 11.9971 0.5Z" fill={background} stroke={borderColor}/>
    </svg>
  );
};

export default IconHeart;