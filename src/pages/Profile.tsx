import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Settings, LogOut, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { userService, userStatsService, chatService, audioCallService, meditationService, quoteService } from "@/services/database";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Default user ID for demo purposes
  const defaultUserId = 'user@zenmindmate.com';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get or create user
      const userData = await userService.getOrCreateUser(defaultUserId, 'Пользователь');
      setUser(userData);
      setName(userData.name);
      setEmail(userData.email);

      // Get user stats
      const statsData = await userStatsService.getUserStats(userData.id);
      setUserStats(statsData);

      // Get recent activity
      const chatSessions = await chatService.getUserChatSessions(userData.id, 5);
      const audioCalls = await audioCallService.getUserAudioCalls(userData.id, 5);
      const meditationSessions = await meditationService.getUserMeditationSessions(userData.id, 5);
      const quoteViews = await quoteService.getUserQuoteViews(userData.id, 5);

      // Combine and sort recent activity
      const activity = [
        ...chatSessions.map(session => ({
          type: 'chat',
          action: 'Сессия чата',
          time: session.createdAt,
          icon: "💬"
        })),
        ...audioCalls.map(call => ({
          type: 'audio',
          action: 'Аудио звонок',
          time: call.createdAt,
          icon: "📞"
        })),
        ...meditationSessions.map(session => ({
          type: 'meditation',
          action: `Медитация: ${session.meditationTitle}`,
          time: session.completedAt,
          icon: "🧘"
        })),
        ...quoteViews.map(view => ({
          type: 'quote',
          action: 'Просмотр цитаты',
          time: view.view.viewedAt,
          icon: "💡"
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

      setRecentActivity(activity);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await userService.updateUser(user.id, { name, email: user.email });
      await loadUserData(); // Reload data
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Менее часа назад';
    if (diffInHours < 24) return `${diffInHours} часов назад`;
    if (diffInHours < 48) return 'Вчера';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} дней назад`;
    return formatDate(date);
  };

  const stats = userStats ? [
    { label: "Сессий чата", value: userStats.totalChatSessions.toString(), icon: "💬" },
    { label: "Аудио звонков", value: userStats.totalAudioCalls.toString(), icon: "📞" },
    { label: "Просмотрено фраз", value: userStats.totalQuotesViewed.toString(), icon: "💡" },
    { label: "Минут медитации", value: userStats.totalMeditationMinutes.toString(), icon: "🧘" },
  ] : [
    { label: "Сессий чата", value: "0", icon: "💬" },
    { label: "Аудио звонков", value: "0", icon: "📞" },
    { label: "Просмотрено фраз", value: "0", icon: "💡" },
    { label: "Минут медитации", value: "0", icon: "🧘" },
  ];

  return (
    <div className="min-h-screen bg-calm-gradient">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-white mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Личный кабинет</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Профиль</h1>
            <p className="text-muted-foreground text-lg">
              Управляйте своим аккаунтом и отслеживайте прогресс
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 p-6 bg-card-gradient border-2 border-border shadow-medium text-center animate-scale-in">
              <div className="w-24 h-24 mx-auto rounded-full bg-hero-gradient text-white flex items-center justify-center shadow-strong mb-4">
                <User className="w-12 h-12 " />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {loading ? "Загрузка..." : name}
              </h2>
              <p className="text-muted-foreground mb-4">
                {loading ? "Загрузка..." : email}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="w-4 h-4" />
                <span>
                  {loading ? "Загрузка..." : `С нами с ${user ? formatDate(user.createdAt) : ''}`}
                </span>
              </div>
              <Button variant="outline" className="w-full gap-2 hover:bg-primary/10 border-primary/30">
                <Settings className="w-4 h-4" />
                Настройки
              </Button>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <Card className="p-6 bg-card border-2 border-border shadow-soft animate-fade-in">
                <h3 className="text-xl font-bold text-foreground mb-6">Ваша активность</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="text-center p-4 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors"
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Edit Profile */}
              <Card className="p-6 bg-card border-2 border-border shadow-soft animate-fade-in" style={{ animationDelay: "100ms" }}>
                <h3 className="text-xl font-bold text-foreground mb-6">Редактировать профиль</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-white" />
                      Имя
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    className="w-full bg-hero-gradient text-white hover:shadow-lg  shadow-medium"
                    disabled={loading}
                  >
                    {loading ? "Сохранение..." : "Сохранить изменения"}
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6 bg-card border-2 border-border shadow-soft animate-fade-in" style={{ animationDelay: "200ms" }}>
                <h3 className="text-xl font-bold text-foreground mb-4">Последняя активность</h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Загрузка активности...
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{activity.icon}</span>
                          <span className="font-medium text-foreground">{activity.action}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(activity.time)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Пока нет активности. Начните использовать приложение!
                    </div>
                  )}
                </div>
              </Card>

              {/* Logout */}
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:bg-destructive/10 border-destructive/30 animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <LogOut className="w-4 h-4" />
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
