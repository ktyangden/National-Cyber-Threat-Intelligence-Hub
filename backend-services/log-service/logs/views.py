from rest_framework.decorators import api_view
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from collections import defaultdict
from datetime import datetime
from .geoip_utils import init_geoip, ip_to_country
import json
import os

STATS_FILE = os.path.join(os.path.dirname(__file__), "stats.json")

# Default stats structure
default_stats = {
    "total_attacks": 0,
    "unique_ips": [],
    "unique_countries": [],
    "timestamps": []
}

# Load stats.json if exists, else create
# def load_stats():
#     if os.path.exists(STATS_FILE):
#         with open(STATS_FILE, "r") as f:
#             return json.load(f)
#     else:
#         with open(STATS_FILE, "w") as f:
#             json.dump(default_stats, f)
#         return default_stats
def load_stats():
    # If file does not exist → create default
    if not os.path.exists(STATS_FILE):
        save_stats(default_stats)
        return default_stats

    try:
        with open(STATS_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                # file exists but empty → reset
                save_stats(default_stats)
                return default_stats

            return json.loads(content)

    except json.JSONDecodeError:
        # File corrupted → reset it
        save_stats(default_stats)
        return default_stats

def save_stats(data):
    with open(STATS_FILE, "w") as f:
        json.dump(data, f)

# Initialize GeoIP on module load
init_geoip()

# In-memory storage for country counts
_country_counts = defaultdict(int)

# In-memory storage for recent logs
_recent_logs = []
_max_recent_logs = 1000

@api_view(['POST'])
def send_log(request):
    log_data = request.data.get("classifiedLog")
    print("----------------------------------------------------------------------------------------------------------- ")
    print("log_data: ", log_data)
    if not log_data:
        return Response({"status": "error", "message": "No log data provided"}, status=400)

    # Make a copy to avoid modifying the original
    enriched_log = dict(log_data)

    # Extract IP
    ip = enriched_log.get("src_ip") or enriched_log.get("ip") or enriched_log.get("source_ip")
    
    country_iso = None
    
    # ALWAYS add country from IP (force it)
    if ip:
        country_iso = ip_to_country(ip)
        if country_iso:
            enriched_log["country"] = country_iso
            _country_counts[country_iso] += 1
            print(f"Added country {country_iso} for IP {ip}")
        else:
            print(f"Could not resolve country for IP {ip}")
            enriched_log["country"] = None
    
    # ALWAYS add timestamp if missing (force it)
    if not enriched_log.get("timestamp"):
        enriched_log["timestamp"] = datetime.utcnow().isoformat() + "Z"
        print(f"Added timestamp: {enriched_log['timestamp']}")

    # Load existing stats
    stats = load_stats()

    # Update total attacks
    stats["total_attacks"] += 1

    # Track unique IPs
    if ip and ip not in stats["unique_ips"]:
        stats["unique_ips"].append(ip)

    # Track unique countries
    if country_iso and country_iso not in stats["unique_countries"]:
        stats["unique_countries"].append(country_iso)

    # Track timestamp for rate calculations
    stats["timestamps"].append(enriched_log["timestamp"])
    if len(stats["timestamps"]) > 50000:
        stats["timestamps"] = stats["timestamps"][-50000:]  # keep recent window

    # Save back to disk
    save_stats(stats)

    # Store the enriched log
    global _recent_logs
    _recent_logs.append(enriched_log)
    if len(_recent_logs) > _max_recent_logs:
        _recent_logs = _recent_logs[-_max_recent_logs:]

    # Broadcast the ENRICHED log to WebSocket clients
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "logs_group",
        {
            "type": "send_log",
            "data": enriched_log  # Send enriched log, not original
        }
    )

    return Response({"status": "sent", "data": enriched_log})

@api_view(['GET'])
def get_country_counts(request):
    return Response(dict(_country_counts))

@api_view(['POST'])
def reset_country_counts(request):
    global _country_counts, _recent_logs
    _country_counts = defaultdict(int)
    _recent_logs = []
    return Response({"status": "reset", "counts": {}})

@api_view(['GET'])
def get_recent_logs(request):
    limit = request.query_params.get('limit', _max_recent_logs)
    try:
        limit = int(limit)
        limit = min(limit, _max_recent_logs)
    except (ValueError, TypeError):
        limit = _max_recent_logs
    
    recent = _recent_logs[-limit:] if limit < len(_recent_logs) else _recent_logs
    return Response({
        "logs": recent,
        "total": len(_recent_logs),
        "returned": len(recent)
    })

@api_view(['GET'])
def get_persistent_stats(request):
    return Response(load_stats())