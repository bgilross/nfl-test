"""Vercel serverless entrypoint exposing FastAPI app.

Vercel detects this file under /api. The exported variable `app` must be the ASGI application.
Scraping should NOT be done inside a request here (time limits). Use the GitHub Action or a separate trigger.
"""
from backend.api import app  # re-export FastAPI instance as `app`
