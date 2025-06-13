import React from 'react';
import { Plus, MessageSquare, Map, Calendar, BarChart3, StickyNote } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      title: 'Adaugă Teren',
      description: 'Creează un teren nou',
      icon: Plus,
      path: '/plots',
      color: 'from-green-500 to-green-600',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      title: 'AI Chat',
      description: 'Conversații inteligente',
      icon: MessageSquare,
      path: '/ai-chat',
      color: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'Hartă',
      description: 'Vizualizează terenurile',
      icon: Map,
      path: '/maps',
      color: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      title: 'Calendar',
      description: 'Programează activități',
      icon: Calendar,
      path: '/calendar',
      color: 'from-amber-500 to-amber-600',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
    },
    {
      title: 'Predicții',
      description: 'Analiză randament',
      icon: BarChart3,
      path: '/yield',
      color: 'from-indigo-500 to-indigo-600',
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    },
    {
      title: 'Notițe Teren',
      description: 'Observații și notițe',
      icon: StickyNote,
      path: '/field-notes',
      color: 'from-red-500 to-red-600',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Acțiuni Rapide
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          
          return (
            <button
              key={action.path}
              onClick={() => onNavigate(action.path)}
              className={`
                ${action.bgColor} 
                border border-gray-200 rounded-xl p-4 
                transition-all duration-200 hover:shadow-md hover:scale-105
                group text-left
              `}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-lg ${action.bgColor.split(' ')[0]} border border-gray-200`}>
                  <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 text-sm group-hover:text-gray-900">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;