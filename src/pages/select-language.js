import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Leaf } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
];

export default function LanguageSelect() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('');

  const handleLanguageSelect = (langCode) => {
    try {
      console.log('Selected language:', langCode);
      setSelectedLang(langCode);
      localStorage.setItem('preferredLanguage', langCode);
      // router.push('/login');
    } catch (error) {
      console.error('Error selecting language:', error);
      // Fallback to English if there's an error
      // router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-green-800 p-4 text-white">
        <div className="container mx-auto flex items-center justify-center">
          <Leaf className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">FarmAdvisor</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-900 mb-4">Choose Your Language</h2>
            <p className="text-green-700">Select your preferred language to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedLang === lang.code
                    ? 'bg-green-600 text-white'
                    : 'bg-white hover:bg-green-50'
                } flex items-center justify-between shadow-sm hover:shadow-md w-full`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{lang.flag}</span>
                  <span className="text-lg">{lang.name}</span>
                </div>
                {selectedLang === lang.code && (
                  <span className="text-white">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Skip option */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => handleLanguageSelect('en')}
              className="text-green-600 hover:text-green-700 text-sm hover:underline"
            >
              Continue in English
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 w-full bg-green-800 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Choose your language for a personalized experience</p>
        </div>
      </div>
    </div>
  )
}