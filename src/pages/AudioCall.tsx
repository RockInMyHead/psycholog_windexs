import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import Navigation from "@/components/Navigation";
import { userService, audioCallService, chatService } from "@/services/database";
import { useAuth } from "@/contexts/AuthContext";

const AudioCall = () => {
  const { user: authUser } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [user, setUser] = useState<UserType | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Default user ID for demo purposes
  const defaultUserId = 'user@zenmindmate.com';

  useEffect(() => {
    initializeUser();
  }, [authUser]);

  const initializeUser = async () => {
    try {
      const userData = await userService.getOrCreateUser(defaultUserId, 'Пользователь');
      setUser(userData);
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCall = async () => {
    if (!user) return;

    try {
      // Create audio call record in database
      const call = await audioCallService.createAudioCall(user.id);
      setCurrentCallId(call.id);

      setIsCallActive(true);

      // Start call duration counter
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Store interval ID for cleanup
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = async () => {
    if (!currentCallId) return;

    try {
      // Update call record with duration
      await audioCallService.endAudioCall(currentCallId, callDuration);

      setIsCallActive(false);
      setCallDuration(0);
      setIsMuted(false);
      setCurrentCallId(null);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-calm-gradient">
      <Navigation />
      
      <div className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-3">Аудио звонок</h1>
            <p className="text-muted-foreground">Голосовая сессия с ИИ-психологом</p>
          </div>

          <Card className="bg-card-gradient border-2 border-border shadow-strong p-8 md:p-12 text-center animate-scale-in">
            {!isCallActive ? (
              <div className="space-y-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-hero-gradient text-white flex items-center justify-center shadow-strong animate-pulse-soft">
                  <Phone className="w-16 h-16 " />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Начать звонок с психологом
                  </h2>
                  <p className="text-muted-foreground">
                    Нажмите кнопку ниже, чтобы начать голосовую сессию
                  </p>
                </div>

                <Button
                  onClick={startCall}
                  size="lg"
                  className="bg-hero-gradient text-white hover:shadow-lg  shadow-medium text-lg px-12 py-6"
                  disabled={loading}
                >
                  <Phone className="w-6 h-6 mr-2" />
                  {loading ? "Загрузка..." : "Позвонить"}
                </Button>

                <div className="pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Советы для продуктивного звонка:</h3>
                  <ul className="text-left text-muted-foreground space-y-2 max-w-md mx-auto">
                    <li>• Найдите тихое место, где вас никто не побеспокоит</li>
                    <li>• Подготовьте темы, которые хотите обсудить</li>
                    <li>• Говорите открыто и честно</li>
                    <li>• Не торопитесь, дайте себе время подумать</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="w-40 h-40 mx-auto rounded-full bg-hero-gradient text-white flex items-center justify-center shadow-strong animate-float">
                  <Volume2 className="w-20 h-20  animate-pulse" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Звонок идет
                  </h2>
                  <p className="text-3xl font-mono text-white">
                    {formatDuration(callDuration)}
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    size="lg"
                    variant={isMuted ? "destructive" : "outline"}
                    className="rounded-full w-16 h-16 p-0"
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>

                  <Button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    size="lg"
                    variant={!isSpeakerOn ? "destructive" : "outline"}
                    className="rounded-full w-16 h-16 p-0"
                  >
                    {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  </Button>

                  <Button
                    onClick={endCall}
                    size="lg"
                    variant="destructive"
                    className="rounded-full w-16 h-16 p-0 shadow-medium"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </div>

                <p className="text-muted-foreground text-sm">
                  {isMuted && "Микрофон выключен • "}
                  {!isSpeakerOn && "Звук выключен • "}
                  Нажмите красную кнопку для завершения звонка
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AudioCall;
