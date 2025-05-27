
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ChevronRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  progress: number;
  nextDeadline: string;
  chapters: number;
  completedChapters: number;
  color: string;
}

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onClick: () => void;
}

const CourseCard = ({ course, isSelected, onClick }: CourseCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${course.color}`}></div>
            <h3 className="font-semibold text-gray-900">{course.title}</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <BookOpen className="w-4 h-4 mr-1" />
              {course.completedChapters}/{course.chapters} chapters
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2 text-orange-500" />
            <span className="text-gray-600">{course.nextDeadline}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
