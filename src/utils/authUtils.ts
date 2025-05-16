// Simple authentication utilities using localStorage
// This is a simplified auth system for demo purposes

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthSession {
  user: User;
  expiresAt: number; // timestamp
}

interface StoredUser {
  id: string;
  email: string;
  password: string;
  username: string;
  createdAt: string;
}

export interface MentorHistoryItem {
  id: string;
  created_at: string;
  prompt: string;
  advice: string;
  imageUrl: string;
  audioUrl: string;
  imagePrompt: string;
  conversationId?: string;
  [key: string]: string | undefined;
}

// Check if user is authenticated
export const checkAuth = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;
  
  const sessionStr = localStorage.getItem('userSession');
  if (!sessionStr) return null;
  
  try {
    const session = JSON.parse(sessionStr) as AuthSession;
    
    // Check if session is expired (24 hours)
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem('userSession');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to parse auth session:', error);
    return null;
  }
};

// Sign in user
export const signIn = (email: string, password: string): Promise<AuthSession> => {
  return new Promise((resolve, reject) => {
    // For demo purposes, we'll accept any email/password combo with basic validation
    if (!email.includes('@') || password.length < 6) {
      reject(new Error('Invalid email or password (must be at least 6 characters)'));
      return;
    }
    
    // Try to find the user in localStorage
    const usersStr = localStorage.getItem('users');
    if (!usersStr) {
      reject(new Error('User not found. Please sign up first.'));
      return;
    }
    
    const users = JSON.parse(usersStr) as StoredUser[];
    const user = users.find((u) => u.email === email);
    
    if (!user) {
      reject(new Error('User not found. Please sign up first.'));
      return;
    }
    
    if (user.password !== password) {
      reject(new Error('Incorrect password.'));
      return;
    }
    
    const session: AuthSession = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    };
    
    localStorage.setItem('userSession', JSON.stringify(session));
    resolve(session);
  });
};

// Sign up user
export const signUp = (email: string, password: string, username: string): Promise<AuthSession> => {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!email.includes('@')) {
      reject(new Error('Invalid email address.'));
      return;
    }
    
    if (password.length < 6) {
      reject(new Error('Password must be at least 6 characters.'));
      return;
    }
    
    if (!username || username.length < 3) {
      reject(new Error('Username must be at least 3 characters.'));
      return;
    }
    
    // Create a user ID based on email
    const userId = btoa(email).replace(/=/g, '');
    
    // Check if user already exists
    const usersStr = localStorage.getItem('users');
    const users = usersStr ? JSON.parse(usersStr) as StoredUser[] : [];
    
    if (users.some((u) => u.email === email)) {
      reject(new Error('User with this email already exists.'));
      return;
    }
    
    if (users.some((u) => u.username === username)) {
      reject(new Error('Username already taken.'));
      return;
    }
    
    // Add new user
    const newUser: StoredUser = {
      id: userId,
      email,
      password,
      username,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Create session
    const session: AuthSession = {
      user: {
        id: userId,
        email,
        username
      },
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    };
    
    localStorage.setItem('userSession', JSON.stringify(session));
    resolve(session);
  });
};

