import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Upload, 
  Brain, 
  Calendar, 
  BarChart3, 
  Bell,
  Activity,
  FileText,
  Clock,
  Target
} from "lucide-react";
import { 
  authAPI, 
  documentAPI, 
  analyticsAPI, 
  scheduleAPI, 
  notificationAPI, 
  healthAPI 
} from "@/lib/api";

interface ServiceStatus {
  name: string;
  status: 'checking' | 'online' | 'offline';
  endpoint: string;
  response?: any;
  error?: string;
}

const TestDashboard = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Gateway', status: 'checking', endpoint: '/health' },
    { name: 'Auth Service', status: 'checking', endpoint: '/auth/health' },
    { name: 'Ingestion Service', status: 'checking', endpoint: '/ingestion/health' },
    { name: 'NLP Service', status: 'checking', endpoint: '/nlp/health' },
    { name: 'Scheduler Service', status: 'checking', endpoint: '/scheduler/health' },
    { name: 'Analytics Service', status: 'checking', endpoint: '/analytics/health' },
    { name: 'Notification Service', status: 'checking', endpoint: '/notifications/health' },
  ]);

  const [testResults, setTestResults] = useState<any>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check service health on component mount
  useEffect(() => {
    checkAllServices();
  }, []);

  const checkAllServices = async () => {
    const healthChecks = [
      { name: 'API Gateway', check: healthAPI.gateway },
      { name: 'Auth Service', check: healthAPI.auth },
      { name: 'Ingestion Service', check: healthAPI.ingestion },
      { name: 'NLP Service', check: healthAPI.nlp },
      { name: 'Scheduler Service', check: healthAPI.scheduler },
      { name: 'Analytics Service', check: healthAPI.analytics },
      { name: 'Notification Service', check: healthAPI.notifications },
    ];

    for (const service of healthChecks) {
      try {
        const response = await service.check();
        setServices(prev => prev.map(s => 
          s.name === service.name 
            ? { ...s, status: 'online', response: response.data }
            : s
        ));
      } catch (error: any) {
        setServices(prev => prev.map(s => 
          s.name === service.name 
            ? { ...s, status: 'offline', error: error.message }
            : s
        ));
      }
    }
  };

  const runEndToEndTest = async () => {
    setIsRunningTests(true);
    const results: any = {};

    try {
      // Test 1: Authentication
      console.log('Testing authentication...');
      try {
        const authResult = await authAPI.login({ 
          email: 'test@example.com', 
          password: 'password123' 
        });
        results.auth = { success: true, data: authResult };
      } catch (error: any) {
        results.auth = { success: false, error: error.message };
      }

      // Test 2: Document Upload (if file selected)
      if (selectedFile) {
        console.log('Testing document upload...');
        try {
          const uploadResult = await documentAPI.upload(selectedFile);
          results.upload = { success: true, data: uploadResult };
        } catch (error: any) {
          results.upload = { success: false, error: error.message };
        }
      }

      // Test 3: Analytics Dashboard
      console.log('Testing analytics...');
      try {
        const analyticsResult = await analyticsAPI.getDashboard();
        results.analytics = { success: true, data: analyticsResult };
      } catch (error: any) {
        results.analytics = { success: false, error: error.message };
      }

      // Test 4: Schedule
      console.log('Testing schedule...');
      try {
        // First seed a schedule
        await scheduleAPI.seedSchedule(1);
        const scheduleResult = await scheduleAPI.getToday();
        results.schedule = { success: true, data: scheduleResult };
      } catch (error: any) {
        results.schedule = { success: false, error: error.message };
      }

      // Test 5: Notifications
      console.log('Testing notifications...');
      try {
        // Send test reminder
        await notificationAPI.sendTestReminder({ documentId: 1, userId: 1 });
        const notificationsResult = await notificationAPI.getNotifications(1);
        results.notifications = { success: true, data: notificationsResult };
      } catch (error: any) {
        results.notifications = { success: false, error: error.message };
      }

      // Test 6: Record Study Session
      console.log('Testing study session recording...');
      try {
        const studyResult = await analyticsAPI.recordStudySession({
          documentId: '1',
          duration: 30
        });
        results.studySession = { success: true, data: studyResult };
      } catch (error: any) {
        results.studySession = { success: false, error: error.message };
      }

    } catch (error: any) {
      console.error('End-to-end test failed:', error);
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">StudyFlow AI - Test Dashboard</h1>
          <p className="text-gray-600">Comprehensive testing interface for all microservices</p>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Service Health</TabsTrigger>
            <TabsTrigger value="testing">End-to-End Testing</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          {/* Service Health Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Service Status</h2>
              <Button onClick={checkAllServices} variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.name} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      {service.name}
                      {service.status === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {service.status === 'online' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {service.status === 'offline' && <XCircle className="w-4 h-4 text-red-500" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge 
                      variant={service.status === 'online' ? 'default' : 'destructive'}
                      className="mb-2"
                    >
                      {service.status}
                    </Badge>
                    <p className="text-xs text-gray-500">{service.endpoint}</p>
                    {service.error && (
                      <p className="text-xs text-red-500 mt-1">{service.error}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* End-to-End Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  End-to-End Test Suite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select Test Document (Optional)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".txt,.pdf,.doc,.docx"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <Alert>
                  <AlertDescription>
                    This test will verify the complete workflow: Authentication → Document Upload → 
                    NLP Processing → Schedule Generation → Analytics → Notifications
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={runEndToEndTest} 
                  disabled={isRunningTests}
                  className="w-full"
                  size="lg"
                >
                  {isRunningTests ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Run End-to-End Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            
            {Object.keys(testResults).length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No test results yet. Run the end-to-end test to see results.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                  <Card key={testName} className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-sm">
                        {testName.charAt(0).toUpperCase() + testName.slice(1)}
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge 
                        variant={result.success ? 'default' : 'destructive'}
                        className="mb-2"
                      >
                        {result.success ? 'PASS' : 'FAIL'}
                      </Badge>
                      
                      {result.success && result.data && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Response:</p>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {!result.success && result.error && (
                        <div className="mt-2">
                          <p className="text-xs text-red-600">{result.error}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestDashboard; 