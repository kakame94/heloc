"""
Proxy HTTP leger pour envoyer des messages WhatsApp via le CLI openclaw.

Ce script tourne sur la machine hote (pas dans Docker) et expose un
endpoint POST /api/send que le backend Docker peut appeler via
host.docker.internal.

Usage:
    python3 webhook-proxy.py [--port 18790]
"""

import json
import subprocess
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler


OPENCLAW_BIN = "openclaw"
PORT = int(sys.argv[sys.argv.index("--port") + 1]) if "--port" in sys.argv else 18790
# Numero cible par defaut (le propre numero de l'utilisateur)
DEFAULT_TARGET = "+33667903246"


class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/send":
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error": "Not found"}')
            return

        # Lire le body
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode("utf-8")) if body else {}
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            err = {"error": f"Invalid JSON: {e}", "raw": repr(body[:200])}
            self.wfile.write(json.dumps(err).encode())
            return

        message = data.get("message", "")
        target = data.get("target", DEFAULT_TARGET)

        if not message:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error": "Missing message"}')
            return

        # Appeler openclaw message send
        try:
            result = subprocess.run(
                [
                    OPENCLAW_BIN, "message", "send",
                    "--channel", "whatsapp",
                    "--target", target,
                    "--message", message,
                    "--json",
                ],
                capture_output=True,
                text=True,
                timeout=30,
            )

            if result.returncode == 0:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(result.stdout.encode())
            else:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                error = {"error": result.stderr.strip() or "openclaw failed"}
                self.wfile.write(json.dumps(error).encode())

        except subprocess.TimeoutExpired:
            self.send_response(504)
            self.end_headers()
            self.wfile.write(b'{"error": "Timeout"}')
        except FileNotFoundError:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'{"error": "openclaw binary not found"}')

    def log_message(self, format, *args):
        print(f"[webhook-proxy] {args[0]}")


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    print(f"[webhook-proxy] Listening on http://0.0.0.0:{PORT}/api/send")
    print(f"[webhook-proxy] Default target: {DEFAULT_TARGET}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[webhook-proxy] Stopped.")
