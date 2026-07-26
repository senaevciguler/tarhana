import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to homepage
    print("Navigating to home page...")
    page.goto("http://localhost:4200")
    page.wait_for_timeout(1000)

    # Scroll to the footer
    print("Scrolling to footer...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # Take screenshot of the new footer
    footer_screenshot_path = "/home/jules/verification/screenshots/footer_visual.png"
    print(f"Taking footer screenshot at {footer_screenshot_path}...")
    page.screenshot(path=footer_screenshot_path)
    page.wait_for_timeout(500)

    # Click on the Contact page link in the footer
    print("Navigating to Contact page...")
    # Find the link that has text 'Contact Us' or contains 'Contact' (or 'Kontakta' in Swedish)
    contact_link = page.get_by_role("link", name="Contact Us")
    if not contact_link.is_visible():
        contact_link = page.get_by_role("link", name="Kontakta Oss")

    contact_link.first.click()
    page.wait_for_timeout(1000)

    # Fill in the contact form
    print("Filling out contact form...")
    page.locator("#name").fill("Ella Jane")
    page.wait_for_timeout(500)
    page.locator("#email").fill("info@ellaspantry.se")
    page.wait_for_timeout(500)
    page.locator("#message").fill("Hello, I would love to ask about your delicious fermented soup mixes!")
    page.wait_for_timeout(500)

    # Take contact form screenshot before submitting
    contact_screenshot_path = "/home/jules/verification/screenshots/contact_form.png"
    print(f"Taking contact form screenshot at {contact_screenshot_path}...")
    page.screenshot(path=contact_screenshot_path)

    # Submit the form
    print("Submitting contact form...")
    # Scoped inside the first form on the contact page
    page.locator('form').first.locator('button[type="submit"]').click()
    page.wait_for_timeout(1500)  # Wait for submission timeout

    # Take screenshot of the success state
    success_screenshot_path = "/home/jules/verification/screenshots/verification.png"
    print(f"Taking success state screenshot at {success_screenshot_path}...")
    page.screenshot(path=success_screenshot_path)
    page.wait_for_timeout(1000)
    print("CUJ completed successfully!")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

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
