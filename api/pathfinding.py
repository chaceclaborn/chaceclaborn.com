"""
Vercel Serverless Function for Pathfinding Algorithms
Wraps the AI-Learning-Dashboard pathfinding module
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the submodule to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ai-learning'))

from modules.pathfinding.algorithms import run_pathfinding
from modules.pathfinding.scenarios import get_scenarios, get_scenario_by_id


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for pathfinding API"""
        try:
            path = self.path.split('?')[0]

            # GET /api/pathfinding - List scenarios
            if path == '/api/pathfinding' or path == '/api/pathfinding/':
                scenarios = get_scenarios()
                self._send_json(200, {'scenarios': scenarios})
                return

            # GET /api/pathfinding/scenario/{id} - Get scenario details
            if '/scenario/' in path:
                scenario_id = path.split('/scenario/')[-1]
                scenario = get_scenario_by_id(scenario_id)
                if scenario:
                    self._send_json(200, scenario)
                else:
                    self._send_json(404, {'error': 'Scenario not found'})
                return

            # GET /api/pathfinding/run/{scenario_id}/{algorithm}
            if '/run/' in path:
                parts = path.split('/run/')[-1].split('/')
                if len(parts) >= 2:
                    scenario_id = parts[0]
                    algorithm = parts[1]
                    result = run_pathfinding(scenario_id, algorithm)
                    self._send_json(200, result)
                else:
                    self._send_json(400, {'error': 'Invalid path. Use /run/{scenario_id}/{algorithm}'})
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
