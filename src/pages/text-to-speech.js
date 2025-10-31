import React, { useState, useEffect } from 'react';
import { Volume2, Loader2, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TextToSpeechPage = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [apiPreference, setApiPreference] = useState('browser'); // 'browser' or 'elevenlabs'
    const [isBrowserApiSupported, setIsBrowserApiSupported] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);

    useEffect(() => {
        const supported = 'speechSynthesis' in window;
        setIsBrowserApiSupported(supported);
        if (!supported) {
            setApiPreference('elevenlabs');
        }

        // Cleanup audio on component unmount
        return () => {
            if (currentAudio) {
                currentAudio.pause();
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [currentAudio]);

    const stopPlayback = () => {
        if (apiPreference === 'browser' && isBrowserApiSupported) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setIsPlaying(false);
        }
        setIsLoading(false);
    };

    const handleSpeak = async () => {
        if (isPlaying) {
            stopPlayback();
            return;
        }

        if (text.trim() === '') {
            alert('Please enter some text to speak.');
            return;
        }

        // Use browser API if preferred and supported
        if (apiPreference === 'browser' && isBrowserApiSupported) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback to ElevenLabs API via our backend
            setIsLoading(true);
            setIsPlaying(true);

            try {
                const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
                const API = `${BASE_URL}/apis/text-to-speech`

                const params = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text }),
                }

                const response = await fetch(API, params);

                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error from backend.' }));
                    throw new Error(errorBody.error || 'Failed to generate speech.');
                }

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                setCurrentAudio(audio);
                audio.play();
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    setIsPlaying(false);
                    setCurrentAudio(null);
                };

            } catch (error) {
                console.error('Error with ElevenLabs TTS fetch:', error);
                if (error instanceof TypeError && error.message === 'Failed to fetch') {
                    alert('Could not connect to the backend server. Please ensure it is running and accessible.');
                } else {
                    alert(`Sorry, we could not generate the speech. Error: ${error.message}`);
                }
                setIsPlaying(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-md p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Text to Speech</h1>
                    <p className="text-gray-600 mt-2">
                        Type something in the box below and click the speaker to hear it.
                    </p>
                </div>

                {/* API Switcher */}
                <div className="flex justify-center items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    <Button
                        variant={apiPreference === 'browser' ? 'default' : 'ghost'}
                        onClick={() => setApiPreference('browser')}
                        disabled={!isBrowserApiSupported}
                        className="flex-1"
                    >
                        Browser
                    </Button>
                    <Button
                        variant={apiPreference === 'elevenlabs' ? 'default' : 'ghost'}
                        onClick={() => setApiPreference('elevenlabs')}
                        className="flex-1"
                    >
                        ElevenLabs
                    </Button>
                </div>

                <div className="flex items-start space-x-4">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to be spoken..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out resize-y min-h-[120px]"
                        rows="5"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSpeak} size="lg" className="flex-shrink-0" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : isPlaying ? (
                            <StopCircle className="h-6 w-6" />
                        ) : (
                            <Volume2 className="h-6 w-6" />
                        )}
                        <span className="sr-only">{isPlaying ? 'Stop' : 'Speak'}</span>
                    </Button>
                </div>
                <div className="text-center text-xs text-gray-500">
                    {isBrowserApiSupported
                        ? "Switch between your browser's TTS and the higher quality ElevenLabs API."
                        : "Your browser does not support native TTS. Using ElevenLabs API."
                    }
                </div>
            </div>
        </div>
    );
};

export default TextToSpeechPage;
