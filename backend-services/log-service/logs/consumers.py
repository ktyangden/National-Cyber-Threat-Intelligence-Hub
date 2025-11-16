import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Add this socket to the logs group
        await self.channel_layer.group_add("logs_group", self.channel_name)
        await self.accept()
        print("Client connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("logs_group", self.channel_name)
        print("Client disconnected")

    async def receive(self, text_data):
        # Optional — if client sends data (not needed in your case)
        pass

    # Called when send_log is triggered from group_send
    async def send_log(self, event):
        await self.send(text_data=json.dumps({
            "event": "newLog",
            "data": event["data"]
        }))
