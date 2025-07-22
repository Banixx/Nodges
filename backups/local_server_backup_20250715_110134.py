#!/usr/bin/env python3
"""
Lokaler HTTP-Server mit CORS-Unterstützung für Webentwicklung
Verwendung: python local_server.py [port] [directory]
"""

import http.server
import socketserver
import os
import sys
import argparse
from urllib.parse import unquote

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP Request Handler mit CORS-Unterstützung"""
    
    def end_headers(self):
        """Fügt CORS-Header zu allen Antworten hinzu"""
        self.send_cors_headers()
        super().end_headers()
    
    def send_cors_headers(self):
        """Sendet CORS-Header"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Max-Age', '86400')
    
    def do_OPTIONS(self):
        """Behandelt OPTIONS-Requests für CORS-Preflight"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Erweiterte GET-Methode mit besserer Fehlerbehandlung"""
        try:
            return super().do_GET()
        except Exception as e:
            print(f"Fehler beim Verarbeiten der GET-Anfrage: {e}")
            self.send_error(500, f"Interner Serverfehler: {e}")
    
    def log_message(self, format, *args):
        """Angepasste Log-Ausgabe"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def start_server(port=8000, directory=None):
    """Startet den HTTP-Server"""
    
    # Verzeichnis setzen
    if directory:
        if os.path.exists(directory):
            os.chdir(directory)
            print(f"Arbeitsverzeichnis geändert zu: {os.path.abspath(directory)}")
        else:
            print(f"Fehler: Verzeichnis '{directory}' existiert nicht!")
            return False
    
    current_dir = os.getcwd()
    print(f"Server-Verzeichnis: {current_dir}")
    
    try:
        # Server erstellen
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            print(f"\n🚀 CORS-fähiger HTTP-Server gestartet!")
            print(f"📁 Verzeichnis: {current_dir}")
            print(f"🌐 URL: http://localhost:{port}")
            print(f"🔗 Netzwerk-URL: http://{get_local_ip()}:{port}")
            print(f"\n✅ CORS ist aktiviert - keine Cross-Origin-Probleme!")
            print(f"⏹️  Zum Beenden: Ctrl+C drücken\n")
            
            # Server starten
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n👋 Server wurde beendet.")
        return True
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Fehler: Port {port} ist bereits in Verwendung!")
            print(f"💡 Versuchen Sie einen anderen Port: python {sys.argv[0]} {port + 1}")
        else:
            print(f"❌ Fehler beim Starten des Servers: {e}")
        return False
    except Exception as e:
        print(f"❌ Unerwarteter Fehler: {e}")
        return False

def get_local_ip():
    """Ermittelt die lokale IP-Adresse"""
    import socket
    try:
        # Verbindung zu einem externen Server simulieren
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except:
        return "127.0.0.1"

def main():
    """Hauptfunktion"""
    parser = argparse.ArgumentParser(
        description="Lokaler HTTP-Server mit CORS-Unterstützung",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  python local_server.py                    # Port 8000, aktuelles Verzeichnis
  python local_server.py 3000              # Port 3000, aktuelles Verzeichnis
  python local_server.py 8080 ./dist       # Port 8080, ./dist Verzeichnis
  python local_server.py --port 5000 --dir ./build
        """
    )
    
    parser.add_argument(
        'port', 
        nargs='?', 
        type=int, 
        default=8000,
        help='Port-Nummer (Standard: 8000)'
    )
    
    parser.add_argument(
        'directory', 
        nargs='?', 
        default=None,
        help='Zu servierende Verzeichnis (Standard: aktuelles Verzeichnis)'
    )
    
    parser.add_argument(
        '--port', '-p',
        type=int,
        help='Port-Nummer (alternative Syntax)'
    )
    
    parser.add_argument(
        '--dir', '-d',
        help='Zu servierende Verzeichnis (alternative Syntax)'
    )
    
    args = parser.parse_args()
    
    # Port bestimmen
    port = args.port if args.port else args.port
    if port is None:
        port = 8000
    
    # Verzeichnis bestimmen
    directory = args.dir if args.dir else args.directory
    
    # Validierung
    if port < 1 or port > 65535:
        print("❌ Fehler: Port muss zwischen 1 und 65535 liegen!")
        return
    
    # Server starten
    start_server(port, directory)

if __name__ == "__main__":
    main()