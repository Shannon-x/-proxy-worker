#!/usr/bin/env python3
import asyncio
import json
import os
from proxy_scraper import scrape_and_validate

async def main():
    valid = await scrape_and_validate()
    output_path = os.path.join(os.path.dirname(__file__), 'worker', 'public', 'proxies.json')
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(valid, f, ensure_ascii=False)

if __name__ == "__main__":
    asyncio.run(main())