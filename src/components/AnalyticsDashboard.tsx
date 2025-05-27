
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Clock, Target, Award } from "lucide-react";

const AnalyticsDashboard = () => {
  const weeklyStats = [
    { day: "Mon", hours: 2.5, score: 85 },
    { day: "Tue", hours: 3.2, score: 78 },
    { day: "Wed", hours: 1.8, score: 92 },
    { day: "Thu", hours: 2.9, score: 88 },
    { day: "Fri", hours: 4.1, score: 91 },
    { day: "Sat", hours: 3.5, score: 86 },
    { day: "Sun", hours: 2.8, score: 89 }
  ];

  const subjects = [
    { name: "Calculus", strength: 92, improvement: "+8%", trend: "up" },
    { name: "Physics", strength: 76, improvement: "+12%", trend: "up" },
    { name: "Chemistry", strength: 88, improvement: "-3%", trend: "down" },
    { name: "Statistics", strength: 82, improvement: "+5%", trend: "up" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Performance Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900">21.8h</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% vs last week
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +4% vs last week
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cards Reviewed</p>
                <p className="text-2xl font-bold text-gray-900">347</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +22% vs last week
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">12 days</p>
                <p className="text-sm text-orange-600 flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  Personal best!
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Weekly Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 w-12">{day.day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(day.hours / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{day.hours}h</span>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {day.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900">{subject.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${subject.strength}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{subject.strength}%</span>
                    <div className={`flex items-center text-sm ${subject.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {subject.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="ml-1">{subject.improvement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
