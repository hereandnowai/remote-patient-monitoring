
import React, { useState, useCallback, useEffect } from 'react';
import type { SymptomLog } from '../types';
import { DocumentTextIcon, LightBulbIcon, SparklesIcon, ArrowPathIcon, MicrophoneIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { GEMINI_API_MODEL_TEXT, SUPPORTED_LANGUAGES } from '../constants';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Alert from './Alert';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface SymptomLoggerProps {
  onAddSymptom: (log: SymptomLog) => void;
  currentLanguage: string;
}

const SymptomLogger: React.FC<SymptomLoggerProps> = ({ onAddSymptom, currentLanguage }) => {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<number>(5); 
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

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
      console.warn("Could not access process.env.API_KEY for SymptomLogger. 'process' may not be defined.", e);
    }

    if (keyFromEnv) {
      setApiKey(keyFromEnv);
    } else {
      setFeedback({type: 'warning', message: "AI features disabled: API_KEY not found or accessible in environment."});
    }
  }, []);
  
  useEffect(() => {
    if (transcript && isListening) { 
      setDescription(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (sttError) {
        setFeedback({type: 'error', message: `Speech recognition error: ${sttError}`});
    }
  }, [sttError]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!description.trim()) {
      setFeedback({type: 'error', message: 'Please describe your symptom.'});
      return;
    }
    const newLog: SymptomLog = {
      id: Date.now().toString(),
      description: description.trim(),
      severity,
      timestamp: new Date(),
      notes: notes.trim() || undefined,
    };
    onAddSymptom(newLog);
    setFeedback({type: 'success', message: 'Symptom logged successfully!'});
    setDescription('');
    setSeverity(5);
    setNotes('');
    setAiInsight(null); 
    resetTranscript();
    setTimeout(() => setFeedback(null), 3000);
  };

  const getLanguageName = (code: string): string => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const handleGetAiInsight = useCallback(async () => {
    if (!description.trim()) {
      setFeedback({type: 'info', message: "Please describe your symptom first to get an insight."});
      return;
    }
    if (!apiKey) {
      setFeedback({type: 'error', message: "Cannot get AI insight: API Key is not configured or accessible."});
      return;
    }
    setIsLoadingAi(true);
    setAiInsight(null);
    setFeedback(null);
    
    const languageName = getLanguageName(currentLanguage);

    try {
      const ai = new GoogleGenAI({apiKey: apiKey});
      const prompt = `A user in a remote patient monitoring app reports the following symptom(s) in ${languageName}: "${description}". Their self-reported severity is ${severity}/10. Additional notes: "${notes || 'None'}".
      Provide some general information related to these symptoms, possible non-medical self-care tips if appropriate (like rest, hydration), and emphasize when it's important to contact a healthcare professional.
      STRICTLY DO NOT PROVIDE A DIAGNOSIS OR MEDICAL ADVICE.
      Respond in ${languageName}.
      Keep the response empathetic, concise (around 3-4 short paragraphs), and easy to understand. Start with a phrase like "Here's some general information that might be related to what you're experiencing:" (translated to ${languageName}).
      If the symptoms sound potentially serious (e.g. chest pain, difficulty breathing, severe unexplained pain, sudden vision changes), strongly advise contacting a doctor immediately or seeking urgent care, also in ${languageName}.
      Use Markdown for formatting if it improves readability (e.g., bullet points for tips).
      `;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_API_MODEL_TEXT,
        contents: prompt,
        config: {}
      });
      let insightText = response.text;
      
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = insightText.match(fenceRegex);
      if (match && match[2]) {
        insightText = match[2].trim();
      }

      setAiInsight(insightText);

    } catch (e: any) {
      console.error("Gemini API error (Symptom Insight):", e);
      const errMessage = e instanceof Error ? e.message : String(e);
      setAiInsight(null);
      setFeedback({type: 'error', message: `Sorry, I couldn't fetch insights at the moment. Error: ${errMessage}`});
    } finally {
      setIsLoadingAi(false);
    }
  }, [description, severity, notes, apiKey, currentLanguage]);

  const toggleListeningSymptom = () => {
    if (isListening) {
      stopListening();
    } else {
      setDescription(''); 
      resetTranscript();
      startListening(currentLanguage);
    }
  };

  return (
    <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-lg mx-auto animate-fadeIn">
      <h2 className="text-2xl font-semibold text-primary mb-6 text-center flex items-center justify-center">
        <DocumentTextIcon className="h-8 w-8 mr-2 text-primary-dark" />
        Log Your Symptoms
      </h2>
      {feedback && (
        <div className="my-4">
            <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)}/>
        </div>
      )}
      {!sttIsSupported && apiKey && <div className="my-4"><Alert type="warning" message="Speech-to-text for symptoms is not supported by your browser."/></div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="symptomDescription" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Describe your symptom(s)*</label>
          <div className="flex items-center space-x-2">
            <textarea
              id="symptomDescription"
              name="symptomDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              placeholder={isListening ? "Listening for symptoms..." : "e.g., Persistent headache, feeling tired, sore throat"}
              className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"
            ></textarea>
            {sttIsSupported && (
              <button
                type="button"
                onClick={toggleListeningSymptom}
                disabled={!apiKey}
                className={`p-3 rounded-lg shadow-md transition duration-200 ${isListening ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isListening ? "Stop symptom dictation" : "Start symptom dictation"}
              >
                {isListening ? <StopCircleIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Severity (1=Mild, 10=Severe)</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              id="severity"
              name="severity"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-primary-dark"
            />
            <span className="font-semibold text-primary w-10 text-center text-lg">{severity}</span>
          </div>
        </div>
        <div>
          <label htmlFor="symptomNotes" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Additional Notes (Optional)</label>
          <textarea
            id="symptomNotes"
            name="symptomNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g., Started this morning, worse after eating, any triggers"
            className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-text_on_primary font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Log Symptom
        </button>
      </form>

      {apiKey && (
        <div className="mt-8 pt-6 border-t border-neutral_border dark:border-dark_neutral_border">
          <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default mb-3 flex items-center">
            <LightBulbIcon className="h-6 w-6 mr-2 text-accent" />
            AI-Powered Insight
          </h3>
          <p className="text-sm text-text_muted dark:text-dark_text_muted mb-3">Get general information about your symptoms in {getLanguageName(currentLanguage)}. This is not medical advice.</p>
          <button
            onClick={handleGetAiInsight}
            disabled={isLoadingAi || !description.trim() || !apiKey}
            className="w-full bg-accent hover:bg-accent-dark text-text_on_accent font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingAi ? (
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <SparklesIcon className="h-5 w-5 mr-2" />
            )}
            {isLoadingAi ? 'Getting Insight...' : 'Get General AI Insight'}
          </button>
          {aiInsight && !isLoadingAi && (
            <div className="mt-4 p-4 bg-neutral_bg dark:bg-dark_neutral_bg rounded-lg border border-neutral_border dark:border-dark_neutral_border prose prose-sm dark:prose-invert max-w-none animate-fadeIn">
                <Markdown remarkPlugins={[remarkGfm]} components={{ 
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline"/>,
                    p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0"/>,
                    ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside pl-2"/>,
                    ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside pl-2"/>,
                 }}>
                    {aiInsight}
                </Markdown>
                <p className="text-xs italic text-text_muted dark:text-dark_text_muted mt-4 pt-2 border-t border-neutral_border dark:border-dark_neutral_border">
                    <strong>Disclaimer:</strong> This information is AI-generated and for general knowledge only. It is not medical advice. Always consult your healthcare provider for any health concerns or before making any decisions related to your health or treatment.
                </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymptomLogger;
