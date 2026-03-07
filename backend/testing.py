link = "https://furqan2004.github.io/physical-ai-book/docs/intro"

import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

async def main():
    browser_conf = BrowserConfig(headless=True)  # or False to see the browser
    run_conf = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS
    )

    async with AsyncWebCrawler(config=browser_conf) as crawler:
        result = await crawler.arun(
            url=link,
            config=run_conf
        )
        print(result.markdown)

if __name__ == "__main__":
    asyncio.run(main())
