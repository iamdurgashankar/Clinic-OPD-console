import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Calendar, Syringe, Crown, 
  Settings, LogOut, Activity, ClipboardList, ChevronDown, 
  ChevronRight, Stethoscope 
} from 'lucide-react';
import { CLINIC_NAME } from '../constants';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  // State to manage expanded groups. Default 'modules' to open for better discovery.
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'modules': true
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Master', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'treatments', label: 'All Treatments', icon: ClipboardList }, // Unified View
    
    // Grouped Section
    { 
      id: 'modules', 
      label: 'Clinical Modules', 
      icon: Stethoscope,
      type: 'group',
      children: [
        { id: 'rct', label: 'RCT Module', icon: Syringe },
        { id: 'pulpectomy', label: 'Pulpectomy', icon: Activity },
        { id: 'crown', label: 'Crown / Lab', icon: Crown },
        { id: 'ortho', label: 'Orthodontics', icon: Settings },
      ]
    },
  ];

  return (
    <div className="flex h-full flex-col bg-white text-slate-700 border-r border-gray-200">
      <div className="flex items-center justify-center border-b border-gray-100 p-6">
        <h1 className="text-2xl font-bold tracking-wider text-teal-700">{CLINIC_NAME}</h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item: any) => {
            // Render Group (Accordion)
            if (item.type === 'group') {
              const isExpanded = expandedGroups[item.id];
              const Icon = item.icon;
              const hasActiveChild = item.children.some((child: any) => child.id === currentRoute);

              return (
                <li key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                      hasActiveChild ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={hasActiveChild ? 'text-teal-600' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {/* Children Items */}
                  {isExpanded && (
                    <ul className="ml-4 space-y-1 border-l-2 border-gray-100 pl-2 transition-all">
                      {item.children.map((child: any) => {
                         const ChildIcon = child.icon;
                         const isChildActive = currentRoute === child.id;
                         return (
                           <li key={child.id}>
                             <button
                               onClick={() => onNavigate(child.id)}
                               className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${
                                 isChildActive
                                   ? 'bg-teal-50 text-teal-700 font-semibold' 
                                   : 'text-slate-500 hover:text-slate-800 hover:bg-gray-50'
                               }`}
                             >
                               <ChildIcon size={18} className={isChildActive ? 'text-teal-600' : 'text-slate-400'} />
                               <span>{child.label}</span>
                             </button>
                           </li>
                         );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            // Render Standard Item
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' 
                      : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-teal-100' : 'text-slate-400'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        <div className="mt-4 text-center text-xs text-slate-400">
          v1.1.0 | Admin Panel
        </div>
      </div>
    </div>
  );
};