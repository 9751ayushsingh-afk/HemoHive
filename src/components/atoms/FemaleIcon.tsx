import React from 'react';

interface FemaleIconProps {
    className?: string;
}

const FemaleIcon: React.FC<FemaleIconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 380.146 380.146" className={className}>
        <path fill="currentColor" d="M210.073 246.994v25.175h20.285c11.046 0 20 8.954 20 20s-8.954 20-20 20h-20.285v20.285c0 11.046-8.954 20-20 20s-20-8.954-20-20v-20.285h-20.285c-11.046 0-20-8.954-20-20s8.954-20 20-20h20.285v-25.175c-49.25-9.388-86.597-52.764-86.597-104.706 0-58.777 47.819-106.596 106.597-106.596 0-58.778 47.819-106.597 106.597-106.597 58.778 0 106.596 47.819 106.596 106.597c0 51.942-37.347 95.318-86.596 104.706z" />
    </svg>
);

export default FemaleIcon;
