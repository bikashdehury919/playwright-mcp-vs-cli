# S2 – Exploratory session: saucedemo.com as `problem_user`

- **Date:** 2026-09-24
- **Target:** https://www.saucedemo.com
- **User:** `problem_user` / `secret_sauce`
- **Tooling:** Playwright MCP browser tools only (manual, interactive exploration; no automated tests written)
- **Scope:** inventory, product detail, sorting, cart, checkout
- **Screenshots:** `reports/evidence/`

## Findings

| # | area | steps | expected | actual | evidence | severity |
|---|------|-------|----------|--------|----------|----------|
| 1 | Checkout | Cart → Checkout → type "Jane" in First Name, "Doe" in Last Name, "12345" in Zip → Continue | Fields keep what was typed; continue to overview | Each keystroke in Last Name replaces First Name with that one character, and Last Name stays empty. Continue shows "Error: Last Name is required". Clicking into Last Name and typing "Smith" gave the same result. **The purchase can't be completed.** | Field values after typing: `first-name="e"`, `last-name=""`, `postal-code="12345"`. After retyping "Smith": `first-name="h"`, `last-name=""`. Error banner text: `Error: Last Name is required`. URL stays on `checkout-step-one.html`. Screenshot `s2-checkout-lastname.png` | Critical |
| 2 | Inventory – add to cart | Inventory → click "Add to cart" on all 6 products | All 6 buttons switch to "Remove"; badge shows 6 | Only Backpack, Bike Light and Onesie are added. Bolt T-Shirt, Fleece Jacket and Test.allTheThings() T-Shirt (Red) stay on "Add to cart" | Cart badge `3`. Buttons: Bolt T-Shirt, Fleece Jacket and Red T-Shirt still show `Add to cart` | High |
| 3 | Product detail – navigation | Inventory → click each product name (also tried from the Cart) | The detail page for the product that was clicked | Every link opens a different product: Backpack→Fleece Jacket (id=5), Bike Light→Bolt T-Shirt (id=1), Bolt T-Shirt→Onesie (id=2), Onesie→Red T-Shirt (id=3), Red T-Shirt→Backpack (id=4). The Backpack link in the Cart also opens the Fleece Jacket | Clicking `item-4-title-link` ("Sauce Labs Backpack") goes to `inventory-item.html?id=5`, which is titled "Sauce Labs Fleece Jacket" / $49.99. Screenshot `s2-backpack-opens-fleece.png` | High |
| 4 | Product detail – missing item | Inventory → click "Sauce Labs Fleece Jacket" name | Fleece Jacket detail page | A broken page with the title "ITEM NOT FOUND" and a nonsense price | URL `inventory-item.html?id=6`; name `ITEM NOT FOUND`; price `$√-1`. Screenshot `s2-fleece-item-not-found.png` | High |
| 5 | Inventory – remove | Add Backpack → click its "Remove" button on the inventory page | Item removed; button returns to "Add to cart"; badge goes down | Nothing happens | After clicking, the Backpack button still says `Remove` and the badge is still `3` | High |
| 6 | Product detail – add/remove | Open Fleece Jacket detail (via Backpack link) → Add to cart. Open Onesie detail (already in cart) → Remove | Button toggles and the cart badge updates | Neither button does anything | Fleece detail: button still `Add to cart`, badge still `3`. Onesie detail: button still `Remove`, badge still `2` | High |
| 7 | Sorting | Inventory → choose "Name (Z to A)", then "Price (low to high)" in the sort dropdown | Products reorder, and the dropdown label shows the chosen option | The order never changes and the label snaps back to "Name (A to Z)" | After each choice: active option `Name (A to Z)`, select value `az`. Names still Backpack…Red T-Shirt (A→Z); prices still `$29.99, $9.99, $15.99, $49.99, $7.99, $15.99` | Medium |
| 8 | Inventory – images | Log in and look at the product grid | Each product shows its own photo | All 6 products show the same "sl-404" placeholder image | Every product `<img>` src is `/assets/sl-404-Cq1a9k9X.jpg`. The real image exists (Bolt T-Shirt detail uses `/assets/bolt-shirt-1200x1500-mR0ldpVS.jpg`). Screenshot `s2-inventory-images.png` | Medium |

## Worked as expected

- Login with `problem_user` / `secret_sauce` lands on `/inventory.html`.
- Cart lists the items that were actually added, each with qty 1 and the correct price.
- "Remove" **inside the cart** works (Bike Light removed; badge went from 3 to 2).
- Checkout "Cancel" returns to the cart.

## Notes

- The console shows repeated `401 (Unauthorized)` errors from `events.backtrace.io` (telemetry). Customers don't see these, so they aren't counted as findings.
- Checkout overview, totals and order completion weren't reachable because finding #1 blocks step 1.
