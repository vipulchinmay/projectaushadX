import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { HealthProfile, HealthContext as HealthContextType } from '@/types';

const defaultHealthProfile: HealthProfile = {
  allergies: [],
  medications: [],
  conditions: [],
  lastUpdated: Date.now()
};

const HealthContext = createContext<HealthContextType>({
  profile: defaultHealthProfile,
  updateProfile: () => {}
});

export const useHealth = () => useContext(HealthContext);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<HealthProfile>(defaultHealthProfile);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const loadProfile = async () => {
    try {
      const savedProfile = await SecureStore.getItemAsync('healthProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading health profile:', error);
    }
  };

  const saveProfile = async (profileData: HealthProfile) => {
    try {
      await SecureStore.setItemAsync('healthProfile', JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving health profile:', error);
    }
  };

  const updateProfile = (newProfileData: Partial<HealthProfile>) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      ...newProfileData,
      lastUpdated: Date.now()
    }));
  };

  return (
    <HealthContext.Provider value={{ profile, updateProfile }}>
      {children}
    </HealthContext.Provider>
  );
};