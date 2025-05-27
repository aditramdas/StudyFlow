
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Calendar, FileText, Plus, Search, BarChart3, Brain, Clock, Target, ChevronRight } from "lucide-react";
import StudyPlannerCard from "@/components/StudyPlannerCard";
import CourseCard from "@/components/CourseCard";
import LearningAidsPanel from "@/components/LearningAidsPanel";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import Header from "@/components/Header";

const Index = () => {
  const [selectedCourse, setSelectedCourse] = useState("calculus");

  const courses = [
    {
      id: "calculus",
      title: "Calculus II",
      progress: 78,
      nextDeadline: "Final Exam - May 15",
      chapters: 12,
      completedChapters: 9,
      color: "bg-blue-500"
    },
    {
      id: "physics", 
      title: "Physics 101",
      progress: 45,
      nextDeadline: "Midterm - May 8",
      chapters: 8,
      completedChapters: 4,
      color: "bg-purple-500"
    },
    {
      id: "chemistry",
      title: "Organic Chemistry",
      progress: 92,
      nextDeadline: "Lab Report - May 3",
      chapters: 15,
      completedChapters: 14,
      color: "bg-green-500"
    }
  ];

  const upcomingStudy = [
    { time: "2:00 PM", subject: "Calculus - Integration Techniques", type: "Review", duration: "45 min" },
    { time: "4:30 PM", subject: "Physics - Electromagnetic Waves", type: "Flashcards", duration: "20 min" },
    { time: "7:00 PM", subject: "Chemistry - Reaction Mechanisms", type: "Practice Quiz", duration: "30 min" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome back, Alex!</h1>
              <p className="text-blue-100 mb-6">You have 3 upcoming study sessions today. Let's make progress!</p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course Material
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Study Plan
                </Button>
              </div>
            </div>

            {/* Courses Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <CourseCard 
                    key={course.id}
                    course={course}
                    isSelected={selectedCourse === course.id}
                    onClick={() => setSelectedCourse(course.id)}
                  />
                ))}
              </div>
            </div>

            {/* Learning Aids */}
            <LearningAidsPanel selectedCourse={selectedCourse} />
          </div>

          {/* Right Column - Study Planner & Analytics */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingStudy.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{session.subject}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {session.time} • {session.duration}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.type}
                    </Badge>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Study Planner */}
            <StudyPlannerCard />

            {/* Quick Analytics */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  This Week's Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Study Time</span>
                      <span className="font-medium">12.5 / 15 hours</span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Flashcards Reviewed</span>
                      <span className="font-medium">245 cards</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Quiz Average</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="mt-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
};

export default Index;
