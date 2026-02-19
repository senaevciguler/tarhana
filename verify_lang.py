import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # Wait for server
            await page.goto("http://localhost:4200", timeout=60000)
            await asyncio.sleep(2)

            # Check for Swedish default
            title = await page.inner_text("h1")
            print(f"Title: {title}")
            if "Traditionell Tarhana" in title:
                print("Swedish verified")
                await page.screenshot(path="/home/jules/verification/swedish_home_final.png")
            else:
                print("Swedish NOT verified")

            # Switch to English
            await page.click("button:has-text('EN')")
            await asyncio.sleep(1)

            title = await page.inner_text("h1")
            print(f"Title: {title}")
            if "Traditional Tarhana" in title:
                print("English verified")
                await page.screenshot(path="/home/jules/verification/english_home_final.png")
            else:
                print("English NOT verified")

            # Reload to check persistence
            await page.reload()
            await asyncio.sleep(1)
            title = await page.inner_text("h1")
            if "Traditional Tarhana" in title:
                print("Persistence verified")
            else:
                print("Persistence NOT verified")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
