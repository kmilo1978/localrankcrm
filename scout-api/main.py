"""
Scout API — FastAPI wrapper for Scout lead scraper.
Connects Scout CLI capabilities to LocalRank CRM via REST API.

Usage:
    uvicorn main:app --reload --port 8000

Deploy:
    Railway/Render/Fly.io — just push this folder to GitHub.
"""

import os
import sys
import importlib
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add Scout's app directory to path
sys.path.insert(0, os.path.dirname(__file__))

app = FastAPI(
    title="Scout API",
    description="Lead scraping API for LocalRank CRM",
    version="1.0.0",
)

# CORS — allow CRM to call this API
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://localrank.com.co,http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---

class ScrapeRequest(BaseModel):
    platform: str
    usernames: list[str]
    linkedin_cookie: Optional[str] = None
    proxy: Optional[str] = None


class ScrapedProfile(BaseModel):
    username: str
    name: str
    bio: str
    followers: int
    email: str
    phone: str
    website: str
    company: str
    score: int
    verified: bool
    links: list[str]


class ScrapeResponse(BaseModel):
    results: list[ScrapedProfile]
    platform: str
    count: int


SUPPORTED_PLATFORMS = [
    "instagram", "tiktok", "linkedin", "github",
    "youtube", "twitch", "pinterest", "linktree"
]


# --- Scraper loader ---

def get_scraper(platform: str):
    """
    Dynamically import the scraper module from Scout's app/scrapers/.
    Each module has a scrape(username) function.
    """
    try:
        module = importlib.import_module(f"app.scrapers.{platform}")
        return module
    except ImportError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Scraper '{platform}' not found. Error: {str(e)}"
        )


def normalize_result(raw: dict, username: str) -> ScrapedProfile:
    """Normalize scraper output to consistent format."""
    return ScrapedProfile(
        username=raw.get("username", username),
        name=raw.get("name", raw.get("display_name", "")),
        bio=raw.get("bio", raw.get("description", "")),
        followers=int(raw.get("followers", raw.get("follower_count", 0)) or 0),
        email=raw.get("email", ""),
        phone=raw.get("phone", ""),
        website=raw.get("website", raw.get("url", "")),
        company=raw.get("company", ""),
        score=int(raw.get("score", 50) or 50),
        verified=bool(raw.get("verified", raw.get("email_verified", False))),
        links=raw.get("links", raw.get("external_links", [])) or [],
    )


# --- Routes ---

@app.get("/")
def root():
    return {
        "name": "Scout API",
        "version": "1.0.0",
        "platforms": SUPPORTED_PLATFORMS,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/platforms")
def platforms():
    return {
        "platforms": [
            {"id": "instagram", "name": "Instagram", "auth": "none"},
            {"id": "tiktok", "name": "TikTok", "auth": "none"},
            {"id": "linkedin", "name": "LinkedIn", "auth": "cookie"},
            {"id": "github", "name": "GitHub", "auth": "none"},
            {"id": "youtube", "name": "YouTube", "auth": "none"},
            {"id": "twitch", "name": "Twitch", "auth": "none"},
            {"id": "pinterest", "name": "Pinterest", "auth": "none"},
            {"id": "linktree", "name": "Linktree", "auth": "none"},
        ]
    }


@app.post("/scrape", response_model=ScrapeResponse)
def scrape(req: ScrapeRequest):
    """Scrape profiles from a platform."""
    if req.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(400, f"Platform '{req.platform}' not supported")

    if len(req.usernames) > 50:
        raise HTTPException(400, "Max 50 usernames per request")

    if not req.usernames:
        raise HTTPException(400, "At least one username required")

    # Set environment for this request
    if req.linkedin_cookie:
        os.environ["LINKEDIN_COOKIE"] = req.linkedin_cookie
    if req.proxy:
        os.environ["SCOUT_PROXY"] = req.proxy

    scraper = get_scraper(req.platform)
    results: list[ScrapedProfile] = []

    for username in req.usernames:
        try:
            raw = scraper.scrape(username)
            if isinstance(raw, dict):
                results.append(normalize_result(raw, username))
            elif isinstance(raw, list):
                for item in raw:
                    results.append(normalize_result(item, username))
        except Exception as e:
            # Skip failed scrapes, continue with others
            results.append(ScrapedProfile(
                username=username, name="", bio="",
                followers=0, email="", phone="",
                website="", company="", score=0,
                verified=False, links=[],
            ))

    return ScrapeResponse(
        results=results,
        platform=req.platform,
        count=len(results),
    )
