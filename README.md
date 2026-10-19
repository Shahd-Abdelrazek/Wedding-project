# Forever Day — Wedding planning website

A static website (HTML + CSS + JavaScript, no build step). Open `index.html` in a browser.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home: photo slider, "who's free on my date" search, services, wedding countdown, top-rated vendors, real-wedding gallery, reviews, team, FAQ, contact on WhatsApp |
| `services.html` | Venues, photographers, food menus, makeup artists and cakes in tabs (`#halls`, `#photographers`, `#catering`, `#makeup`, `#cakes`) with search, sorting, "free on my day" and favourites |
| `planner.html` | Couple names, wedding date, guests and budget; budget per category; chosen vendors; checklist; print |

On every page:
- **Details**: photos (with a photo viewer), what's included / the menu, packages and prices.
- **Booking**: a calendar shows booked days; pick a day, a package, guests (for food) or flavour (for cakes). If the day is taken it suggests the nearest free days.
- **My plan** (top right): everything you chose, the total, how much budget is left, and **Send my plan to book** on WhatsApp.
- **5 languages**: English, العربية (right-to-left), Français, Italiano, Deutsch — the globe button in the header. The choice is remembered.
- Makeup artists' details open on photos of brides they made up.
- Light / dark mode, and it works on phones.

The plan, favourites, settings and checklist are saved in the visitor's browser (there is no server yet).

## Where to change things

| What | File |
|---|---|
| WhatsApp number, brand name, currency, contact info | `js/data.js` → `SITE` |
| Vendors: name, photo, packages and prices, booked dates | `js/data.js` → `VENDORS` |
| Checklist, reviews, FAQ | `js/data.js` → `DEFAULT_CHECKLIST`, `TESTIMONIALS`, `FAQ` |
| Typical budget share per category | `js/planner.js` → `BUDGET_GUIDE` |
| Colours and fonts | `css/style.css` → `:root` (dark mode just below it) |
| Translations | `js/lang/ar.js`, `fr.js`, `it.js`, `de.js` — each one maps the English text to its translation |

## Adding or changing text

The English text is written directly in the code and in `js/data.js`. The other languages look it up by that English text:

```js
I18N.fr = { "Book": "Réserver", ... };
```

So when you change an English text (or add a new vendor), add the same English text with its translation to each file in `js/lang/`. Anything without a translation is shown in English.

