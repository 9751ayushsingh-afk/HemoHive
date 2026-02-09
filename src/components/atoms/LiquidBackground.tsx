import React from 'react';

const LiquidBackground = () => {
  return (
    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="liquid-effect">
          <feTurbulence baseFrequency="0.02 0.02" numOctaves="1" seed="0" result="turbulence">
            <animate
              attributeName="baseFrequency"
              dur="10s"
              values="0.02 0.02;0.03 0.03;0.02 0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="20" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#B00020" filter="url(#liquid-effect)" />
    </svg>
  );
};

export default LiquidBackground;