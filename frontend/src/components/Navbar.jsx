import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, Shield, User as UserIcon, Bell } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="h-16 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-agri-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-agri-950/50">
          <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
            <Sprout className="w-6 h-6 text-agri-400" />
          </div>
        </div>
        <div>
          <span className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1.5">
            AgriVision <span className="text-agri-400 font-extrabold">AI</span>
          </span>
          <span className="text-[10px] text-gray-400 block -mt-1 font-mono">Precision Agriculture Framework</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isAdmin && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Administrator
          </span>
        )}

        <div className="flex items-center space-x-3 pl-3 border-l border-gray-800">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-200">{user?.username}</div>
            <div className="text-xs text-gray-400 font-mono capitalize">{user?.role} Account</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-agri-900/60 border border-agri-600/30 flex items-center justify-center text-agri-300 font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
