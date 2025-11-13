import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User as UserIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import { userService, chatService } from "@/services/database";
import { psychologistAI } from "@/services/openai";

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

  const handleSend = async () => {
    if (!inputValue.trim() || !currentSessionId || !user) return;

    try {
      // Save user message to database
      await chatService.addChatMessage(currentSessionId, user.id, inputValue, "user");

      // Add to local state
      const userMessage: Message = {
        id: Date.now().toString(), // Temporary ID for local state
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue("");

      // Get AI response
      setIsTyping(true);
      try {
        // Prepare conversation history for AI
        const conversationHistory = messages.concat(userMessage).map(msg => ({
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

  return (
    <div className="min-h-screen bg-calm-gradient">
      <Navigation />
      
      <div className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-3">Чат с психологом</h1>
            <p className="text-muted-foreground">Конфиденциальный разговор с психологом Марком</p>
          </div>

          <Card className="bg-card border-2 border-border shadow-medium animate-scale-in">
            <div className="h-[500px] md:h-[600px] flex flex-col">
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === "assistant"
                            ? "bg-hero-gradient shadow-medium"
                            : "bg-accent/20"
                        }`}
                      >
                        {message.sender === "assistant" ? (
                          <Bot className="w-5 h-5 text-white" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-accent" />
                        )}
                      </div>
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
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-hero-gradient shadow-medium">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
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
              <div className="border-t border-border p-4 bg-background/50">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Напишите ваше сообщение..."
                    className="flex-1 bg-background border-border"
                  />
                  <Button
                    onClick={handleSend}
                    className="bg-hero-gradient hover:opacity-90 text-white shadow-medium"
                    size="icon"
                    disabled={loading || isTyping || !inputValue.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
