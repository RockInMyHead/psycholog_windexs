import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsModal = ({ open, onOpenChange }: TermsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Пользовательское соглашение</DialogTitle>
          <DialogDescription>
            Пожалуйста, внимательно прочитайте условия использования сервиса
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Общие положения</h3>
              <p>
                Настоящее пользовательское соглашение (далее — "Соглашение") регулирует отношения
                между пользователем сервиса "Windexs-Психолог" (далее — "Сервис") и владельцем сервиса.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Предмет соглашения</h3>
              <p>
                Сервис предоставляет пользователям доступ к искусственному интеллекту в роли
                профессионального психолога, а также дополнительные функции для поддержки
                психологического благополучия.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Условия использования</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Пользователь обязуется использовать сервис только в законных целях</li>
                <li>Запрещено использование сервиса для причинения вреда себе или другим</li>
                <li>Пользователь несет ответственность за конфиденциальность своей учетной записи</li>
                <li>Сервис предназначен для информационной поддержки, а не замены профессиональной помощи</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Конфиденциальность</h3>
              <p>
                Мы уважаем вашу конфиденциальность. Личные данные используются исключительно
                для предоставления услуг и не передаются третьим лицам без вашего согласия.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Ограничение ответственности</h3>
              <p>
                Сервис предоставляется "как есть". Мы не несем ответственности за любые
                последствия использования информации, полученной через сервис.
                В случае психологических проблем рекомендуется обратиться к квалифицированным специалистам.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Подписка и платежи</h3>
              <p>
                Премиум подписка предоставляет дополнительные возможности сервиса.
                Оплата производится в соответствии с выбранным тарифом.
                Подписка автоматически продлевается, если не отменена пользователем.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Изменения условий</h3>
              <p>
                Мы оставляем за собой право изменять условия соглашения.
                Продолжение использования сервиса означает принятие новых условий.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Контакты</h3>
              <p>
                По вопросам использования сервиса вы можете обратиться по адресу поддержки.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Понятно
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
