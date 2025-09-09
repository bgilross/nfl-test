from fastapi import FastAPI
from app import api

app = FastAPI(title="Team Rankings API", version="0.1.0")

app.include_router(api.router)

@app.get('/')
def root():
    return {"message": "Backend up"}
