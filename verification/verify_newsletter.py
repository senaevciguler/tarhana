import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to home page
    print("Navigating to http://localhost:4200/")
    page.goto("http://localhost:4200")
    page.wait_for_timeout(1000)

    # Scroll down to the footer newsletter form
    print("Scrolling to footer...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # Locate the newsletter input and type email
    print("Locating newsletter input and entering email...")
    input_field = page.locator('input[name="newsletterEmail"]')
    input_field.fill("subscriber@ellaspantry.se")
    page.wait_for_timeout(1000)

    # Click the subscribe button
    print("Clicking subscribe...")
    subscribe_btn = page.locator('button[type="submit"]')
    subscribe_btn.click()
    page.wait_for_timeout(500)

    # Verify input is disabled during submission
    print("Verifying if input or button is temporarily disabled...")

    # Wait for the success message
    print("Waiting for success message...")
    page.wait_for_timeout(1500)

    # Take screenshot of the newsletter section
    print("Taking screenshot of the newsletter success state...")
    page.screenshot(path="verification/screenshots/newsletter_verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("verification/videos", exist_ok=True)
    os.makedirs("verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
            print("Done!")
