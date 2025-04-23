"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      
      <div className="container mx-auto px-4 py-6 flex flex-col items-center relative z-10">
        <Link href="/" className="group">
          <div className="flex flex-col items-center transition-transform duration-300 group-hover:scale-105">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
              MiniMentor
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-2 
                           transition-all duration-300 group-hover:w-32" />
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
              AI-Generated Career Advice
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
