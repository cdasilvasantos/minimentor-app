"use client";

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
}

export default function PageLayout({ children, fullHeight = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 
                    dark:from-gray-900 dark:via-indigo-950/30 dark:to-purple-950/30 flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid_pattern.png')] bg-repeat opacity-5 pointer-events-none" />
      
      <Header />
      
      <div className={`container mx-auto px-4 ${fullHeight ? 'flex-1 flex flex-col py-0' : 'py-8'} max-w-4xl relative z-10`}>
        {fullHeight ? (
          <div className="flex-1 flex flex-col">{children}</div>
        ) : (
          children
        )}
      </div>
      
      <Footer />
    </div>
  );
}
