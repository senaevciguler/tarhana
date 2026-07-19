import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to home
    print("Navigating to home page...")
    page.goto("http://localhost:4200/")
    page.wait_for_timeout(1000)

    # Scroll down to make sure images load
    print("Scrolling down on home page...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    page.wait_for_timeout(1000)

    # Go to products
    print("Navigating to products page...")
    page.goto("http://localhost:4200/products")
    page.wait_for_timeout(1000)

    # Scroll down to product list
    print("Scrolling on products page...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    page.wait_for_timeout(1000)

    # Take screenshot of products page showing lazy loaded images
    screenshot_path = "/app/verification/screenshots/verification.png"
    print(f"Taking screenshot to {screenshot_path}")
    page.screenshot(path=screenshot_path)
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
        print("Done!")
