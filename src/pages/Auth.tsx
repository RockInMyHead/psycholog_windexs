import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Navigation from '@/components/Navigation';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen bg-calm-gradient">
      <Navigation />

      <div className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Добро пожаловать
            </h1>
            <p className="text-muted-foreground">
              Войдите в свой аккаунт или создайте новый
            </p>
          </div>

          <Card className="bg-card-gradient border-2 border-border shadow-strong animate-scale-in">
            <CardHeader>
              <CardTitle className="text-center">Windexs-Психолог</CardTitle>
              <CardDescription className="text-center">
                Ваш путь к внутренней гармонии
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Вход</TabsTrigger>
                  <TabsTrigger value="register">Регистрация</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <LoginForm />
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>Получите профессиональную психологическую поддержку 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
