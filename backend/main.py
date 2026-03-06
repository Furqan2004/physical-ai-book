from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, chat, personalize, translate
from routers.auth import user_router
import ai  # Import to trigger OpenRouter setup
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Book RAG API",
    description="API for AI Book RAG Chatbot with Auth and Personalization",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
# Trim whitespace from origins (in case of spaces after commas)
origins = [origin.strip() for origin in origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(user_router)
app.include_router(chat.router)
app.include_router(personalize.router)
app.include_router(translate.router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "model": "nvidia/nemotron-3-nano-30b-a3b:free"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Book RAG API",
        "docs": "/docs"
    }
