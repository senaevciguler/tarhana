import time
from playwright.sync_api import sync_playwright

def run_verification(page):
    # 1. Load Home Page
    print("Navigating to Home...")
    page.goto("http://localhost:4200/")
    page.wait_for_timeout(1000)

    # Scroll to footer
    print("Scrolling to footer...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/footer_redesign.png")

    # Subscribe to Newsletter in footer
    print("Subscribing to newsletter...")
    page.locator("input[name='newsletterEmail']").fill("hello@example.com")
    page.wait_for_timeout(500)
    page.locator("form button[type='submit']").first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/footer_newsletter_success.png")

    # 2. Contact Page
    print("Navigating to Contact Page...")
    page.goto("http://localhost:4200/contact")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/contact_page_form.png")

    # Fill Contact Form
    print("Filling contact form...")
    page.locator("#name").fill("Carl von Linné")
    page.wait_for_timeout(500)
    page.locator("#email").fill("carl@linne.se")
    page.wait_for_timeout(500)
    page.locator("#message").fill("Hej! I absolutely love your fermented soup mix, it's ready in minutes and incredibly delicious. Do you offer bulk orders for Swedish nature excursions?")
    page.wait_for_timeout(1000)

    # Submit Contact Form
    print("Submitting contact form...")
    page.locator("form button[type='submit']").first.click()
    page.wait_for_timeout(1500)  # Wait for submission mock timeout
    page.screenshot(path="/home/jules/verification/screenshots/contact_page_success.png")

    # 3. Privacy Policy
    print("Navigating to Privacy Policy...")
    page.goto("http://localhost:4200/privacy")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/privacy_policy.png")

    # 4. Terms and Conditions
    print("Navigating to Terms...")
    page.goto("http://localhost:4200/terms")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/terms_and_conditions.png")

    print("Verification completed successfully!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
