# Shopify Admin Instructions: Product Renaming

To align with the premium redesign of the products page on the storefront, please rename the two product items in your **Shopify Admin** to the following titles:

1. **Original Fermented Soup Mix** -> **Salted Tarhana**
2. **Unsalted Fermented Soup Mix** -> **Unsalted Tarhana**

### Why this is necessary
The Products page UI has been improved to present these two products with a clean, spacious Scandinavian layout. Inside Angular, the product titles are fetched dynamically from the Shopify Storefront API (relying on `product.title`).

To avoid hardcoding product data or breaking translations, the product titles must be updated in your Shopify Admin dashboard rather than modified locally inside Angular. This ensures absolute Shopify compatibility.
