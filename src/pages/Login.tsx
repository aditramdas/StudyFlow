import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, Brain, Target } from "lucide-react";
import { authAPI } from "@/lib/api";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      
      // Store the token
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        console.log('Login successful, token stored:', response.token);
        navigate('/');
      } else {
        setError('Login successful but no token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setEmail('test@example.com');
    setPassword('password123');
    
    // Trigger form submission after setting values
    setTimeout(() => {
      const form = document.getElementById('login-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">StudyFlow AI</h1>
          <p className="text-gray-600">Your intelligent learning companion</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <p className="text-gray-600 text-center">Sign in to continue your learning journey</p>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">For Testing</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline" 
                className="w-full h-11" 
                onClick={handleTestLogin}
                disabled={isLoading}
              >
                <Target className="w-4 h-4 mr-2" />
                Use Test Credentials
              </Button>
            </form>

            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-600 text-center mb-4">What you'll get with StudyFlow AI:</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                  Smart document analysis and summarization
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Brain className="w-4 h-4 mr-2 text-purple-600" />
                  AI-powered study recommendations
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2 text-green-600" />
                  Personalized learning analytics
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Demo version - All services running locally
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 