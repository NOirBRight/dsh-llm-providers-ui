"""THROWAWAY: serve only the public, credential-free prototype assets."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
ASSETS = {'/provider-settings-system.html', '/provider-settings-system.js',
          '/provider-settings-data.js', '/provider-settings-marks.js',
          '/provider-usage-study.js', '/provider-usage-study.css'}

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = urlsplit(self.path).path
        if path == '/':
            self.send_response(302)
            self.send_header('Location', '/provider-settings-system.html?surface=task&variant=B&inspect=codex')
            self.end_headers()
            return None
        if path not in ASSETS:
            self.send_error(404)
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    print('Task Panel study: http://0.0.0.0:4187', flush=True)
    ThreadingHTTPServer(('0.0.0.0', 4187), Preview).serve_forever()
