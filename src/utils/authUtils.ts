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
  [key: string]: string;
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

// Save user data to history
export const saveToHistory = (data: Partial<MentorHistoryItem>): void => {
  const user = getUser();
  if (!user) {
    // For non-authenticated users, save to generic history
    const history = JSON.parse(localStorage.getItem('mentorHistory') || '[]') as MentorHistoryItem[];
    history.unshift({
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      prompt: data.prompt || '',
      advice: data.advice || '',
      imageUrl: data.imageUrl || '',
      audioUrl: data.audioUrl || '',
      imagePrompt: data.imagePrompt || ''
    });
    localStorage.setItem('mentorHistory', JSON.stringify(history.slice(0, 10))); // Keep last 10 items
    return;
  }
  
  // For authenticated users, save to user-specific history
  const userHistory = JSON.parse(localStorage.getItem(`mentorHistory_${user.id}`) || '[]') as MentorHistoryItem[];
  userHistory.unshift({
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    prompt: data.prompt || '',
    advice: data.advice || '',
    imageUrl: data.imageUrl || '',
    audioUrl: data.audioUrl || '',
    imagePrompt: data.imagePrompt || ''
  });
  localStorage.setItem(`mentorHistory_${user.id}`, JSON.stringify(userHistory.slice(0, 20))); // Keep last 20 items
};

// Get user history
export const getUserHistory = (): MentorHistoryItem[] => {
  const user = getUser();
  if (!user) {
    return JSON.parse(localStorage.getItem('mentorHistory') || '[]') as MentorHistoryItem[];
  }
  
  return JSON.parse(localStorage.getItem(`mentorHistory_${user.id}`) || '[]') as MentorHistoryItem[];
};
