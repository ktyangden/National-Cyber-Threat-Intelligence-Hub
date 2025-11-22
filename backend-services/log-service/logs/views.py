from rest_framework.decorators import api_view
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['POST'])
def send_log(request):
    log_data = request.data.get("classifiedLog")

    # Broadcast this log to all connected WebSocket clients
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "logs_group",
        {
            "type": "send_log",
            "data": log_data
        }
    )

    # print("Log Data: ",log_data)

    return Response({"status": "sent", "data": log_data})
