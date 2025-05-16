"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import { saveToHistory, checkAuth, getUser, getChatHistory } from "@/utils/authUtils";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  audioUrl?: string;
  imagePrompt?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generateVisual, setGenerateVisual] = useState(true);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userField, setUserField] = useState<string>("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  
  // Check authentication status and load conversation from URL if present
  useEffect(() => {
    const session = checkAuth();
    setIsLoggedIn(!!session);
    
    if (session) {
      setUsername(session.user.username);
      setUserId(session.user.id);
      
      // Try to load user's field from localStorage if they've previously mentioned it
      const savedField = localStorage.getItem(`userField_${session.user.id}`);
      if (savedField) {
        setUserField(savedField);
      }
    }
    
    // Check for conversation ID in URL
    const params = new URLSearchParams(window.location.search);
    const conversationParam = params.get('conversation');
    
    if (conversationParam) {
      setConversationId(conversationParam);
      loadConversation(conversationParam);
    }
  }, []);
  
  // Function to load an existing conversation
  const loadConversation = (id: string) => {
    try {
      const chatHistory = getChatHistory();
      const conversation = chatHistory.find(chat => chat.id === id);
      
      if (conversation) {
        // Extract user field if available
        if (conversation.userField) {
          setUserField(conversation.userField);
        }
        
        // Clear existing messages when loading a conversation
        setMessages([]);
        
        // Make sure we have messages to load
        if (!conversation.messages || conversation.messages.length === 0) {
          setError("This conversation appears to be empty. Starting a new chat.");
          return;
        }
        
        // Convert the stored messages to the Message format with unique IDs
        const loadedMessages = conversation.messages.map(msg => ({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          type: msg.type as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          imageUrl: msg.imageUrl || undefined,
          audioUrl: msg.audioUrl || undefined,
          imagePrompt: msg.imagePrompt || undefined
        }));
        
        console.log("Loading conversation:", id, "with", loadedMessages.length, "messages");
        
        // Set the messages after a brief delay to ensure proper rendering
        setTimeout(() => {
          setMessages(loadedMessages);
          
          // Scroll to bottom after messages are loaded
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }, 50);
        
        // Store the conversation ID for this session
        sessionStorage.setItem('currentConversationId', id);
      } else {
        setError("Conversation not found. Starting a new chat.");
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Failed to load conversation. Starting a new chat.");
    }
  };
  
  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: isLoggedIn 
            ? `Hi ${username}! Welcome back to MiniMentor. What career questions can I help you with today?` 
            : 'Hi there! I\'m MiniMentor, your interactive career coach. What career questions or challenges can I help you with today?',
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length, isLoggedIn, username]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle audio playback
  useEffect(() => {
    // Cleanup function to stop all audio when component unmounts
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
      });
    };
  }, []);
  
  // Get prompt from URL if available
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt && input === "" && messages.length === 1) {
      setInput(urlPrompt);
    }
  }, [input, messages.length]);
  
  const toggleAudio = (messageId: string, audioUrl: string) => {
    if (!audioRefs.current[messageId]) {
      audioRefs.current[messageId] = new Audio(audioUrl);
      
      // Add event listeners
      audioRefs.current[messageId].addEventListener('ended', () => setIsPlaying(null));
      audioRefs.current[messageId].addEventListener('pause', () => setIsPlaying(null));
    }
    
    if (isPlaying === messageId) {
      audioRefs.current[messageId].pause();
      setIsPlaying(null);
    } else {
      // Pause any currently playing audio
      if (isPlaying && audioRefs.current[isPlaying]) {
        audioRefs.current[isPlaying].pause();
      }
      
      audioRefs.current[messageId].play();
      setIsPlaying(messageId);
    }
  };
  
  // Function to handle image generation based on conversation
  const handleGenerateImage = async (message: Message) => {
    // Set loading state for this specific message
    setIsGeneratingImage(message.id);
    setError("");
    
    try {
      // Get conversation context - use the current message and previous messages for context
      const conversationContext = messages
        .slice(0, messages.findIndex(m => m.id === message.id) + 1)
        .map(m => m.content)
        .join("\n");
      
      // Call the API to generate an image
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messageId: message.id,
          conversationContext,
          messageContent: message.content
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }
      
      const data = await response.json();
      
      // Update the message with the generated image
      setMessages(prev => 
        prev.map(m => 
          m.id === message.id 
            ? { ...m, imageUrl: data.imageUrl, imagePrompt: data.imagePrompt } 
            : m
        )
      );
      
      // Save to history with the new image and the entire conversation
      try {
        const updatedMessage = messages.find(m => m.id === message.id);
        if (updatedMessage) {
          // Update the message in our messages array
          const updatedMessages = messages.map(m => 
            m.id === message.id 
              ? { ...m, imageUrl: data.imageUrl, imagePrompt: data.imagePrompt } 
              : m
          );
          
          saveToHistory({
            prompt: updatedMessage.type === 'assistant' ? messages.find(m => m.type === 'user')?.content || '' : updatedMessage.content,
            advice: updatedMessage.type === 'assistant' ? updatedMessage.content : '',
            imageUrl: data.imageUrl,
            audioUrl: updatedMessage.audioUrl,
            imagePrompt: data.imagePrompt,
            conversationId: sessionStorage.getItem('currentConversationId') || undefined
          }, updatedMessages);
          
          // Store the conversation ID for this session if not already set
          if (!sessionStorage.getItem('currentConversationId')) {
            const conversationId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            sessionStorage.setItem('currentConversationId', conversationId);
          }
        }
      } catch (storageError) {
        console.warn("Storage quota exceeded when saving to history", storageError);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGeneratingImage(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");
    
    try {
      // Use the conversation history for context
      const conversationHistory = [...messages, userMessage].map(msg => ({
        type: msg.type,
        content: msg.content
      }));
      
      // Check for field mentions in the current message
      const fieldPatterns = [
        { pattern: /(?:i am|i'm|as) an? (software|web|frontend|backend|full.?stack) (developer|engineer)/i, field: 'software development' },
        { pattern: /(?:i am|i'm|as) an? (ux|ui|product|graphic|visual) (designer)/i, field: 'design' },
        { pattern: /(?:i am|i'm|as) an? (data scientist|data analyst|machine learning|ml|ai)/i, field: 'data science' },
        { pattern: /(?:i am|i'm|as) an? (marketing|seo|content|social media)/i, field: 'marketing' },
        { pattern: /(?:i am|i'm|as) an? (project manager|product manager|scrum master|agile coach)/i, field: 'project management' },
        { pattern: /(?:i am|i'm|as) an? (finance|accounting|financial)/i, field: 'finance' },
        { pattern: /(?:i am|i'm|as) an? (hr|human resources|talent|recruiting)/i, field: 'human resources' },
        { pattern: /(?:i am|i'm|as) an? (sales|business development|account)/i, field: 'sales' },
        { pattern: /(?:i am|i'm|as) an? (teacher|professor|educator|instructor)/i, field: 'education' },
        { pattern: /(?:i am|i'm|as) an? (healthcare|doctor|nurse|medical)/i, field: 'healthcare' },
        { pattern: /(?:i am|i'm|as) an? (legal|lawyer|attorney)/i, field: 'legal' },
        { pattern: /(?:i work|working) in (software|tech|design|marketing|finance|healthcare|education|legal|sales)/i, field: (match: any) => match[1].toLowerCase() },
        { pattern: /(?:my field is|my industry is|my sector is) (software|tech|design|marketing|finance|healthcare|education|legal|sales)/i, field: (match: any) => match[1].toLowerCase() },
      ];
      
      const content = userMessage.content.toLowerCase();
      for (const { pattern, field } of fieldPatterns) {
        const match = content.match(pattern);
        if (match) {
          const detectedField = typeof field === 'function' ? field(match) : field;
          setUserField(detectedField);
          
          // Save the field for future sessions if user is logged in
          if (userId) {
            localStorage.setItem(`userField_${userId}`, detectedField);
          }
          break;
        }
      }
      
      const response = await fetch("/api/chat-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: conversationHistory,
          generateVisual,
          generateAudio,
          userField,
          userId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate response");
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.advice,
        timestamp: new Date(),
        imageUrl: data.imageUrl,
        audioUrl: data.audioUrl,
        imagePrompt: data.imagePrompt
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save entire conversation to history
      try {
        // Include all messages in the conversation, including the welcome message
        const allMessages = [...messages, userMessage, assistantMessage];
        
        // Create a title from the first user message for better identification
        const firstUserMessage = allMessages.find(m => m.type === 'user');
        const title = firstUserMessage ? 
          (firstUserMessage.content.length > 50 ? 
            firstUserMessage.content.substring(0, 50) + '...' : 
            firstUserMessage.content) : 
          'Chat conversation';
          
        saveToHistory({
          prompt: userMessage.content,
          advice: data.advice,
          imageUrl: data.imageUrl,
          audioUrl: data.audioUrl,
          imagePrompt: data.imagePrompt,
          conversationId: sessionStorage.getItem('currentConversationId') || undefined,
          userField: userField || undefined,
          title: title // Add title for better identification
        }, allMessages);
        
        // Store the conversation ID for this session
        if (!sessionStorage.getItem('currentConversationId')) {
          const conversationId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          sessionStorage.setItem('currentConversationId', conversationId);
        }
      } catch (storageError) {
        console.warn("Storage quota exceeded when saving to history", storageError);
        // We'll still show the message in the chat, just won't save to history
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderAdviceWithFormatting = (advice: string) => {
    if (!advice) return null;
    
    // Process the advice text to handle markdown formatting
    const processedAdvice = advice
      // Replace markdown headers (###) with styled headers
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mt-6 mb-3">$1</h3>')
      // Replace markdown headers (##) with styled headers
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mt-6 mb-3">$1</h2>')
      // Replace markdown headers (#) with styled headers
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-6 mb-4">$1</h1>')
      // Replace bold text (**text**) with styled bold text
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      // Replace italic text (*text*) with styled italic text
      .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
      // Replace numbered lists (1. item) with styled lists
      .replace(/^(\d+)\.\s+(.*$)/gm, '<div class="flex items-start mb-2"><span class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">$1</span><span>$2</span></div>')
      // Replace bullet points (* item or - item) with styled lists
      .replace(/^[\*\-]\s+(.*$)/gm, '<div class="flex items-start mb-2"><span class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-2 h-2 rounded-full mr-2 mt-2 flex-shrink-0"></span><span>$1</span></div>');
    
    // Split by double newlines to separate paragraphs
    const paragraphs = processedAdvice.split('\n\n');
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          // If the paragraph contains HTML (from our replacements above)
          if (paragraph.includes('<h1') || 
              paragraph.includes('<h2') || 
              paragraph.includes('<h3') || 
              paragraph.includes('<span') || 
              paragraph.includes('<div')) {
            return (
              <div 
                key={index} 
                dangerouslySetInnerHTML={{ __html: paragraph }}
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              />
            );
          }
          
          // Regular paragraph
          if (paragraph.trim()) {
            return (
              <p 
                key={index} 
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                {paragraph}
              </p>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
  return (
    <PageLayout fullHeight>
      <div className="flex flex-col h-full w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto pb-20 px-2 md:px-4">
          <div className="max-w-5xl mx-auto space-y-6 pt-4 w-full">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {message.type === 'assistant' && (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 mr-3 flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div 
                  className={`rounded-2xl p-4 max-w-[90%] md:max-w-[80%] shadow-md transition-all duration-300 hover:shadow-lg
                    ${message.type === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none backdrop-blur-sm' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none backdrop-blur-sm'}`}
                >
                  {message.type === 'user' ? (
                    <div className="text-white">
                      {message.content}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {renderAdviceWithFormatting(message.content)}
                      
                      {message.imageUrl && (
                        <div className="mt-4 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] group">
                          <div className="relative">
                            <Image 
                              src={message.imageUrl} 
                              alt="Career advice infographic"
                              width={500}
                              height={300}
                              className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-3">
                              <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                                AI Generated Visual
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons for assistant messages */}
                      {message.type === 'assistant' && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {/* Copy text button */}
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              // Could add a toast notification here
                            }}
                            className="flex items-center px-3 py-1.5 rounded-full text-sm
                                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                     hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            aria-label="Copy text to clipboard"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            <span className="font-medium">Copy</span>
                          </button>
                          
                          {/* Audio button - only show if audio is available */}
                          {message.audioUrl && (
                            <button 
                              onClick={() => toggleAudio(message.id, message.audioUrl!)}
                              className={`flex items-center px-3 py-1.5 rounded-full text-sm
                                         ${isPlaying === message.id 
                                           ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                                           : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}
                                         transition-colors duration-200`}
                              aria-label={isPlaying === message.id ? "Pause audio narration" : "Play audio narration"}
                            >
                              {isPlaying === message.id ? (
                                <div className="flex items-center">
                                  <div className="flex items-end space-x-0.5 mr-2 h-3">
                                    <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate]"></div>
                                    <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate_0.2s]"></div>
                                    <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate_0.3s]"></div>
                                    <div className="w-0.5 bg-white dark:bg-white rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_alternate_0.4s]"></div>
                                  </div>
                                  <span className="font-medium">Playing</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Listen</span>
                                </div>
                              )}
                            </button>
                          )}
                          
                          {/* Generate image button */}
                          <button 
                            onClick={() => handleGenerateImage(message)}
                            disabled={isGeneratingImage === message.id}
                            className={`flex items-center px-3 py-1.5 rounded-full text-sm
                                     ${isGeneratingImage === message.id 
                                       ? 'bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' 
                                       : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'}
                                     transition-colors duration-200`}
                            aria-label="Generate image based on conversation"
                          >
                            {isGeneratingImage === message.id ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-medium">Generating...</span>
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Generate Image</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 ml-3 flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 mr-3 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg p-3 text-sm max-w-md shadow-md border border-red-200 dark:border-red-800">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area */}
        <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <div className="max-w-5xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isLoggedIn ? `MiniMentor (Logged in as ${username})` : 'MiniMentor'}
                </h3>
              </div>
              
              <div className="relative">
                <textarea
                  className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 
                            text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 
                            shadow-sm transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Ask a career question... (Press Enter to send)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !isLoading) {
                        handleSubmit(e);
                      }
                    } else if (e.key === 'Enter' && e.shiftKey) {
                      // Allow Shift+Enter for new lines
                      return;
                    }
                  }}
                  disabled={isLoading}
                ></textarea>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 bottom-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                            text-white font-medium p-2 rounded-lg shadow-md hover:shadow-lg 
                            transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
                            transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
