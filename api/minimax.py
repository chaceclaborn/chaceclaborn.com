"""
Vercel Serverless Function for Minimax Algorithm
Wraps the AI-Learning-Dashboard minimax module
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the submodule to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ai-learning'))

from modules.minimax.game_logic import create_game_tree, run_minimax


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for minimax API"""
        try:
            path = self.path.split('?')[0]

            # GET /api/minimax - API info
            if path == '/api/minimax' or path == '/api/minimax/':
                self._send_json(200, {
                    'name': 'Minimax Algorithm API',
                    'endpoints': [
                        'GET /api/minimax/tree/{depth} - Generate game tree',
                        'GET /api/minimax/solve/{algorithm} - Solve with minimax or alphabeta'
                    ],
                    'algorithms': ['minimax', 'alphabeta']
                })
                return

            # GET /api/minimax/tree/{depth} - Generate a game tree
            if '/tree/' in path:
                depth_str = path.split('/tree/')[-1]
                try:
                    depth = int(depth_str)
                    depth = min(max(depth, 2), 4)  # Clamp between 2 and 4
                    tree = create_game_tree(depth)
                    self._send_json(200, {'tree': tree, 'depth': depth})
                except ValueError:
                    self._send_json(400, {'error': 'Depth must be an integer'})
                return

            # GET /api/minimax/solve/{algorithm} - Run minimax or alphabeta
            if '/solve/' in path:
                algorithm = path.split('/solve/')[-1]
                if algorithm in ['minimax', 'alphabeta']:
                    result = run_minimax(algorithm)
                    self._send_json(200, result)
                else:
                    self._send_json(400, {'error': 'Algorithm must be "minimax" or "alphabeta"'})
                return

            self._send_json(404, {'error': 'Endpoint not found'})

        except Exception as e:
            self._send_json(500, {'error': str(e)})

    def _send_json(self, status_code, data):
        """Helper to send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
