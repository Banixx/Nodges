#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8000

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"[SUCCESS] Server gestartet auf http://localhost:{PORT}")
        print(f"[INFO] Serving directory: {os.getcwd()}")
        print("[INFO] Druecke Ctrl+C zum Beenden")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[INFO] Server beendet")
            sys.exit(0)