OBZIDIAN STORE — QUICK START

FILES
- index.html: public customer-facing store
- manager.html: product manager
- styles.css: shared black/silver luxury styling
- app.js: product catalogue, localStorage and Instagram DM link logic

HOW TO USE
1. Upload all four files to the SAME website folder / domain.
2. Open manager.html in the same browser and on the same domain as index.html.
3. Add a product name, price, direct image URL and details.
4. Click Add product.
5. Open index.html. The product will appear in the collection.
6. Customers click a product card, then Contact on Instagram.

INSTAGRAM
The DM link is configured for @obzidian._renders in app.js.
If your Instagram username changes, edit IG_USERNAME near the top of app.js.

IMAGE URL
Use a direct, publicly accessible image URL ending in an image format or a URL that serves the image directly. A normal webpage URL (for example, a product page link) may not display as an image.

IMPORTANT STORAGE LIMITATION
This version uses browser localStorage as requested. It is shared only when the public store and manager are opened on the same exact domain/origin and in the same browser profile. It does NOT sync between different devices or browsers, and clearing site data can erase products. Use Export backup regularly.
For example, if your store is https://yourdomain.com/ and manager is https://yourdomain.com/manager.html, they share the catalogue. If manager is hosted on a different Vercel project/domain, it will NOT share localStorage with the store.

ADMIN SECURITY
This is a front-end manager, not a secure authenticated admin system. Do not treat the manager URL as private or store sensitive information in it. For secure multi-device management, use a backend/database and real admin authentication.

INSTAGRAM MESSAGE
The link opens the Instagram DM for @obzidian._renders and includes a product-specific text parameter. Instagram may not prefill the message on every device/version; if it does not, the customer can still send the product name manually in the chat.
