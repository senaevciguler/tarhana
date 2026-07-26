import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Ensure directories exist
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    # Go to Contact page
    print("Navigating to Contact page...")
    page.goto("http://localhost:4200/contact")
    page.wait_for_timeout(1000)

    # Fill name
    print("Filling contact form...")
    page.fill("input#name", "Test User")
    page.wait_for_timeout(500)

    # Fill email
    page.fill("input#email", "test_unconfigured@example.com")
    page.wait_for_timeout(500)

    # Fill message
    page.fill("textarea#message", "This is a test message to verify the unconfigured error message on contact form.")
    page.wait_for_timeout(500)

    # Click Submit in Contact Form
    print("Submitting contact form...")
    page.click(".lg\\:col-span-7 form button[type='submit']")
    page.wait_for_timeout(1500)

    # Scroll to see the contact form error alert
    print("Scrolling to see contact form error alert...")
    page.locator(".lg\\:col-span-7 form").scroll_into_view_if_needed()
    page.wait_for_timeout(500)

    # Take screenshot of the unconfigured error message
    screenshot_path_contact = "/home/jules/verification/screenshots/contact_unconfigured.png"
    page.screenshot(path=screenshot_path_contact)
    print(f"Took contact screenshot: {screenshot_path_contact}")

    # Scroll down to Footer
    print("Scrolling to footer newsletter...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # Fill newsletter email
    print("Filling newsletter...")
    page.fill("input[name='newsletterEmail']", "test_newsletter@example.com")
    page.wait_for_timeout(500)

    # Click subscribe in Footer Form
    page.click("footer form button[type='submit']")
    page.wait_for_timeout(1500)

    # Take screenshot of newsletter error message
    screenshot_path_newsletter = "/home/jules/verification/screenshots/newsletter_unconfigured.png"
    page.screenshot(path=screenshot_path_newsletter)
    print(f"Took newsletter screenshot: {screenshot_path_newsletter}")

    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a large desktop viewport to capture elements clearly
        context = browser.new_context(
            viewport={"width": 1280, "height": 1024},
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
            print("Finished CUJ recording.")
