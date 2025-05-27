
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Bell, Settings, User } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
              <span className="text-white font-bold text-xl">SF</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StudyFlow
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search courses, notes, or flashcards..." 
                className="pl-10 border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
