from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json

class BattleConsumer(WebsocketConsumer):
    def connect(self):
        # Извлекаем battle_id из URL маршрута (self.scope['url_route']['kwargs'])
        self.battle_id = self.scope['url_route']['kwargs'].get('battle_id')
        self.group_name = f"battle_{self.battle_id}"
        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()
        self.send(text_data=json.dumps({
            "type": "connection_success",
            "message": f"Подключение к битве {self.battle_id} успешно"
        }))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.group_name, self.channel_name)

    def receive(self, text_data):
        data = json.loads(text_data)
        # Пример обработки действия submit_answer
        action = data.get("action")
        if action == "submit_answer":
            answer = data.get("answer")
            # Здесь можно добавить обработку ответа
            self.send(text_data=json.dumps({
                "type": "answer_received",
                "message": f"Ответ '{answer}' получен"
            }))
        # Можно добавить другие действия

    def battle_update(self, event):
        # Отправка обновления всем участникам группы
        self.send(text_data=json.dumps({
            "type": event.get("type", "battle_update"),
            "message": event.get("message", "")
        }))
