"""
Pytest configuration for HarvestAlert backend tests.

This file configures the test environment and fixes import paths.
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))
