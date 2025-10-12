#!/usr/bin/env python3
"""
Simple HTTP server to serve the disaster analysis UI.
This serves the HTML file and handles CORS for local development.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS headers for local development"""
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def serve_ui(port=3000):
    """Start the HTTP server for the UI"""
    
    # Check if the HTML file exists
    html_file = "disaster_ui.html"
    if not os.path.exists(html_file):
        print(f"Error: {html_file} not found in current directory")
        print("Make sure you're running this script from the AI directory")
        sys.exit(1)
    
    # Start the server
    handler = CORSHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"🌐 Starting UI server on http://localhost:{port}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🎯 Main UI: http://localhost:{port}/{html_file}")
            print("\n📋 Instructions:")
            print("1. Make sure your FastAPI backend is running on http://localhost:8000")
            print("2. Open the UI in your browser")
            print("3. Upload an image and select analysis type")
            print("4. Click 'Analyze Image' to get predictions")
            print("\n🛑 Press Ctrl+C to stop the server")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f"http://localhost:{port}/{html_file}")
                print(f"\n🚀 Opening browser automatically...")
            except Exception as e:
                print(f"\n⚠️  Could not open browser automatically: {e}")
                print(f"Please manually open: http://localhost:{port}/{html_file}")
            
            # Serve forever
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Port already in use
            print(f"❌ Port {port} is already in use. Trying port {port + 1}...")
            serve_ui(port + 1)
        else:
            print(f"❌ Error starting server: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print(f"\n👋 Shutting down UI server...")
        sys.exit(0)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Serve the Disaster Analysis UI")
    parser.add_argument('--port', type=int, default=3000, 
                       help='Port to serve the UI on (default: 3000)')
    
    args = parser.parse_args()
    
    print("🌪️ Disaster Analysis UI Server")
    print("=" * 40)
    
    serve_ui(args.port)