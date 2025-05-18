export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: number;
  }
  
  export interface HealthProfile {
    allergies: string[];
    medications: string[];
    conditions: string[];
    height?: string;
    weight?: string;
    bloodType?: string;
    lastUpdated: number;
  }
  
  export interface HealthContext {
    profile: HealthProfile;
    updateProfile: (profile: Partial<HealthProfile>) => void;
  }
  
  export interface ChatContext {
    messages: Message[];
    addMessage: (content: string, sender: 'user' | 'bot') => void;
    clearChat: () => void;
  }