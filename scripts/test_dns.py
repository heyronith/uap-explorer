import socket
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
print(f"URL: {url}")
if url:
    hostname = url.replace("https://", "").replace("http://", "").split("/")[0]
    print(f"Hostname: {hostname}")
    try:
        ip = socket.gethostbyname(hostname)
        print(f"IP: {ip}")
    except Exception as e:
        print(f"Error resolving hostname: {e}")
