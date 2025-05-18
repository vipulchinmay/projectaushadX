import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';

type EditableField = 'allergies' | 'medications' | 'conditions' | 'height' | 'weight' | 'bloodType';

const HealthProfile: React.FC = () => {
  const { profile, updateProfile } = useHealth();
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [tempArrayValue, setTempArrayValue] = useState('');

  const startEditing = (field: EditableField, currentValue: string | string[]) => {
    setEditing(field);
    if (Array.isArray(currentValue)) {
      setTempArrayValue('');
    } else {
      setTempValue(currentValue || '');
    }
  };

  const saveEdit = () => {
    if (!editing) return;

    if (['allergies', 'medications', 'conditions'].includes(editing)) {
      if (tempArrayValue.trim()) {
        updateProfile({
          [editing]: [...profile[editing as keyof typeof profile] as string[], tempArrayValue.trim()]
        });
      }
      setTempArrayValue('');
    } else {
      updateProfile({
        [editing]: tempValue.trim()
      });
      setEditing(null);
    }
  };

  const removeArrayItem = (field: 'allergies' | 'medications' | 'conditions', index: number) => {
    const newArray = [...profile[field]];
    newArray.splice(index, 1);
    updateProfile({ [field]: newArray });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg mx-auto transition-all duration-300">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">Health Profile</h2>
      
      <div className="space-y-6">
        {/* Allergies Section */}
        <div className="border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Allergies</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.allergies.length > 0 ? (
              profile.allergies.map((allergy, index) => (
                <div 
                  key={`allergy-${index}`}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {allergy}
                  <button 
                    onClick={() => removeArrayItem('allergies', index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No allergies listed</p>
            )}
          </div>
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={tempArrayValue}
              onChange={(e) => setTempArrayValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add allergy..."
              className="flex-grow text-sm px-3 py-1 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (tempArrayValue.trim()) {
                  updateProfile({
                    allergies: [...profile.allergies, tempArrayValue.trim()]
                  });
                  setTempArrayValue('');
                }
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Medications Section */}
        <div className="border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Medications</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.medications.length > 0 ? (
              profile.medications.map((medication, index) => (
                <div 
                  key={`medication-${index}`}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {medication}
                  <button 
                    onClick={() => removeArrayItem('medications', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No medications listed</p>
            )}
          </div>
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={tempArrayValue}
              onChange={(e) => setTempArrayValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add medication..."
              className="flex-grow text-sm px-3 py-1 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (tempArrayValue.trim()) {
                  updateProfile({
                    medications: [...profile.medications, tempArrayValue.trim()]
                  });
                  setTempArrayValue('');
                }
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Medical Conditions Section */}
        <div className="border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Medical Conditions</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.conditions.length > 0 ? (
              profile.conditions.map((condition, index) => (
                <div 
                  key={`condition-${index}`}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {condition}
                  <button 
                    onClick={() => removeArrayItem('conditions', index)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No conditions listed</p>
            )}
          </div>
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={tempArrayValue}
              onChange={(e) => setTempArrayValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add condition..."
              className="flex-grow text-sm px-3 py-1 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (tempArrayValue.trim()) {
                  updateProfile({
                    conditions: [...profile.conditions, tempArrayValue.trim()]
                  });
                  setTempArrayValue('');
                }
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            {editing === 'height' ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={saveEdit}
                  autoFocus
                  className="flex-grow px-3 py-1 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-3 py-1 rounded-r-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div 
                onClick={() => startEditing('height', profile.height || '')}
                className="px-3 py-1 border rounded-lg cursor-text hover:bg-gray-50"
              >
                {profile.height || 'Not specified'}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            {editing === 'weight' ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={saveEdit}
                  autoFocus
                  className="flex-grow px-3 py-1 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-3 py-1 rounded-r-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div 
                onClick={() => startEditing('weight', profile.weight || '')}
                className="px-3 py-1 border rounded-lg cursor-text hover:bg-gray-50"
              >
                {profile.weight || 'Not specified'}
              </div>
            )}
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            {editing === 'bloodType' ? (
              <div className="flex items-center">
                <select
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={saveEdit}
                  autoFocus
                  className="flex-grow px-3 py-1 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-3 py-1 rounded-r-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div 
                onClick={() => startEditing('bloodType', profile.bloodType || '')}
                className="px-3 py-1 border rounded-lg cursor-text hover:bg-gray-50"
              >
                {profile.bloodType || 'Not specified'}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(profile.lastUpdated).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default HealthProfile;