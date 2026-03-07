import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

load_dotenv()

async def get_doc_content(source_path: str) -> str:
    """
    Fetches the actual markdown content from the frontend deployment using crawl4ai.
    source_path: e.g. '@site/docs/part-1-foundations/intro.md'
    """
    try:
        # 1. Try Remote Fetching with crawl4ai
        origins = os.getenv("CORS_ORIGINS", "").split(",")
        if origins:
            base_url = origins[0].strip()
            # base_url="https://furqan2004.github.io"
            # Docusaurus baseUrl is /physical-ai-book/
            # if "localhost" in base_url and "/physical-ai-book" not in base_url:
            #     base_url = f"{base_url.rstrip('/')}/physical-ai-book"
            
            # Map @site/docs/intro.md -> /docs/intro
            # crawl4ai usually handles rendered pages better
            rel_path = source_path.replace('@site/docs/', 'physical-ai-book/docs/').replace('.md', '')
            if not rel_path.startswith('/'):
                rel_path = '/' + rel_path
            
            url = f"{base_url.rstrip('/')}{rel_path}"
            print(f"DEBUG: crawl4ai fetching from: {url}")
            
            browser_conf = BrowserConfig(headless=True)
            run_conf = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)

            async with AsyncWebCrawler(config=browser_conf) as crawler:
                result = await crawler.arun(url=url, config=run_conf)
                if result.success and result.markdown:
                    print(f"SUCCESS: crawl4ai extracted Markdown from {url}")
                    print(result.markdown)
                    return result.markdown
                else:
                    print(f"WARNING: crawl4ai failed or returned empty markdown for {url}")

        # 2. Local Fallback (if remote fails)
        print("INFO: Falling back to local file system reading for Markdown source.")
        docs_base = Path(__file__).parent.parent.parent / 'frontend' / 'docs'
        clean_path = source_path.replace('@site/docs/', '').replace('@site/', '')
        file_path = docs_base / clean_path
        
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        
        return f"Error: Document source not found (Remote: {url if 'url' in locals() else 'N/A'}, Local: {file_path})"
                
    except Exception as e:
        print(f"Error fetching/reading doc: {e}")
        return f"Error reading document: {str(e)}"
