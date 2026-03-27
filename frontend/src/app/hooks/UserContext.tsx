import React, { createContext, useContext, useState, useEffect } from 'react';
import { updatePreferences } from '../services/api';

interface UserContextType {
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<string>>;
  interests: string[];
  setInterests: React.Dispatch<React.SetStateAction<string[]>>;
  preferredSectors: string[];
  setPreferredSectors: React.Dispatch<React.SetStateAction<string[]>>;
  saveUserProfile: () => Promise<void>;
  isSaving: boolean;
  selectedField: string;
  setSelectedField: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState('investor');
  const [interests, setInterests] = useState<string[]>(['markets', 'banking', 'startups', 'technology']);
  const [preferredSectors, setPreferredSectors] = useState<string[]>(['Business', 'Technology']);
  const [selectedField, setSelectedField] = useState('General');
  const [isSaving, setIsSaving] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = `guest_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_id', userId);
    }

    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserType(parsed.userType || 'investor');
        setInterests(parsed.interests || []);
        setPreferredSectors(parsed.preferredSectors || []);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
  }, []);

  const saveUserProfile = async () => {
    setIsSaving(true);
    const userId = localStorage.getItem('user_id') || 'guest_temp';
    const profile = { userType, interests, preferredSectors, user_id: userId };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    
    try {
      await updatePreferences({
        user_id: userId,
        user_type: userType,
        interests,
        preferred_sectors: preferredSectors
      });
    } catch (err) {
      console.error("Failed to sync profile to backend", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userType, 
      setUserType, 
      interests, 
      setInterests, 
      preferredSectors, 
      setPreferredSectors,
      saveUserProfile,
      isSaving,
      selectedField,
      setSelectedField
    }}>
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
