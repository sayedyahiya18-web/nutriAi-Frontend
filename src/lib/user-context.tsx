'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ScannedProduct = {
  barcode: string;
  name: string;
  brand: string;
  timestamp: number;
  isSafe: boolean;
};

export type CommunityPost = {
  id: string;
  username: string;
  community: string;
  productName: string;
  brand: string;
  healthScore: number;
  isSafe: boolean;
  recommendation: string;
  warning: string | null;
  timestamp: number;
};

export type ExerciseGoal = {
  totalMinutes: number;
  activity: string;
  completedMinutes: number;
};

export type UserPreferences = {
  username: string;
  city: string;
  allergies: string[];
  conditions: string[];
  dietType: 'vegetarian' | 'non-veg' | 'vegan';
  proteinGoal: number;
  routine: string;
  community: string | null;
  scanHistory: ScannedProduct[];
  exerciseGoal: ExerciseGoal;
};

type UserContextType = {
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;
  addToHistory: (product: ScannedProduct) => void;
  addExerciseGoal: (minutes: number, activity: string) => void;
  isLoggedIn: boolean;
  login: (username?: string, city?: string) => void;
  logout: () => void;
  communityPosts: CommunityPost[];
  postToCommunity: (post: Omit<CommunityPost, 'id' | 'timestamp'>) => void;
  joinCommunity: (name: string) => void;
};

const defaultExerciseGoal: ExerciseGoal = {
  totalMinutes: 0,
  activity: 'walking',
  completedMinutes: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const COMMUNITY_POSTS_KEY = 'nutriai_community_posts';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nutriai_user');
    if (saved) {
      const data = JSON.parse(saved);
      setPrefs(data.preferences);
      setIsLoggedIn(data.isLoggedIn);
    }
    const posts = localStorage.getItem(COMMUNITY_POSTS_KEY);
    if (posts) {
      setCommunityPosts(JSON.parse(posts));
    }
  }, []);

  const login = (username?: string, city?: string) => {
    setIsLoggedIn(true);
    const updatedPrefs = preferences
      ? {
          ...preferences,
          username: username || preferences.username || 'Friend',
          city: city || preferences.city || '',
        }
      : null;
    if (updatedPrefs) {
      setPrefs(updatedPrefs);
      localStorage.setItem(
        'nutriai_user',
        JSON.stringify({ isLoggedIn: true, preferences: updatedPrefs })
      );
    } else {
      localStorage.setItem(
        'nutriai_user',
        JSON.stringify({ isLoggedIn: true, preferences: null })
      );
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPrefs(null);
    localStorage.removeItem('nutriai_user');
  };

  const setPreferences = (prefs: UserPreferences) => {
    const merged = {
      ...prefs,
      exerciseGoal: prefs.exerciseGoal || defaultExerciseGoal,
    };
    setPrefs(merged);
    setIsLoggedIn(true);
    localStorage.setItem(
      'nutriai_user',
      JSON.stringify({ isLoggedIn: true, preferences: merged })
    );
  };

  const addToHistory = (product: ScannedProduct) => {
    if (!preferences) return;
    const newHistory = [product, ...(preferences.scanHistory || [])].slice(0, 50);
    const newPrefs = { ...preferences, scanHistory: newHistory };
    setPreferences(newPrefs);
  };

  const addExerciseGoal = (minutes: number, activity: string) => {
    if (!preferences) return;
    const current = preferences.exerciseGoal || defaultExerciseGoal;
    const newGoal: ExerciseGoal = {
      totalMinutes: current.totalMinutes + minutes,
      activity: activity || current.activity,
      completedMinutes: current.completedMinutes,
    };
    const newPrefs = { ...preferences, exerciseGoal: newGoal };
    setPreferences(newPrefs);
  };

  const joinCommunity = (name: string) => {
    if (!preferences) return;
    const newPrefs = { ...preferences, community: name };
    setPreferences(newPrefs);
  };

  const postToCommunity = (post: Omit<CommunityPost, 'id' | 'timestamp'>) => {
    const newPost: CommunityPost = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    const updated = [newPost, ...communityPosts];
    setCommunityPosts(updated);
    localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(updated));
  };

  return (
    <UserContext.Provider
      value={{
        preferences,
        setPreferences,
        addToHistory,
        addExerciseGoal,
        isLoggedIn,
        login,
        logout,
        communityPosts,
        postToCommunity,
        joinCommunity,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