// Update user profile
export const updateProfile = (userId: string, updates: { username?: string }): Promise<User> => {
  return new Promise((resolve, reject) => {
    const usersStr = localStorage.getItem('users');
    if (!usersStr) {
      reject(new Error('User database not found.'));
      return;
    }
    
    const users = JSON.parse(usersStr) as StoredUser[];
    const userIndex = users.findIndex((u) => u.id === userId);
    
    if (userIndex === -1) {
      reject(new Error('User not found.'));
      return;
    }
    
    // Check if username is already taken by another user
    if (updates.username && 
        users.some((u) => u.username === updates.username && u.id !== userId)) {
      reject(new Error('Username already taken.'));
      return;
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update session if exists
    const sessionStr = localStorage.getItem('userSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr) as AuthSession;
      session.user = {
        ...session.user,
        ...updates
      };
      localStorage.setItem('userSession', JSON.stringify(session));
    }
    
    resolve({
      id: users[userIndex].id,
      email: users[userIndex].email,
      username: users[userIndex].username
    });
  });
};

// Sign out user
export const signOut = (): void => {
  localStorage.removeItem('userSession');
};

// Get user data
export const getUser = (): User | null => {
  const session = checkAuth();
  return session?.user || null;
};

// Generate a unique ID (combination of timestamp and random string)
const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

// Interface for chat conversation history
export interface ChatConversation {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  userField?: string;
  messages: {
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
    imageUrl?: string;
    audioUrl?: string;
    imagePrompt?: string;
  }[];
}

// Save chat conversation to history
export const saveToHistory = (data: Partial<MentorHistoryItem>, allMessages?: any[]): void => {
  try {
    const user = getUser();
    const historyKey = user ? `mentorHistory_${user.id}` : 'mentorHistory';
    const chatHistoryKey = user ? `chatHistory_${user.id}` : 'chatHistory';
    const maxItems = user ? 20 : 10; // Keep more items for authenticated users
    
    // Get existing history
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]') as MentorHistoryItem[];
    const chatHistory = JSON.parse(localStorage.getItem(chatHistoryKey) || '[]') as ChatConversation[];
    
    // Create new history item for backward compatibility
    const newItem: MentorHistoryItem = {
      id: generateUniqueId(),
      created_at: new Date().toISOString(),
      prompt: data.prompt || '',
      advice: data.advice || '',
      imageUrl: data.imageUrl || '',
      audioUrl: data.audioUrl || '',
      imagePrompt: data.imagePrompt || ''
    };
    
    // Try to save with the new item
    try {
      // Add new item at the beginning for backward compatibility
      history.unshift(newItem);
      
      // Keep only the most recent items
      const trimmedHistory = history.slice(0, maxItems);
      
      // Save the traditional history for backward compatibility
      localStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
      
      // If we have all messages, save the entire conversation
      if (allMessages && allMessages.length > 0) {
        // Check if we already have a conversation with this ID
        const conversationId = data.conversationId || generateUniqueId();
        const existingConversationIndex = chatHistory.findIndex(c => c.id === conversationId);
        
        if (existingConversationIndex >= 0) {
          // Update existing conversation
          chatHistory[existingConversationIndex].updated_at = new Date().toISOString();
          // Update title if provided
          if (data.title) {
            chatHistory[existingConversationIndex].title = data.title;
          }
          // Update userField if provided
          if (data.userField) {
            chatHistory[existingConversationIndex].userField = data.userField;
          }
          // Save all messages with proper timestamp handling
          chatHistory[existingConversationIndex].messages = allMessages.map(m => ({
            type: m.type,
            content: m.content,
            timestamp: m.timestamp ? 
              (typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString()) : 
              new Date().toISOString(),
            imageUrl: m.imageUrl || '',
            audioUrl: m.audioUrl || '',
            imagePrompt: m.imagePrompt || ''
          }));
        } else {
          // Create new conversation
          const newConversation: ChatConversation = {
            id: conversationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            title: data.title || data.prompt?.substring(0, 50) + '...' || 'Chat conversation',
            userField: data.userField,
            messages: allMessages.map(m => ({
              type: m.type,
              content: m.content,
              timestamp: m.timestamp ? 
                (typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString()) : 
                new Date().toISOString(),
              imageUrl: m.imageUrl || '',
              audioUrl: m.audioUrl || '',
              imagePrompt: m.imagePrompt || ''
            }))
          };
          
          chatHistory.unshift(newConversation);
        }
        
        // Keep only the most recent conversations
        const trimmedChatHistory = chatHistory.slice(0, maxItems);
        
        // Save the chat history
        localStorage.setItem(chatHistoryKey, JSON.stringify(trimmedChatHistory));
      }
    } catch (storageError) {
      console.warn('Storage quota exceeded, reducing data size...');
      
      // If we hit quota limits, we need to reduce data size
      
      // First try: Remove audio data from older items (it's usually the largest)
      const reducedHistory = history.map((item, index) => {
        // Keep audio only for the newest 3 items
        if (index >= 3) {
          return { ...item, audioUrl: '' };
        }
        return item;
      });
      
      try {
        localStorage.setItem(historyKey, JSON.stringify(reducedHistory.slice(0, maxItems)));
      } catch (secondError) {
        // Second try: Remove image data from older items too
        const minimalHistory = reducedHistory.map((item, index) => {
          // Keep images only for the newest 5 items
          if (index >= 5) {
            return { ...item, imageUrl: '', audioUrl: '' };
          }
          return item;
        });
        
        try {
          localStorage.setItem(historyKey, JSON.stringify(minimalHistory.slice(0, maxItems)));
        } catch (thirdError) {
          // Last resort: Keep only the most essential data and fewer items
          const essentialHistory = minimalHistory
            .slice(0, Math.max(5, Math.floor(maxItems / 2))) // Keep fewer items
            .map(item => ({
              id: item.id,
              created_at: item.created_at,
              prompt: item.prompt,
              advice: item.advice.substring(0, 500), // Truncate long advice text
              imageUrl: '',
              audioUrl: '',
              imagePrompt: ''
            }));
          
          // Add the new item with minimal data
          essentialHistory.unshift({
            id: generateUniqueId(), // Generate a new unique ID
            created_at: newItem.created_at,
            prompt: newItem.prompt,
            advice: newItem.advice.substring(0, 500), // Truncate advice
            imageUrl: '', // Don't store the image
            audioUrl: '', // Don't store the audio
            imagePrompt: ''
          });
          
          localStorage.setItem(historyKey, JSON.stringify(essentialHistory));
        }
      }
    }
  } catch (error) {
    console.error('Error saving to history:', error);
    // If all else fails, clear history and save only the new item with minimal data
    try {
      const user = getUser();
      const minimalItem = {
        id: generateUniqueId(), // Use the same unique ID generation method
        created_at: new Date().toISOString(),
        prompt: data.prompt || '',
        advice: (data.advice || '').substring(0, 300), // Very short advice only
        imageUrl: '',
        audioUrl: '',
        imagePrompt: ''
      };
      localStorage.setItem(user ? `mentorHistory_${user.id}` : 'mentorHistory', JSON.stringify([minimalItem]));
    } catch (finalError) {
      // If we still can't save, clear all localStorage and inform the user
      localStorage.clear();
      alert('Storage limit reached. Your history has been cleared to allow new content to be saved.');
    }
  }
};

