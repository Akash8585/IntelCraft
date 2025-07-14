import React from 'react';
interface HeaderProps {
  glassStyle: string;
}

const Header: React.FC<HeaderProps> = ({ glassStyle }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load Tavily logo');
    console.log('Image path:', e.currentTarget.src);
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="relative mb-16">
      <div className="text-center pt-4">
        <h1 className="text-[48px] font-medium text-[#1a202c] font-['DM_Sans'] tracking-[-1px] leading-[52px] text-center mx-auto antialiased">
          Company Research Agent
        </h1>
        <p className="text-gray-600 text-lg font-['DM_Sans'] mt-4">
          Conduct in-depth company diligence powered by Tavily
        </p>
      </div>
    </div>
  );
};

export default Header; 