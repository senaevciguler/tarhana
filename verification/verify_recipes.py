import os
import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Ensure directories exist
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    # 1. Load Home Page
    print("Navigating to Home...")
    page.goto("http://localhost:4200/")
    page.wait_for_timeout(1000)

    # Screenshot Hero
    page.screenshot(path="/home/jules/verification/screenshots/home_hero.png")

    # Scroll down to "Want more ideas?" section
    print("Scrolling to 'Want more ideas?' CTA section...")
    page.locator(".bg-stone-50").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/home_cta_section.png")

    # Click on "Browse recipes" button in that section
    print("Clicking 'Browse recipes' CTA...")
    # There are two links to /recipes on the home page (Hero and CTA section)
    # Let's target the one inside the .bg-stone-50 section to be exact
    page.locator(".bg-stone-50 a[routerlink='/recipes']").click()
    page.wait_for_timeout(1500)  # Wait for transition and rendering

    # 2. Check the Recipes Page
    print("Verifying Recipes Page scroll position...")
    scroll_y = page.evaluate("window.pageYOffset")
    print(f"Scroll Y position is: {scroll_y}")

    # Assert that scroll position is at the top
    assert scroll_y == 0, f"Expected scroll position 0 (top), but got {scroll_y}"

    # Take screenshot of the top of Recipes page
    page.screenshot(path="/home/jules/verification/screenshots/recipes_top.png")

    # Verify that only 3 recipe cards exist
    print("Counting recipe cards...")
    cards = page.locator(".recipe-card, #hero-recipe-image")
    card_count = cards.count()
    print(f"Number of recipe cards found: {card_count}")

    assert card_count == 3, f"Expected 3 recipe cards, but found {card_count}"

    # Take screenshot of the cards grid
    cards.first.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/recipes_grid.png")

    # Let's open the first recipe to verify modal works
    print("Opening the first recipe modal...")
    page.locator(".recipe-card button").first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/recipes_modal.png")

    # Close the modal using close button
    print("Closing modal...")
    page.locator(".max-w-3xl button").get_by_text("close").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/recipes_after_close.png")

    print("CUJ verification completed successfully!")

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