// Get user history
export const getHistory = (): MentorHistoryItem[] => {
  const user = getUser();
  const historyKey = user ? `mentorHistory_${user.id}` : 'mentorHistory';
  return JSON.parse(localStorage.getItem(historyKey) || '[]');
};

export const getChatHistory = (): ChatConversation[] => {
  const user = getUser();
  const chatHistoryKey = user ? `chatHistory_${user.id}` : 'chatHistory';
  return JSON.parse(localStorage.getItem(chatHistoryKey) || '[]');
};

export const deleteChatConversation = (conversationId: string): boolean => {
  try {
    const user = getUser();
    const chatHistoryKey = user ? `chatHistory_${user.id}` : 'chatHistory';
    const chatHistory = JSON.parse(localStorage.getItem(chatHistoryKey) || '[]') as ChatConversation[];
    
    // Find the conversation index
    const conversationIndex = chatHistory.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) {
      return false; // Conversation not found
    }
    
    // Remove the conversation
    chatHistory.splice(conversationIndex, 1);
    
    // Save the updated history
    localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
    
    return true;
  } catch (error) {
    console.error('Error deleting chat conversation:', error);
    return false;
  }
};

// Get user history
export const getUserHistory = (): MentorHistoryItem[] => {
  const user = getUser();
  const historyKey = user ? `mentorHistory_${user.id}` : 'mentorHistory';
  
  // Get history from localStorage
  let history = JSON.parse(localStorage.getItem(historyKey) || '[]') as MentorHistoryItem[];
  
  // Check for duplicate IDs and fix them if found
  const idSet = new Set<string>();
  let hasFixedIds = false;
  
  // Create a new array with unique IDs
  const fixedHistory = history.map(item => {
    // If this ID is already in the set or is not valid, generate a new one
    if (idSet.has(item.id) || !item.id) {
      hasFixedIds = true;
      const newId = generateUniqueId();
      return { ...item, id: newId };
    }
    
    // Otherwise, add this ID to the set and return the item unchanged
    idSet.add(item.id);
    return item;
  });
  
  // If we fixed any IDs, save the updated history back to localStorage
  if (hasFixedIds) {
    try {
      localStorage.setItem(historyKey, JSON.stringify(fixedHistory));
      console.log('Fixed duplicate IDs in history');
    } catch (error) {
      console.error('Error saving fixed history:', error);
    }
  }
  
  return hasFixedIds ? fixedHistory : history;
};
