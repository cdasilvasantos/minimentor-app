"use client";

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 
                    dark:from-gray-900 dark:via-indigo-950/30 dark:to-purple-950/30">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid_pattern.png')] bg-repeat opacity-5 pointer-events-none" />
      
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {children}
      </div>
      
      <Footer />
    </div>
  );
}
