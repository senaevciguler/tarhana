from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Navigate to the Ingredients & Nutrition page
    page.goto("http://localhost:4200/health")
    page.wait_for_timeout(2000)

    # Let's check what the page content has
    body_text = page.inner_text("body")
    print("Page body text sample:")
    print(body_text[:1000])

    # Scroll down to What's Inside section
    page.evaluate("window.scrollTo(0, 400)")
    page.wait_for_timeout(1000)

    # Scroll down to How It's Made timeline section
    page.evaluate("window.scrollTo(0, 1000)")
    page.wait_for_timeout(1000)

    # Scroll down to Why Fermentation Matters section
    page.evaluate("window.scrollTo(0, 1800)")
    page.wait_for_timeout(1000)

    # Scroll down to Why Ella's Pantry section
    page.evaluate("window.scrollTo(0, 2400)")
    page.wait_for_timeout(1000)

    # Scroll down to FAQ section
    page.evaluate("window.scrollTo(0, 3100)")
    page.wait_for_timeout(1000)

    # Interact with the FAQ accordion (resilient to language)
    q1_en = "What is tarhana?"
    q1_sv = "Vad är tarhana?"

    if q1_sv in body_text:
        page.get_by_text(q1_sv).click()
        page.wait_for_timeout(1000)
        page.get_by_text("Varför är den fermenterad?").click()
    else:
        page.get_by_text(q1_en).click()
        page.wait_for_timeout(1000)
        page.get_by_text("Why is it fermented?").click()

    page.wait_for_timeout(1000)

    # Scroll down to Final CTA
    page.evaluate("window.scrollTo(0, 4200)")
    page.wait_for_timeout(1000)

    # Take screenshot at the final state
    screenshot_path = "/app/verification/screenshots/health_redesign.png"
    page.screenshot(path=screenshot_path)
    page.wait_for_timeout(1000)  # Hold final state for the video
    print(f"Screenshot successfully saved to {screenshot_path}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
