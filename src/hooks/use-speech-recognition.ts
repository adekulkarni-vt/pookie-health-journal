'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef('');
  const interimRef = useRef('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const updateDisplay = useCallback(() => {
    setDisplayText(finalRef.current + interimRef.current);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    finalRef.current = finalRef.current + interimRef.current;
    interimRef.current = '';
    updateDisplay();
    setIsListening(false);
  }, [updateDisplay]);

  const startListening = useCallback(() => {
    setError(null);
    finalRef.current = '';
    interimRef.current = '';
    setDisplayText('');

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      interimRef.current = interim;
      updateDisplay();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      finalRef.current = finalRef.current + interimRef.current;
      interimRef.current = '';
      updateDisplay();
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setError('Failed to start voice recognition.');
      setIsListening(false);
    }
  }, [updateDisplay]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript: displayText,
    error,
    isSupported,
    startListening,
    stopListening,
  };
}
