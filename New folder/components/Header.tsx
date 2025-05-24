
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="p-4 bg-slate-800/70 backdrop-blur-md shadow-lg sticky top-0 z-10">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
        {title}
      </h1>
      <p className="text-center text-sm text-slate-400 mt-1">Your AI-powered professional growth partner</p>
    </header>
  );
};

export default Header;
    