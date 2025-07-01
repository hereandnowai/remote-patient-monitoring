
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, SparklesIcon, ArrowPathIcon, MicrophoneIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import type { ChatMessage as AppChatMessage, GroundingChunk, GroundingChunkWeb, GroundingChunkRetrievedContext, LanguageOption } from '../types';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { GEMINI_API_MODEL_TEXT, CHATBOT_SYSTEM_INSTRUCTION, COMPANY_LOGO_URL, SUPPORTED_LANGUAGES } from '../constants';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Alert from './Alert';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface ChatbotProps {
  currentLanguage: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ currentLanguage }) => {
  const [messages, setMessages] = useState<AppChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    isListening,
    transcript,
    error: sttError,
    isSupported: sttIsSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    let keyFromEnv: string | null = null;
    try {
      if (typeof process !== 'undefined' && process.env) {
        keyFromEnv = process.env.API_KEY || null; 
      }
    } catch (e) {
      console.warn("Could not access process.env.API_KEY. 'process' may not be defined in this environment.", e);
    }

    if (keyFromEnv) {
      setApiKey(keyFromEnv);
      try {
        const ai = new GoogleGenAI({apiKey: keyFromEnv});
        const newChat = ai.chats.create({
          model: GEMINI_API_MODEL_TEXT,
          config: {
            systemInstruction: CHATBOT_SYSTEM_INSTRUCTION,
          },
        });
        setChat(newChat);
        const languageName = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || currentLanguage;
        setMessages([{
          id: 'initial-bot-message',
          sender: 'bot',
          text: `Hello! I'm Aura, your AI assistant. How can I help you today in ${languageName}? Remember, I cannot provide medical advice. For urgent issues, please contact your doctor.`,
          timestamp: new Date(),
          language: currentLanguage,
        }]);
      } catch (e: any) {
        console.error("Failed to initialize Gemini AI:", e);
        const errMessage = e instanceof Error ? e.message : String(e);
        setError(`Failed to initialize AI: ${errMessage}. Please ensure your API key is configured correctly.`);
        setMessages([{
          id: 'error-initialization',
          sender: 'bot',
          text: "I'm having trouble connecting right now. Please check the API key configuration or try again later.",
          timestamp: new Date()
        }]);
      }
    } else {
      setError("API_KEY environment variable not found or is not accessible. The chatbot cannot function without it.");
       setMessages([{
          id: 'error-apikey',
          sender: 'bot',
          text: "I'm unable to start because the API key is missing. Please ensure it's configured for your environment.",
          timestamp: new Date()
        }]);
    }
    setIsInitializing(false);
  }, [currentLanguage]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (sttError) {
      setError(`Speech recognition error: ${sttError}`);
    }
  }, [sttError]);

  const getLanguageName = (code: string): string => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !chat || !apiKey) {
        if (!apiKey) setError("Cannot send message: API Key is not configured.");
        return;
    }

    const userMessageText = input;
    const userMessage: AppChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
      language: currentLanguage,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();
    setIsLoading(true);
    setError(null);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMessageId,
      sender: 'bot',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
      language: currentLanguage,
    }]);
    
    const languageName = getLanguageName(currentLanguage);
    const promptWithLanguage = currentLanguage === 'en-US' 
      ? userMessageText 
      : `${userMessageText} (Please respond in ${languageName})`;

    try {
      const stream = await chat.sendMessageStream({ message: promptWithLanguage });
      let accumulatedText = "";
      let finalGroundingChunks: GroundingChunk[] | undefined;

      for await (const chunk of stream) {
        accumulatedText += chunk.text; 
        if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].groundingMetadata && chunk.candidates[0].groundingMetadata.groundingChunks) {
             finalGroundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        }
       
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: accumulatedText, isStreaming: true } : msg
        ));
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { 
          ...msg, 
          text: accumulatedText, 
          isStreaming: false,
        } : msg
      ));

       if (finalGroundingChunks && finalGroundingChunks.length > 0) {
        let sourcesText = "\n\n**Sources:**\n";
        const uniqueSources = new Map<string, string>();
        finalGroundingChunks.forEach(chunkItem => { 
            const web = chunkItem.web as GroundingChunkWeb | undefined;
            const retrieved = chunkItem.retrievedContext as GroundingChunkRetrievedContext | undefined;
            if (web?.uri && web.title) {
                if(!uniqueSources.has(web.uri)) {
                    sourcesText += `- [${web.title}](${web.uri})\n`;
                    uniqueSources.set(web.uri, web.title);
                }
            } else if (retrieved?.uri && retrieved.title) {
                 if(!uniqueSources.has(retrieved.uri)) {
                    sourcesText += `- [${retrieved.title}](${retrieved.uri})\n`;
                    uniqueSources.set(retrieved.uri, retrieved.title);
                 }
            }
        });
        if(uniqueSources.size > 0) {
             setMessages(prev => prev.map(msg => 
                msg.id === botMessageId ? { 
                ...msg, 
                text: accumulatedText + sourcesText, 
                isStreaming: false,
                } : msg
            ));
        }
      }

    } catch (e: any) {
      console.error("Gemini API error:", e);
      const errMessage = e instanceof Error ? e.message : String(e);
      const errorMessageContent = `Sorry, I encountered an error: ${errMessage}. Please try again.`;
      setError(errorMessageContent);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, text: "An error occurred. Please see the message above.", isStreaming: false, sender: 'bot' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, chat, apiKey, currentLanguage, resetTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(currentLanguage);
    }
  };

  if (isInitializing) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] max-h-[700px] bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-2xl mx-auto p-4">
            <ArrowPathIcon className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg text-text_muted dark:text-dark_text_muted">Initializing AI Assistant...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-2xl mx-auto">
      <header className="bg-primary text-text_on_primary p-4 rounded-t-xl flex items-center space-x-3">
        <img src={COMPANY_LOGO_URL} alt="Aura AI" className="h-10 w-10 rounded-full bg-white dark:bg-dark_neutral_bg p-1"/>
        <div>
          <h2 className="text-xl font-semibold">AI Health Assistant (Aura)</h2>
          <p className="text-xs opacity-80">Powered by Gemini - Language: {getLanguageName(currentLanguage)}</p>
        </div>
      </header>

      {error && <div className="p-2"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
      {!sttIsSupported && <div className="p-2"><Alert type="warning" message="Speech recognition is not supported by your browser." /></div>}
      
      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-neutral_bg dark:bg-dark_neutral_bg">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex animate-fadeIn ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${
              msg.sender === 'user'
                ? 'bg-accent text-text_on_accent rounded-br-none' 
                : 'bg-gray-200 dark:bg-slate-700 text-text_default dark:text-dark_text_default rounded-bl-none'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm"> {/* prose-invert for dark markdown */}
                 <Markdown remarkPlugins={[remarkGfm]} components={{ 
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline"/>,
                    p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0"/>,
                    ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside"/>,
                    ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside"/>,
                  }}
                >
                  {msg.text}
                </Markdown>
              </div>
              {msg.isStreaming && <SparklesIcon className="h-4 w-4 inline-block animate-pulse text-gray-500 dark:text-gray-400 ml-1" />}
              <p className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-amber-100 dark:text-amber-200 text-right' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-neutral_border dark:border-dark_neutral_border bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-b-xl">
        <div className="flex items-center space-x-2">
          {sttIsSupported && (
            <button
              onClick={toggleListening}
              disabled={!chat || (!!error && error.includes("API_KEY")) || isLoading || (!!error && error.includes("API key is not configured"))}
              className={`p-3 rounded-lg shadow-md transition duration-200 
                          ${isListening 
                            ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
                            : 'bg-primary hover:bg-primary-dark'
                          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? <StopCircleIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isLoading ? "Aura is typing..." : (isListening ? "Listening..." : "Ask Aura anything...")}
            className="flex-grow p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary transition duration-150 disabled:bg-gray-100 dark:disabled:bg-slate-600 bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"
            disabled={isLoading || !chat || (!!error && error.includes("API_KEY")) || (!!error && error.includes("API key is not configured"))}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || !chat || (!!error && error.includes("API_KEY")) || (!!error && error.includes("API key is not configured"))}
            className="bg-primary hover:bg-primary-dark text-text_on_primary p-3 rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <ArrowPathIcon className="animate-spin h-6 w-6" />
            ) : (
              <PaperAirplaneIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
