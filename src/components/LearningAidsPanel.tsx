
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, HelpCircle, BarChart3, Zap, BookOpen } from "lucide-react";

interface LearningAidsPanelProps {
  selectedCourse: string;
}

const LearningAidsPanel = ({ selectedCourse }: LearningAidsPanelProps) => {
  const summaries = [
    { title: "Integration by Parts", difficulty: "Intermediate", readTime: "3 min", type: "Formula" },
    { title: "Trigonometric Substitution", difficulty: "Advanced", readTime: "5 min", type: "Method" },
    { title: "Partial Fractions", difficulty: "Intermediate", readTime: "4 min", type: "Technique" }
  ];

  const flashcards = [
    { front: "∫ x sin(x) dx = ?", type: "Integration", confidence: 85 },
    { front: "When to use u-substitution?", type: "Strategy", confidence: 92 },
    { front: "Derivative of ln(x)", type: "Basic", confidence: 78 }
  ];

  const quizzes = [
    { title: "Integration Techniques Quiz", questions: 15, avgScore: 87, lastAttempt: "2 days ago" },
    { title: "U-Substitution Practice", questions: 10, avgScore: 92, lastAttempt: "1 day ago" },
    { title: "Trig Integration", questions: 12, avgScore: 74, lastAttempt: "3 days ago" }
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Brain className="w-6 h-6 mr-2 text-purple-600" />
          AI-Generated Learning Aids
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summaries" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summaries" className="text-xs">Summaries</TabsTrigger>
            <TabsTrigger value="flashcards" className="text-xs">Flashcards</TabsTrigger>
            <TabsTrigger value="quizzes" className="text-xs">Quizzes</TabsTrigger>
            <TabsTrigger value="mindmap" className="text-xs">Mind Map</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summaries" className="mt-4">
            <div className="space-y-3">
              {summaries.map((summary, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{summary.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">{summary.difficulty}</Badge>
                        <span>•</span>
                        <span>{summary.readTime}</span>
                        <span>•</span>
                        <span>{summary.type}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full mt-4" variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Generate New Summary
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="flashcards" className="mt-4">
            <div className="space-y-3">
              {flashcards.map((card, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{card.front}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">{card.type}</Badge>
                        <span>•</span>
                        <span>Confidence: {card.confidence}%</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Brain className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full mt-4" variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Start Review Session
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="quizzes" className="mt-4">
            <div className="space-y-3">
              {quizzes.map((quiz, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{quiz.questions} questions</span>
                        <span>•</span>
                        <span>Avg: {quiz.avgScore}%</span>
                        <span>•</span>
                        <span>{quiz.lastAttempt}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full mt-4" variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Generate Practice Quiz
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="mindmap" className="mt-4">
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 mb-4">
                <BookOpen className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Mind Map</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Visualize concept relationships and knowledge dependencies
                </p>
                <Button>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Mind Map
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LearningAidsPanel;
