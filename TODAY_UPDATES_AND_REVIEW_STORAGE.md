# PalmBerry: Today's Updates and Review Storage Options

## What Was Updated Today

- Removed all login UI from the navbar.
- Changed the product section to show featured split-style product cards.
- Reworked the reviews section so a customer can add a review without login.
- Added owner-only edit and delete actions for reviews using a three-dot menu.
- Added an Order Success page message with a review CTA.
- Added a `Last Order` button in the navbar so the customer can reopen the order success page.
- Saved the last order in browser storage so the success page can show the previous order again on the same browser.
- Hidden the "Add Review" button on Order Success if no purchase exists (only shows if lastOrder is present).

## Current Review Flow

- After purchase, the customer sees the Order Success page with an "Add Review" button.
- The "Add Review" button only appears if a valid order exists (lastOrder in localStorage).
- Clicking the button opens the review form on the homepage.
- The review is tagged with a local owner token in the browser.
- The same customer can edit or delete only their own review using the three-dot menu.
- The review is shown in the homepage testimonial section (What Our Customers Say).
- If browser data is cleared, the review can be lost because the current setup is frontend-only.
- If the Order Success page is accessed without a purchase, it shows "You ordered nothing" and no Add Review button.

## How Reviews Can Be Stored Permanently

### Option 1: JSON File on Server

- Reviews are saved in a JSON file on the server.
- This is better than localStorage because it survives browser clearing.
- It is simple to build for small projects.
- Limitations:
  - Less safe for heavy traffic.
  - Can become messy if many users write at the same time.
  - Harder to scale.

### Option 2: Store Reviews in Database

- Reviews are saved in MongoDB or another database.
- This is the best production approach.
- Benefits:
  - Permanent storage.
  - Works across browsers and devices.
  - Easier to manage ownership and moderation.
  - Better for production and scaling.

### Recommended Production Approach

- Store reviews in the database.
- Save `userId`, `orderId`, `productId`, `rating`, `reviewText`, and timestamps.
- Allow edit/delete only if the review belongs to the same verified customer.
- If login is not used, you still need a secure server-side order verification method.

## What To Send To Backend Engineers

Yes, you can send these updated files to backend engineers.

Recommended files to share:

- `client/src/components/Reviews.js`
- `client/src/pages/OrderSuccess.js`
- `client/src/pages/Checkout.js`
- `client/src/components/Navbar.js`
- `client/src/styles/Reviews.css`
- `client/src/styles/OrderSuccess.css`
- `client/src/styles/Navbar.css`

What to tell backend engineers:

- Frontend changes are done.
- Reviews are currently saved in browser storage only.
- For production, reviews should be stored on the server.
- The best approach is to save reviews in the database and verify ownership using order or user data.
- If they want the review system to be secure, backend support is required.

## Final Note

- The current frontend is fine for UI testing and demo use.
- For permanent production review storage, database storage is the recommended approach.