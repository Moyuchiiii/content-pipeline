#!/usr/bin/env python
"""
ローカル画像配信用の CORS 対応 HTTP サーバー。
Brain エディタの drop イベントで画像を挿入するため、ブラウザから
http://localhost:8765/{記事ID}/N.jpg で画像を取得できるようにする。

Usage:
    python scripts/serve-images.py [port]

Default port: 8765
配信ルート: today/brain/images/
"""

import sys
import os
import socketserver
import http.server
import threading

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'today', 'brain', 'images')


class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        sys.stderr.write(f"[serve-images] {format % args}\n")


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    print(f"Serving {ROOT} on http://127.0.0.1:{PORT}")
    print("Press Ctrl+C to stop.")
    with ThreadingHTTPServer(('127.0.0.1', PORT), CORSHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down.")
