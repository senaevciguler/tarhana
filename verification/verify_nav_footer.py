import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to homepage
    print("Navigating to homepage...")
    page.goto("http://localhost:4200")
    page.wait_for_timeout(1000)

    # Change language to EN to inspect English translations
    print("Clicking EN button...")
    page.get_by_role("button", name="EN", exact=True).click()
    page.wait_for_timeout(1000)

    # Take a screenshot of the top header showing the Contact link in Navbar
    print("Taking screenshot of top header / navbar...")
    page.screenshot(path="/home/jules/verification/screenshots/navbar_english.png")

    # Click the "Contact" link in the main navigation
    print("Clicking Contact link in the navbar...")
    page.locator("nav").get_by_role("link", name="Contact", exact=True).click()
    page.wait_for_timeout(1000)

    # Ensure we are on the contact page
    print(f"Current URL: {page.url}")
    assert "/contact" in page.url, f"Expected to be on /contact, but got {page.url}"

    # Take screenshot of the contact page
    page.screenshot(path="/home/jules/verification/screenshots/contact_page.png")

    # Scroll down to the footer
    print("Scrolling to the bottom of the page to inspect the footer...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # Take screenshot of the footer
    print("Taking screenshot of the footer...")
    page.screenshot(path="/home/jules/verification/screenshots/footer_english.png")

    print("Success! Verification script ran to completion.")

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
