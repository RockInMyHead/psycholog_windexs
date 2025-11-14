import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Mic, Square, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { userService, chatService } from "@/services/database";
import { psychologistAI } from "@/services/openai";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const {
    isRecording,
    startRecording,
    stopRecording,
    requestPermission,
    hasPermission,
  } = useAudioRecorder();

  // Default user ID for demo purposes
  const defaultUserId = 'user@zenmindmate.com';

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Get or create user
      const userData = await userService.getOrCreateUser(defaultUserId, 'Пользователь');
      setUser(userData);

      // Create new chat session
      const session = await chatService.createChatSession(userData.id);
      setCurrentSessionId(session.id);

      // Add initial bot message
      await chatService.addChatMessage(
        session.id,
        userData.id,
        "Здравствуйте. Я Марк, психолог. Расскажите, что привело вас сюда?",
        "assistant"
      );

      // Load messages for this session
      await loadMessages(session.id);

    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const chatMessages = await chatService.getChatMessages(sessionId);
      const formattedMessages = chatMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role as "user" | "assistant",
        timestamp: msg.timestamp,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentSessionId || !user) return;

    try {
      // Save user message to database
      await chatService.addChatMessage(currentSessionId, user.id, content, "user");

      // Add to local state
      const userMessage: Message = {
        id: Date.now().toString(), // Temporary ID for local state
        text: content,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      setIsTyping(true);
      try {
        // Prepare conversation history for AI
        const conversationHistory = messagesRef.current.concat(userMessage).map(msg => ({
          role: msg.sender as 'user' | 'assistant',
          content: msg.text
        }));

        const botResponse = await psychologistAI.getResponse(conversationHistory);

        // Save bot message to database
        await chatService.addChatMessage(currentSessionId, user.id, botResponse, "assistant");

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        // Fallback message
        const fallbackMessage = "Извините, я временно недоступен. Можете рассказать подробнее о том, что вас беспокоит?";

        await chatService.addChatMessage(currentSessionId, user.id, fallbackMessage, "assistant");

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackMessage,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } finally {
        setIsTyping(false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    await sendMessage(text);
  };

  const handleToggleRecording = async () => {
    try {
      setAudioError(null);

      if (!isRecording) {
        if (!hasPermission) {
          const allowed = await requestPermission();
          if (!allowed) {
            setAudioError("Требуется доступ к микрофону.");
            return;
          }
        }

        await startRecording();
      } else {
        setIsProcessingAudio(true);
        try {
          const audioBlob = await stopRecording();

          if (audioBlob && audioBlob.size > 0) {
            try {
              const transcription = await psychologistAI.transcribeAudio(audioBlob);
              const text = transcription.trim();
              if (text.length > 0) {
                await sendMessage(text);
              } else {
                setAudioError("Не удалось распознать речь. Попробуйте ещё раз.");
              }
            } catch (error) {
              setAudioError("Ошибка при распознавании речи. Попробуйте ещё раз.");
            }
          } else {
            setAudioError("Похоже, запись не содержит звука.");
          }
        } finally {
          setIsProcessingAudio(false);
        }
      }
    } catch (error) {
      console.error("Audio recording error:", error);
      setAudioError("Не удалось получить доступ к микрофону.");
      setIsProcessingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-calm-gradient">
      <Navigation />
      
      <div className="pt-16">
        <div className="w-full">
          <Card className="bg-card border-0 shadow-none animate-scale-in rounded-none">
            <div className="h-[80vh] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
                      <p className="text-muted-foreground">Загрузка чата...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Начните разговор с ИИ-психологом</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 animate-fade-in ${
                        message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex-1 max-w-[80%] p-4 rounded-2xl ${
                          message.sender === "assistant"
                            ? "bg-muted/50 text-foreground"
                            : "bg-hero-gradient text-white shadow-soft"
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                        <span className="text-xs opacity-70 mt-2 block">
                          {message.timestamp.toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex-1 max-w-[80%] p-4 rounded-2xl bg-muted/50 text-foreground">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">Марк печатает...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Напишите ваше сообщение..."
                    className="flex-1 bg-background border-border"
                    disabled={loading || isTyping || isProcessingAudio}
                  />
                  <Button
                    onClick={inputValue.trim() ? handleSend : handleToggleRecording}
                    className="bg-hero-gradient hover:opacity-90 text-white shadow-medium"
                    size="icon"
                    disabled={
                      loading ||
                      isTyping ||
                      (isProcessingAudio && !inputValue.trim())
                    }
                    aria-label={
                      inputValue.trim()
                        ? "Отправить сообщение"
                        : isRecording
                          ? "Остановить запись"
                          : isProcessingAudio
                            ? "Обработка голосового сообщения"
                            : "Начать запись голосового сообщения"
                    }
                  >
                    {inputValue.trim() ? (
                      <Send className="w-5 h-5" />
                    ) : isProcessingAudio ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isRecording ? (
                      <Square className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {(isRecording || isProcessingAudio || audioError) && (
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                    {isRecording && <span className="text-red-500 font-medium">Идёт запись...</span>}
                    {isProcessingAudio && <span>Обрабатываю голосовое сообщение...</span>}
                    {audioError && <span className="text-destructive">{audioError}</span>}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
