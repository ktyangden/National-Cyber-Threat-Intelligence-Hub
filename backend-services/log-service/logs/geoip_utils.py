"""
GeoIP utility functions for converting IP addresses to countries.
Uses MaxMind GeoLite2 database (offline, free).
"""
import os
from collections import defaultdict
from typing import Dict, Optional

try:
    import geoip2.database
    GEOIP_AVAILABLE = True
except ImportError:
    GEOIP_AVAILABLE = False
    print("WARNING: geoip2 library not installed. Install with: pip install geoip2")

# Global reader instance (lazy loaded)
_reader = None
_db_path = None

def init_geoip(db_path: str = None):
    """
    Initialize the GeoIP database reader.
    
    Args:
        db_path: Path to GeoLite2-Country.mmdb file.
                 If None, looks for it in common locations or uses GEOIP_DB_PATH env var.
    """
    global _reader, _db_path
    
    if not GEOIP_AVAILABLE:
        return False
    
    if _reader is not None:
        return True
    
    # Try to find the database file
    if db_path is None:
        # Check environment variable first
        db_path = os.getenv("GEOIP_DB_PATH")
        
        # If not in env, check common locations
        if db_path is None or not os.path.exists(db_path):
            possible_paths = [
                "GeoLite2-Country.mmdb",
                "backend-services/log-service/GeoLite2-Country.mmdb",
                os.path.join(os.path.dirname(__file__), "GeoLite2-Country.mmdb"),
                os.path.join(os.path.dirname(__file__), "..", "GeoLite2-Country.mmdb"),
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    db_path = path
                    break
        
        if db_path is None or not os.path.exists(db_path):
            print("WARNING: GeoLite2-Country.mmdb not found. Please download it from MaxMind.")
            print("See GEOIP_SETUP.md for instructions.")
            return False
    
    if not os.path.exists(db_path):
        print(f"WARNING: GeoIP database not found at {db_path}")
        return False
    
    try:
        _reader = geoip2.database.Reader(db_path)
        _db_path = db_path
        print(f"GeoIP database loaded from {db_path}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to load GeoIP database: {e}")
        return False

def ip_to_country(ip: str) -> Optional[str]:
    """
    Convert an IP address to a country ISO code.
    
    Args:
        ip: IP address string (e.g., "14.139.242.195")
    
    Returns:
        Country ISO code (e.g., "IN") or None if not found/error
    """
    global _reader
    
    if not GEOIP_AVAILABLE or _reader is None:
        return None
    
    try:
        response = _reader.country(ip)
        return response.country.iso_code
    except Exception as e:
        # IP not found, private IP, or other error
        return None

def process_logs_for_countries(logs: list) -> Dict[str, int]:
    """
    Process a list of logs and return country counts.
    
    Args:
        logs: List of log dictionaries with 'src_ip' or 'ip' field
    
    Returns:
        Dictionary mapping country codes to attack counts
        Example: {"IN": 41, "CN": 12, "RU": 7}
    """
    country_counts = defaultdict(int)
    
    for log in logs:
        # Try different possible field names for IP
        ip = log.get("src_ip") or log.get("ip") or log.get("source_ip")
        
        if not ip:
            continue
        
        country = ip_to_country(ip)
        if country:
            country_counts[country] += 1
    
    return dict(country_counts)

