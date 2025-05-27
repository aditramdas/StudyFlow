
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Brain, Clock, Target } from "lucide-react";

const StudyPlannerCard = () => {
  const studyGoals = [
    { subject: "Calculus", goal: "Master Integration", deadline: "May 10", progress: 75 },
    { subject: "Physics", goal: "Electromagnetic Theory", deadline: "May 12", progress: 60 },
    { subject: "Chemistry", goal: "Reaction Mechanisms", deadline: "May 8", progress: 90 }
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Brain className="w-5 h-5 mr-2 text-green-600" />
          AI Study Planner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Next Recommended Session</span>
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Calculus - Integration Practice</p>
            <p className="text-sm text-gray-600">Optimal time: 2:00 PM (25 min focus session)</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Goals</h4>
            <div className="space-y-3">
              {studyGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{goal.goal}</div>
                    <div className="text-gray-500">{goal.subject} • Due {goal.deadline}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{goal.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Button className="w-full" variant="outline">
            <Target className="w-4 h-4 mr-2" />
            Optimize Study Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyPlannerCard;
