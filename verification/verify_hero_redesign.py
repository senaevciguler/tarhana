import os
from playwright.sync_api import sync_playwright

def run_verification(page):
    # Create target directories if they don't exist
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    print("Navigating to Home Page...")
    page.goto("http://localhost:4200/")
    page.wait_for_timeout(1500)  # Wait for HMR/rendering

    print("Taking screenshot of the redesigned Home Hero section...")
    page.screenshot(path="/home/jules/verification/screenshots/hero_redesign.png")
    page.wait_for_timeout(1000)

    print("Verifying responsive layout...")
    # Resize to mobile and take a mobile screenshot
    page.set_viewport_size({"width": 375, "height": 812})
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/hero_redesign_mobile.png")
    page.wait_for_timeout(1000)

    print("Visual verification script completed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1440, "height": 900}
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
