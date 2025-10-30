import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Leaf } from 'lucide-react';

export default function LanguagePage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  ];

  const selectLanguage = (langCode) => {
    setSelectedLang(langCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', langCode);
    }
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-green-800 p-4 text-white">
        <div className="container mx-auto flex items-center justify-center">
          <Leaf className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">FarmAdvisor</h1>
        </div>
      </header>

      {/* Language Selection */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-900">Choose Your Language</h2>
            <p className="text-sm text-green-600 mt-2">Select your preferred language to continue</p>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`w-full p-3 rounded-lg border transition-colors duration-200 flex items-center justify-between
                  ${selectedLang === lang.code 
                    ? 'bg-green-500 text-white border-green-600' 
                    : 'bg-white hover:bg-green-50 border-gray-200'
                  }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{lang.flag}</span>
                  <span className="text-lg">{lang.name}</span>
                </div>
                {selectedLang === lang.code && <span>✓</span>}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => selectLanguage('en')}
              className="text-green-600 hover:text-green-700 text-sm hover:underline"
            >
              Continue in English
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-green-800 text-white py-3">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Choose your language for a personalized experience</p>
        </div>
      </footer>
    </main>
  );
}