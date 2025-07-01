
import { useState, useEffect, useCallback, useRef } from 'react';

// TypeScript type definitions for the Web Speech API
// These interfaces describe the shape of the API objects for TypeScript.

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative; // Allows array-like access
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult; // Allows array-like access
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string; // Standard property is a DOMString representing SpeechRecognitionErrorCode
  readonly message: string; // Standard property, human-readable description
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars: any; // Actually SpeechGrammarList

  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  // Other event handlers like onaudiostart, onnomatch, etc., are not used by the hook

  start(): void;
  stop(): void;
  abort(): void;
}

// Represents the constructor for SpeechRecognition (e.g., new window.SpeechRecognition())
interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

// Extends the global Window interface to make TypeScript aware of these properties
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic; // For Safari and older Chrome
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: (language: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Access constructor via window object, respecting vendor prefixes
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;

      recognition.continuous = false; // Stop after first pause
      recognition.interimResults = true; // Get results as user speaks

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
        // No explicit stop needed here if continuous is false, onend will handle it
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error); // event.error is a string code like 'no-speech', 'network'
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
    } else {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop(); // Ensure recognition is stopped on unmount
      }
    };
  }, []); // Empty dependency array: run once on mount

  const startListening = useCallback((language: string = 'en-US') => {
    if (!recognitionRef.current || !isSupported) {
        setError(isSupported ? "Recognition not initialized." : "Speech recognition not supported.");
        return;
    }
    if (isListening) return;

    setTranscript('');
    setError(null);
    recognitionRef.current.lang = language;
    try {
        recognitionRef.current.start();
        setIsListening(true);
    } catch (e: any) {
        // Catch potential errors from start() e.g. if already started
        setError(`Could not start recognition: ${e.message}`);
        setIsListening(false);
    }
  }, [isListening, isSupported]); // Dependencies: isListening, isSupported

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // isListening will be set to false by the 'onend' event handler
    }
  }, [isListening]); // Dependency: isListening

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
