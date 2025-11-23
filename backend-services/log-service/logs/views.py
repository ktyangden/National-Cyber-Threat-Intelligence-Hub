from rest_framework.decorators import api_view
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from collections import defaultdict
from .geoip_utils import init_geoip, ip_to_country

# Initialize GeoIP on module load
init_geoip()

# In-memory storage for country counts
# Format: {"IN": 41, "CN": 12, ...}
_country_counts = defaultdict(int)

# In-memory storage for recent logs (last 1000 logs)
# Format: [log1, log2, ...]
_recent_logs = []
_max_recent_logs = 1000

@api_view(['POST'])
def send_log(request):
    log_data = request.data.get("classifiedLog")

    # Process IP and update country counts
    if log_data:
        ip = log_data.get("src_ip") or log_data.get("ip") or log_data.get("source_ip")
        if ip:
            country = ip_to_country(ip)
            if country:
                _country_counts[country] += 1

        # Store log in recent logs buffer
        global _recent_logs
        _recent_logs.append(log_data)
        # Keep only the most recent logs
        if len(_recent_logs) > _max_recent_logs:
            _recent_logs = _recent_logs[-_max_recent_logs:]

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

@api_view(['GET'])
def get_country_counts(request):
    """
    Get aggregated country counts for the heatmap.
    Returns: {"IN": 41, "CN": 12, "RU": 7, ...}
    """
    return Response(dict(_country_counts))

@api_view(['POST'])
def reset_country_counts(request):
    """
    Reset the country counts (useful for testing or periodic resets).
    """
    global _country_counts
    _country_counts = defaultdict(int)
    return Response({"status": "reset", "counts": {}})

@api_view(['GET'])
def get_recent_logs(request):
    """
    Get recent logs for clients that connect after logs have been sent.
    Returns the most recent logs (up to max_recent_logs).
    """
    limit = request.query_params.get('limit', _max_recent_logs)
    try:
        limit = int(limit)
        limit = min(limit, _max_recent_logs)  # Cap at max
    except (ValueError, TypeError):
        limit = _max_recent_logs
    
    recent = _recent_logs[-limit:] if limit < len(_recent_logs) else _recent_logs
    return Response({
        "logs": recent,
        "total": len(_recent_logs),
        "returned": len(recent)
    })
