import { HealthProfile } from '../types';

// Simple response generation based on user input and health profile
export const generateResponse = (userInput: string, profile: HealthProfile): string => {
  const input = userInput.toLowerCase();
  
  // Check if it's a greeting
  if (input.match(/^(hi|hello|hey|greetings).*/i)) {
    return `Hello! I'm your personal health assistant. How can I help you today?`;
  }

  // Check if user is asking about their profile
  if (input.includes('my profile') || input.includes('my health') || input.includes('my information')) {
    return generateProfileSummary(profile);
  }

  // Check for headache-related queries
  if (input.includes('headache') || input.includes('head ache') || input.includes('migraine')) {
    const allergies = profile.allergies.length > 0;
    const painMeds = profile.medications.some(med => 
      med.toLowerCase().includes('pain') || 
      med.toLowerCase().includes('aspirin') || 
      med.toLowerCase().includes('ibuprofen')
    );
    
    if (allergies) {
      return `I notice you have allergies listed in your profile. Sometimes allergies can trigger headaches. Have you taken any allergy medication recently? For headaches, make sure you're staying hydrated and consider resting in a dark, quiet room.`;
    } else if (painMeds) {
      return `I see you're already taking pain medication. If your headache persists despite your current medication, you might want to consult with your doctor. Make sure you're staying hydrated and getting enough rest.`;
    } else {
      return `For headaches, I recommend rest, staying hydrated, and over-the-counter pain relievers if appropriate for you. If your headache is severe or persistent, please consult a healthcare professional.`;
    }
  }

  // Check for cold/flu related queries
  if (input.includes('cold') || input.includes('flu') || input.includes('fever') || input.includes('cough')) {
    const hasCondition = profile.conditions.some(condition => 
      condition.toLowerCase().includes('asthma') || 
      condition.toLowerCase().includes('respiratory')
    );

    if (hasCondition) {
      return `I see you have a respiratory condition listed in your profile. For cold/flu symptoms, it's important to monitor your breathing carefully. Stay hydrated, rest, and consider contacting your doctor if symptoms worsen, especially if you experience difficulty breathing.`;
    } else {
      return `For cold or flu symptoms, I recommend rest, staying hydrated, and over-the-counter remedies appropriate for your symptoms. If you develop a high fever or symptoms worsen after a few days, consider consulting a healthcare professional.`;
    }
  }

  // Generic health questions
  if (input.includes('healthy') || input.includes('diet') || input.includes('exercise') || input.includes('wellness')) {
    return `Maintaining good health involves balanced nutrition, regular exercise, adequate sleep, and stress management. Based on your profile, focus on a diet rich in whole foods and stay active with exercises you enjoy. Remember that small, consistent habits often lead to the best long-term health outcomes.`;
  }

  // Default response if no specific pattern is matched
  return `I don't have specific information about "${userInput}". Please consult with a healthcare professional for personalized advice. Is there something else I can help you with regarding your health?`;
};

// Generate a summary of the user's health profile
const generateProfileSummary = (profile: HealthProfile): string => {
  const sections = [];
  
  if (profile.conditions.length > 0) {
    sections.push(`You have ${profile.conditions.length} condition(s) listed: ${profile.conditions.join(', ')}.`);
  } else {
    sections.push(`You have no medical conditions listed.`);
  }
  
  if (profile.medications.length > 0) {
    sections.push(`You're currently taking: ${profile.medications.join(', ')}.`);
  } else {
    sections.push(`You're not currently taking any medications.`);
  }
  
  if (profile.allergies.length > 0) {
    sections.push(`You have ${profile.allergies.length} allergy/allergies: ${profile.allergies.join(', ')}.`);
  } else {
    sections.push(`You have no allergies listed.`);
  }
  
  if (profile.height && profile.weight) {
    sections.push(`Your height is ${profile.height} and weight is ${profile.weight}.`);
  }
  
  if (profile.bloodType) {
    sections.push(`Your blood type is ${profile.bloodType}.`);
  }
  
  const lastUpdated = new Date(profile.lastUpdated).toLocaleDateString();
  sections.push(`Your profile was last updated on ${lastUpdated}.`);
  
  return sections.join(' ');
};