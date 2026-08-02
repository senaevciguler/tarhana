import os
import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    # Set mobile viewport
    page.set_viewport_size({"width": 375, "height": 667})

    print("Navigating to Home on Mobile...")
    page.goto("http://localhost:4200/")
    page.wait_for_timeout(1000)

    # 1. Take a screenshot of Home Header on Mobile
    print("Capturing closed mobile menu header...")
    page.screenshot(path="/home/jules/verification/screenshots/mobile_header_closed.png")

    # 2. Click Hamburger Menu to Open Mobile Menu
    print("Clicking Hamburger menu button...")
    page.locator("button[aria-controls='mobile-menu']").click()
    page.wait_for_timeout(1000)

    # Capture the open mobile menu screenshot
    print("Capturing open mobile menu...")
    page.screenshot(path="/home/jules/verification/screenshots/mobile_menu_open.png")

    # 3. Click "Recipes" link inside Mobile Menu
    print("Clicking 'Recipes' inside mobile menu...")
    page.locator("#mobile-menu a[routerlink='/recipes']").click()
    page.wait_for_timeout(1500)

    # Verify navigation and that menu is closed
    print(f"Current mobile URL: {page.url}")
    assert "/recipes" in page.url, f"Expected to be on /recipes, but got {page.url}"

    # Verify body overflow is reset to auto
    overflow = page.evaluate("document.body.style.overflow")
    print(f"Body overflow style: '{overflow}'")
    assert overflow == "", f"Expected overflow to be reset, but got '{overflow}'"

    # Capture mobile Recipes page
    print("Capturing mobile Recipes page...")
    page.screenshot(path="/home/jules/verification/screenshots/mobile_recipes_page.png")

    print("Mobile navigation CUJ completed successfully!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
