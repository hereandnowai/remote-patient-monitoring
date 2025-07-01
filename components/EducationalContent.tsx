
import React, { useState } from 'react';
import type { EducationalResource } from '../types';
import { BookOpenIcon, VideoCameraIcon, PuzzlePieceIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const placeholderResources: EducationalResource[] = [
  { id: '1', type: 'article', title: 'Understanding Your Blood Pressure', summary: 'Learn what blood pressure numbers mean and how to manage them effectively through lifestyle changes and medical guidance.', thumbnailUrl: 'https://picsum.photos/seed/bp/600/400', tags: ['hypertension', 'blood pressure', 'heart health', 'monitoring'] },
  { id: '2', type: 'video', title: 'Managing Diabetes: Diet Tips', summary: 'A short video on dietary choices for individuals with diabetes, focusing on balanced meals and sugar control.', thumbnailUrl: 'https://picsum.photos/seed/diabetes/600/400', contentUrl: 'https://www.youtube.com/embed/exampleVideoID1', tags: ['diabetes', 'diet', 'nutrition', 'healthy eating'] },
  { id: '3', type: 'interactive', title: 'Stress Reduction Exercise', summary: 'A guided breathing exercise and mindfulness session to help manage stress and improve mental well-being.', thumbnailUrl: 'https://picsum.photos/seed/stress/600/400', tags: ['mental health', 'stress', 'cbt', 'mindfulness', 'relaxation'] },
  { id: '4', type: 'article', title: 'Benefits of Regular Exercise', summary: 'Discover how physical activity, from walking to strength training, can improve your overall health and longevity.', thumbnailUrl: 'https://picsum.photos/seed/exercise/600/400', tags: ['fitness', 'exercise', 'lifestyle', 'well-being'] },
  { id: '5', type: 'video', title: 'COPD: Symptoms and Management', summary: 'An overview of COPD, its common symptoms, and effective strategies for managing the condition and improving quality of life.', thumbnailUrl: 'https://picsum.photos/seed/copd/600/400', contentUrl: 'https://www.youtube.com/embed/exampleVideoID2', tags: ['copd', 'respiratory', 'lung health', 'breathing'] },
  { id: '6', type: 'article', title: 'Healthy Sleep Habits', summary: 'Tips for improving your sleep quality for better health, cognitive function, and emotional well-being.', thumbnailUrl: 'https://picsum.photos/seed/sleep/600/400', tags: ['sleep', 'lifestyle', 'mental health', 'insomnia'] },
];

interface ResourceIconProps {
  type: 'article' | 'video' | 'interactive';
  className?: string;
}

const ResourceIcon: React.FC<ResourceIconProps> = ({ type, className = "h-6 w-6" }) => {
  if (type === 'article') return <BookOpenIcon className={`${className} text-status_blue dark:text-blue-400`} />;
  if (type === 'video') return <VideoCameraIcon className={`${className} text-status_purple dark:text-purple-400`} />;
  if (type === 'interactive') return <PuzzlePieceIcon className={`${className} text-status_green dark:text-green-400`} />;
  return <BookOpenIcon className={`${className} text-gray-500 dark:text-gray-400`} />;
};

const EducationalContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState<EducationalResource | null>(null);

  const filteredResources = placeholderResources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedResource) {
    return (
      <div className="p-4 md:p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-3xl mx-auto animate-fadeIn">
        <button 
            onClick={() => setSelectedResource(null)} 
            className="mb-6 text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary font-semibold flex items-center group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Resources
        </button>
        <div className="flex items-start space-x-4 mb-4">
            <ResourceIcon type={selectedResource.type} className="h-10 w-10 mt-1 flex-shrink-0" />
            <div>
                <h2 className="text-3xl font-bold text-text_default dark:text-dark_text_default">{selectedResource.title}</h2>
                <span className="text-sm text-text_muted dark:text-dark_text_muted capitalize">{selectedResource.type}</span>
            </div>
        </div>

        {selectedResource.thumbnailUrl && <img src={selectedResource.thumbnailUrl} alt={selectedResource.title} className="w-full h-auto object-cover rounded-lg mb-6 shadow-md max-h-96" />}
        
        <div className="prose prose-lg max-w-none text-text_muted dark:text-dark_text_muted dark:prose-invert leading-relaxed mb-6"> {/* prose-invert for dark mode typography */}
            <p className="font-semibold text-lg text-text_default dark:text-dark_text_default">{selectedResource.summary}</p>
            {selectedResource.type === 'article' && (selectedResource.content || "Full article content would be displayed here. This section might include detailed explanations, advice, and further reading suggestions related to the topic. For example, if it's about blood pressure, it could discuss diet, exercise, medication adherence, and regular monitoring.")}
        </div>

        {selectedResource.type === 'video' && selectedResource.contentUrl && (
          <div className="my-6">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <iframe 
                src={selectedResource.contentUrl.includes('youtube.com/embed') ? selectedResource.contentUrl : "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                title={selectedResource.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
             <p className="text-sm text-text_muted dark:text-dark_text_muted mt-2">Video content related to "{selectedResource.title}" would play here.</p>
          </div>
        )}
        {selectedResource.type === 'interactive' && (
          <div className="my-6 p-6 border border-status_green dark:border-green-400 rounded-lg bg-green-50 dark:bg-dark_bg_green_50 text-center">
            <PuzzlePieceIcon className="h-12 w-12 text-status_green dark:text-green-300 mx-auto mb-3"/>
            <p className="text-green-800 dark:text-dark_text_green_700 text-lg mb-4">Interactive content for "{selectedResource.title}" would be presented here. This could be a quiz, guided exercise, or simulation.</p>
            <button className="bg-status_green text-white dark:text-text_on_primary py-2 px-6 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition duration-200 shadow-md">Start Interactive Session</button>
          </div>
        )}
        <div className="mt-8 pt-4 border-t border-neutral_border dark:border-dark_neutral_border">
          <h4 className="font-semibold text-text_muted dark:text-dark_text_muted mb-2">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedResource.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm rounded-full shadow-sm capitalize">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-primary mb-8 text-center">Educational Resources</h2>
      <div className="mb-8 relative max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Search resources (e.g., diabetes, heart health)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pl-12 border border-neutral_border dark:border-dark_neutral_border rounded-full shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"
        />
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
      </div>

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <div
              key={resource.id}
              onClick={() => setSelectedResource(resource)}
              className="bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-lg dark:shadow-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out flex flex-col group hover:shadow-2xl dark:hover:shadow-primary/20"
            >
              {resource.thumbnailUrl && <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110" />}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start space-x-2 mb-2">
                  <ResourceIcon type={resource.type} className="h-5 w-5 mt-1 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default group-hover:text-primary dark:group-hover:text-primary-light transition-colors">{resource.title}</h3>
                </div>
                <p className="text-text_muted dark:text-dark_text_muted text-sm mb-4 flex-grow line-clamp-3">{resource.summary}</p>
                <div className="mt-auto pt-3 border-t border-neutral_border dark:border-dark_neutral_border">
                   <div className="flex flex-wrap gap-2">
                    {resource.tags.slice(0,3).map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs rounded-full capitalize group-hover:bg-primary-light dark:group-hover:bg-primary-dark/30 group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors">{tag}</span>
                    ))}
                    {resource.tags.length > 3 && <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs rounded-full">+{resource.tags.length - 3} more</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
            <p className="text-xl text-text_muted dark:text-dark_text_muted">No resources found matching "{searchTerm}".</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Try searching for different keywords or browse all topics.</p>
        </div>
      )}
    </div>
  );
};

export default EducationalContent;