
import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { APP_NAME, COMPANY_NAME, COMPANY_LOGO_URL, COMPANY_IMAGE_URL } from '../constants';

const AboutPage: React.FC = () => {
  return (
    <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl animate-fadeIn max-w-3xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <img src={COMPANY_LOGO_URL} alt={`${COMPANY_NAME} Logo`} className="h-24 w-24 rounded-full mb-4 shadow-md border-2 border-primary dark:border-primary-dark" />
        <h2 className="text-4xl font-bold text-primary mb-2">{APP_NAME}</h2>
        <p className="text-lg text-text_muted dark:text-dark_text_muted">By {COMPANY_NAME}</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-text_default dark:text-dark_text_default leading-relaxed">
        <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default">Our Mission</h3>
        <p>
          At {COMPANY_NAME}, our mission is to empower individuals to take control of their health through innovative and accessible technology. 
          The {APP_NAME} application is designed to help you monitor your vital signs, manage medications, track symptoms, and stay connected with your healthcare providers, all from the comfort of your home.
        </p>

        <h3 className="text-xl font-semibold mt-6 text-text_default dark:text-dark_text_default">Key Features</h3>
        <ul>
          <li><strong>Vital Signs Logging:</strong> Easily record and track your blood pressure, glucose levels, heart rate, temperature, oxygen saturation, and weight.</li>
          <li><strong>Medication Management:</strong> Keep a schedule of your medications, mark them as taken, and receive reminders.</li>
          <li><strong>Symptom Tracking:</strong> Log your symptoms with severity and notes, and gain AI-powered insights (for informational purposes only).</li>
          <li><strong>Telehealth Requests:</strong> Request virtual appointments with your healthcare providers.</li>
          <li><strong>AI Health Assistant:</strong> Interact with "Aura", our AI assistant, for general health information and app guidance (not medical advice).</li>
          <li><strong>Educational Content:</strong> Access a library of articles and videos to learn more about managing your health.</li>
        </ul>

        {COMPANY_IMAGE_URL && (
          <div className="my-8 text-center">
            <img src={COMPANY_IMAGE_URL} alt={`${COMPANY_NAME} illustration or banner`} className="max-w-md mx-auto rounded-lg shadow-lg" />
          </div>
        )}
        
        <h3 className="text-xl font-semibold mt-6 text-text_default dark:text-dark_text_default">Technology</h3>
        <p>
          This application utilizes modern web technologies and is powered by Google's Gemini AI for its intelligent features. We are committed to ensuring a secure and user-friendly experience.
        </p>

        <h3 className="text-xl font-semibold mt-6 text-text_default dark:text-dark_text_default">Disclaimer</h3>
        <p>
          The {APP_NAME} application is intended for informational and tracking purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. 
          Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. 
          Never disregard professional medical advice or delay in seeking it because of something you have read or seen in this application.
          If you think you may have a medical emergency, call your doctor or 911 immediately.
        </p>

        <p className="mt-8 text-sm text-center text-text_muted dark:text-dark_text_muted">
          Version: 1.0.0 (Simulated) <br />
          &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
