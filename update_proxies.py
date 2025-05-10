#!/usr/bin/env python3
import asyncio
import json
from proxy_scraper import scrape_and_validate

async def main():
    valid = await scrape_and_validate()
    with open("public/proxies.json", "w", encoding="utf-8") as f:
        json.dump(valid, f, ensure_ascii=False)

if __name__ == "__main__":
    asyncio.run(main()) 