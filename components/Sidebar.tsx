
import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Calendar, Syringe, Crown,
  LogOut, Activity, ClipboardList, ChevronDown,
  ChevronRight, Stethoscope, ShieldAlert, Bell, CreditCard
} from 'lucide-react';
import { CLINIC_NAME } from '../constants';
import { useStore } from '../context/StoreContext';
import { NotificationsPanel } from './NotificationsPanel';
import { User } from '../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, onLogout, user }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'modules': true
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patient Master', icon: Users },
    { id: 'treatments', label: 'All Treatments', icon: ClipboardList },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldAlert }] : []),

    {
      id: 'modules',
      label: 'Clinical Modules',
      icon: Stethoscope,
      type: 'group',
      children: [
        { id: 'rct', label: 'RCT Module', icon: Syringe },
        { id: 'pulpectomy', label: 'Pulpectomy', icon: Activity },
        { id: 'crown', label: 'Crown / Lab', icon: Crown },
        { id: 'ortho', label: 'Orthodontics', icon: Activity },
      ]
    }
  ];

  return (
    <div className="flex h-full flex-col bg-white text-slate-700 border-r border-gray-200">
      <div className="flex items-center justify-center border-b border-teal-700 bg-teal-600 px-4 py-6 shadow-sm">
        <img
          src="https://rajtruedent.com/wp-content/uploads/2023/07/Raj_true_Dent__4_-removebg-preview-e1688891234126.png"
          alt={CLINIC_NAME}
          className="h-16 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item: any) => {
            if (item.type === 'group') {
              const isExpanded = expandedGroups[item.id];
              const GroupIcon = item.icon;
              return (
                <li key={item.id} className="pt-2">
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600"
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon size={14} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {isExpanded && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                      {item.children.map((child: any) => {
                        const ChildIcon = child.icon;
                        const isChildActive = currentRoute === child.id;
                        return (
                          <li key={child.id}>
                            <button
                              onClick={() => onNavigate(child.id)}
                              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${isChildActive
                                ? 'bg-teal-50 text-teal-700 font-bold'
                                : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
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

            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                    : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                    }`}
                >
                  <Icon size={20} className={isActive ? 'text-teal-100' : 'text-slate-400'} />
                  <span className="font-bold">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-4 text-center text-[10px] tracking-widest text-slate-300 font-bold uppercase">
        Raj True Dent v1.3.1
      </div>
    </div>
  );
};
