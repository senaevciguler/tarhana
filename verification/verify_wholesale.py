import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("Navigating to Contact page...")
    page.goto("http://localhost:4200/contact")
    page.wait_for_timeout(1000)

    # Make sure we are in English first
    print("Ensuring language is English...")
    page.get_by_role("button", name="EN", exact=True).click()
    page.wait_for_timeout(1000)

    # Scroll down slightly to center the Left column containing Wholesale & Retail Partnerships
    print("Scrolling to Wholesale section...")
    page.evaluate("window.scrollTo(0, 150)")
    page.wait_for_timeout(500)

    # Take screenshot of English version
    en_screenshot_path = "/app/verification/screenshots/wholesale_en.png"
    print(f"Taking English Wholesale screenshot at {en_screenshot_path}...")
    page.screenshot(path=en_screenshot_path)
    page.wait_for_timeout(1000)

    # Click the SV button to switch to Swedish
    print("Switching language to Swedish (SV)...")
    page.get_by_role("button", name="SV", exact=True).click()
    page.wait_for_timeout(1000)

    # Take screenshot of Swedish version
    sv_screenshot_path = "/app/verification/screenshots/wholesale_sv.png"
    print(f"Taking Swedish Wholesale screenshot at {sv_screenshot_path}...")
    page.screenshot(path=sv_screenshot_path)
    page.wait_for_timeout(1000)

    # Switch back to English to complete the video nicely
    print("Switching back to English...")
    page.get_by_role("button", name="EN", exact=True).click()
    page.wait_for_timeout(1000)

    print("CUJ completed successfully!")

if __name__ == "__main__":
    os.makedirs("/app/verification/videos", exist_ok=True)
    os.makedirs("/app/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
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
