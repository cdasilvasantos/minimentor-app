"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { checkAuth, signOut } from '@/utils/authUtils';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkUserAuth = () => {
      const session = checkAuth();
      setIsLoggedIn(!!session);
    };

    checkUserAuth();
  }, [pathname]);

  const handleSignOut = () => {
    signOut();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      
      <div className="container mx-auto px-4 py-6 flex flex-col items-center relative z-10">
        <div className="w-full flex justify-between items-center">
          <Link href="/" className="group">
            <div className="flex flex-col items-center transition-transform duration-300 group-hover:scale-105">
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
                MiniMentor
              </h1>
              <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-2 
                            transition-all duration-300 group-hover:w-32" />
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">
                AI-Generated Career Advice
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" active={pathname === "/"}>Home</NavLink>
            <NavLink href="/chat" active={pathname === "/chat"}>Chat</NavLink>
            {isLoggedIn ? (
              <>
                <NavLink href="/profile" active={pathname === "/profile"}>Profile</NavLink>
                <button 
                  onClick={handleSignOut}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden w-full mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3">
            <MobileNavLink href="/" active={pathname === "/"} onClick={toggleMobileMenu}>Home</MobileNavLink>
            <MobileNavLink href="/chat" active={pathname === "/chat"} onClick={toggleMobileMenu}>Chat</MobileNavLink>
            {isLoggedIn ? (
              <>
                <MobileNavLink href="/profile" active={pathname === "/profile"} onClick={toggleMobileMenu}>Profile</MobileNavLink>
                <button
                  onClick={() => {
                    handleSignOut();
                    toggleMobileMenu();
                  }}
                  className="w-full text-left py-2 px-4 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <MobileNavLink href="/auth" active={pathname === "/auth"} onClick={toggleMobileMenu}>Sign In</MobileNavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className={`font-medium transition-colors ${
        active 
          ? 'text-indigo-600 dark:text-indigo-400' 
          : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
    >
      {children}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, active, onClick, children }: MobileNavLinkProps) {
  return (
    <Link 
      href={href} 
      className={`block py-2 px-4 rounded-md ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
