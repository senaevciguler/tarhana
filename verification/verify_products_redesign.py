import os
import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Ensure directories exist
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    # 1. Load Recipes Page
    print("Navigating to Recipes Page...")
    page.goto("http://localhost:4200/recipes")
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/recipes_page.png")

    # 2. Scroll to the Bottom CTA on Recipes Page
    print("Scrolling to Recipes bottom CTA...")
    # Target the link or the bottom section
    cta_link = page.locator("a[routerlink='/products']").last
    cta_link.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/recipes_cta.png")

    # 3. Click the CTA Button to navigate to Products
    print("Clicking 'Discover the product' CTA...")
    cta_link.click()
    page.wait_for_timeout(2000)  # Wait for transition and rendering

    # 4. Check the Products Page scroll position and content
    print("Verifying Products Page scroll position...")
    scroll_y = page.evaluate("window.pageYOffset")
    print(f"Scroll Y position is: {scroll_y}")

    # Assert that scroll position is at the top
    assert scroll_y == 0, f"Expected scroll position 0 (top), but got {scroll_y}"

    # Take screenshot of the top of Products page
    page.screenshot(path="/home/jules/verification/screenshots/products_top_redesign.png")

    # Verify that product cards exist on the page
    print("Counting product cards on Products page...")
    # Select element with starts-with id or class matching product-card-
    cards = page.locator("[id^='product-card-']")
    card_count = cards.count()
    print(f"Number of product cards found: {card_count}")

    assert card_count in [1, 2], f"Expected 1 or 2 product cards, but found {card_count}"

    # Verify elements inside the cards
    for i in range(card_count):
        card = cards.nth(i)
        title = card.locator("h2").text_content().strip()
        desc = card.locator("p").first.text_content().strip()
        price = card.locator(".text-primary").text_content().strip()
        button_text = card.locator("button").text_content().strip()

        print(f"\nProduct Card {i + 1}:")
        print(f" - Title: {title}")
        print(f" - Description: {desc}")
        print(f" - Price: {price}")
        print(f" - Button text: {button_text}")

        # Check that image exists
        image = card.locator("img")
        assert image.is_visible(), f"Image not visible in card {i+1}"
        print(f" - Image Src: {image.get_attribute('src')}")

    # Check that "Which one should I choose?" section is removed
    print("Verifying 'Which one should I choose?' section is completely removed...")
    comparison_exists = page.locator("text='Which one should I choose?'").count() > 0 or page.locator("text='PRODUCTS_CHOOSE_TITLE'").count() > 0
    assert not comparison_exists, "Found 'Which one should I choose?' comparison section on the page!"
    print("Success: Comparison section is indeed removed.")

    # Scroll down to see the premium card layouts and details
    print("Scrolling to see product details and footer...")
    page.evaluate("window.scrollTo(0, 800)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/products_cards_scroll.png")

    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/products_footer_scroll.png")

    print("\nCUJ verification completed successfully!")

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
