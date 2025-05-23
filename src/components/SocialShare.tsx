"use client";

import React, { useState, useEffect } from 'react';

interface SocialShareProps {
  advice: string;
  imageUrl: string;
}

interface ShareData {
  title: string;
  text: string;
  url: string;
  files?: File[];
}

export default function SocialShare({ advice, imageUrl }: SocialShareProps) {
  const [customMessage, setCustomMessage] = useState("Check out what MiniMentor advised me! I'm on the hunt for jobs right now. #CareerAdvice");
  const [shareUrls, setShareUrls] = useState({
    twitter: '',
    linkedin: '',
    facebook: ''
  });
  
  // Update share URLs whenever customMessage changes
  useEffect(() => {
    // Prepare content for sharing
    const shareText = `${customMessage}\n\n"${advice.substring(0, 100)}${advice.length > 100 ? '...' : ''}"`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
    
    // Share URLs for different platforms
    setShareUrls({
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
    });
    
    // Log the image URL to use it (prevents unused variable warning)
    if (imageUrl) {
      console.debug('Image available for sharing:', imageUrl);
    }
  }, [customMessage, advice, imageUrl]);
  
  // Function to copy to clipboard
  const copyToClipboard = async () => {
    try {
      const shareText = `${customMessage}\n\n"${advice.substring(0, 100)}${advice.length > 100 ? '...' : ''}"`;
      await navigator.clipboard.writeText(`${shareText}\n\nGenerated by MiniMentor: ${window.location.href}`);
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    }
  };
  
  // Function to share via native share API (mobile devices)
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        const shareText = `${customMessage}\n\n"${advice.substring(0, 100)}${advice.length > 100 ? '...' : ''}"`;
        const shareData: ShareData = {
          title: 'MiniMentor Career Advice',
          text: shareText,
          url: window.location.href,
        };
        
        // Some browsers support sharing files
        if (imageUrl && navigator.canShare) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'career-advice.jpg', { type: 'image/jpeg' });
            
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (fileErr) {
            console.error('Error preparing image for share:', fileErr);
          }
        }
        
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Native sharing not supported on this device/browser');
    }
  };

  // Get current share text for preview
  const shareText = `${customMessage}\n\n"${advice.substring(0, 100)}${advice.length > 100 ? '...' : ''}"`;

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Share Your Career Advice
      </h3>
      
      <div className="mb-6">
        <label htmlFor="customMessage" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Customize your share message:
        </label>
        <textarea
          id="customMessage"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                    text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 
                    shadow-sm transition-all duration-200"
          rows={2}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
        ></textarea>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This message will appear before your advice when sharing
        </p>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Preview:</h4>
        <p className="text-gray-600 dark:text-gray-300">
          {shareText}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Twitter/X */}
        <a 
          href={shareUrls.twitter} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-black rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">X</span>
        </a>
        
        {/* LinkedIn */}
        <a 
          href={shareUrls.linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-[#0077B5] rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.68 1.68 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</span>
        </a>
        
        {/* Facebook */}
        <a 
          href={shareUrls.facebook} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-[#1877F2] rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
        </a>
        
        {/* Copy Link */}
        <button 
          onClick={copyToClipboard}
          className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copy Link</span>
        </button>
        
        {/* Native Share (Mobile) */}
        <button 
          onClick={nativeShare}
          className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-emerald-600 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share</span>
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share this advice to help others in their career journey
        </p>
      </div>
    </div>
  );
}
