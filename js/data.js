
"use strict";

const SITE = {
  brand: "Forever Day",
  whatsapp: "201000000000",
  currency: "EGP",
  email: "hello@foreverday.com",
  phone: "+20 100 000 0000",
  address: "Cairo, Egypt",
};

const CATEGORIES = [
  { id: "halls", name: "Venues", icon: "fa-landmark", unit: "event", blurb: "Gardens, sea views and grand ballrooms." },
  { id: "photographers", name: "Photographers", icon: "fa-camera-retro", unit: "event", blurb: "Photo & video teams for your whole day." },
  { id: "catering", name: "Food Menus", icon: "fa-utensils", unit: "guest", blurb: "Buffets, grills and plated dinners." },
  { id: "makeup", name: "Makeup Artists", icon: "fa-paint-brush", unit: "event", blurb: "Bridal looks, hair and hijab styling." },
  { id: "cakes", name: "Wedding Cakes", icon: "fa-birthday-cake", unit: "event", blurb: "Tiered cakes and dessert towers." },
];

const VENDORS = [
  // ---------- Venues ----------
  {
    id: "h1", cat: "halls", name: "Rose Garden Lawn", img: "images/halls/garden.jpg",
    place: "New Cairo", rating: 4.9, reviews: 212, capacity: 300,
    about: "An open-air lawn with a white aisle, floral arch and a covered dinner area for the evening.",
    features: ["Open air", "Floral arch", "Parking for 120 cars", "Bridal suite"],
    packages: [
      { id: "half", name: "Evening (5 hours)", price: 65000 },
      { id: "full", name: "Full day (10 hours)", price: 110000 },
    ],
    booked: ["2026-11-06", "2026-11-13", "2026-11-27", "2026-12-04", "2026-12-25"],
  },
  {
    id: "h2", cat: "halls", name: "Blue Bay Terrace", img: "images/halls/sea.jpg",
    place: "North Coast", rating: 4.8, reviews: 168, capacity: 180,
    about: "A seaside terrace at sunset with candle-lit long tables and the sound of the waves.",
    features: ["Sea view", "Sunset ceremony", "Candle setup", "Sound system"],
    packages: [
      { id: "half", name: "Sunset (5 hours)", price: 80000 },
      { id: "full", name: "Full day (10 hours)", price: 135000 },
    ],
    booked: ["2026-11-07", "2026-11-14", "2026-11-21", "2026-12-12"],
  },
  {
    id: "h3", cat: "halls", name: "Crystal Ballroom", img: "images/halls/grand.jpg",
    place: "Heliopolis", rating: 4.7, reviews: 304, capacity: 500,
    about: "A closed, air-conditioned ballroom with gold Chiavari chairs, a stage and a dance floor.",
    features: ["Air conditioned", "500 guests", "Stage & dance floor", "DJ booth"],
    packages: [
      { id: "half", name: "Evening (5 hours)", price: 95000 },
      { id: "full", name: "Evening + after party", price: 140000 },
    ],
    booked: ["2026-11-05", "2026-11-12", "2026-11-19", "2026-11-26", "2026-12-03", "2026-12-31"],
  },
  {
    id: "h4", cat: "halls", name: "Candlelight Hall", img: "images/halls/candle.jpg",
    place: "Zamalek", rating: 4.8, reviews: 97, capacity: 120,
    about: "A small, warm hall for intimate weddings — long tables, brass candle holders and greenery.",
    features: ["Intimate", "Long tables", "Live music corner", "Valet"],
    packages: [
      { id: "half", name: "Evening (5 hours)", price: 45000 },
      { id: "full", name: "Full day (10 hours)", price: 75000 },
    ],
    booked: ["2026-11-20", "2026-12-18"],
  },
  {
    id: "h5", cat: "halls", name: "Fairy Lights Courtyard", img: "images/halls/lights.jpg",
    place: "Sheikh Zayed", rating: 4.6, reviews: 141, capacity: 220,
    about: "A courtyard covered with string lights and pink hydrangeas — magical after dark.",
    features: ["String lights", "Fresh flowers", "Outdoor & indoor", "Kids area"],
    packages: [
      { id: "half", name: "Evening (5 hours)", price: 55000 },
      { id: "full", name: "Full day (10 hours)", price: 90000 },
    ],
    booked: ["2026-11-08", "2026-11-28", "2026-12-05"],
  },
  {
    id: "h6", cat: "halls", name: "Vintage Brick House", img: "images/halls/vintage.jpg",
    place: "Maadi", rating: 4.5, reviews: 76, capacity: 150,
    about: "Exposed brick, dessert tables and vintage details for a relaxed, cosy wedding.",
    features: ["Vintage style", "Dessert corner", "Photo spots", "Garden access"],
    packages: [
      { id: "half", name: "Evening (5 hours)", price: 40000 },
      { id: "full", name: "Full day (10 hours)", price: 68000 },
    ],
    booked: ["2026-11-15"],
  },

  // ---------- Photographers ----------
  {
    id: "p1", cat: "photographers", name: "Lina Farouk Studio", img: "images/photographers/cam-1.jpg",
    place: "Cairo", rating: 4.9, reviews: 186, style: "Natural & candid",
    about: "Soft natural light and real moments. Lina's team follows you from getting ready to the last dance.",
    features: ["2 photographers", "Same-week preview", "Online gallery"],
    gallery: ["images/portfolio/w2.jpg", "images/portfolio/w4.jpg", "images/portfolio/w11.jpg", "images/portfolio/w6.jpg"],
    packages: [
      { id: "photo", name: "Photo only (6 hours)", price: 12000 },
      { id: "photo-video", name: "Photo + video (8 hours)", price: 22000 },
      { id: "premium", name: "Full day + album + drone", price: 32000 },
    ],
    booked: ["2026-11-06", "2026-11-20", "2026-12-04"],
  },
  {
    id: "p2", cat: "photographers", name: "Karim Mansour", img: "images/photographers/cam-2.jpg",
    place: "Giza", rating: 4.8, reviews: 129, style: "Classic & elegant",
    about: "Timeless posed portraits and family photos, edited in a clean classic style.",
    features: ["Studio lighting", "Printed album", "Family portraits"],
    gallery: ["images/portfolio/w3.jpg", "images/portfolio/w1.jpg", "images/portfolio/w10.jpg", "images/portfolio/w15.jpg"],
    packages: [
      { id: "photo", name: "Photo only (6 hours)", price: 9000 },
      { id: "photo-video", name: "Photo + video (8 hours)", price: 17000 },
      { id: "premium", name: "Full day + 2 albums", price: 25000 },
    ],
    booked: ["2026-11-13", "2026-11-27"],
  },
  {
    id: "p3", cat: "photographers", name: "Film & Frame", img: "images/photographers/cam-3.jpg",
    place: "Alexandria", rating: 4.9, reviews: 94, style: "Film & fine art",
    about: "Shot on medium-format film and digital. Warm tones, soft grain, very artistic.",
    features: ["Film + digital", "Fine-art prints", "Engagement session"],
    gallery: ["images/portfolio/w13.jpg", "images/portfolio/w12.jpg", "images/portfolio/w14.jpg", "images/portfolio/w8.jpg"],
    packages: [
      { id: "photo", name: "Photo only (6 hours)", price: 15000 },
      { id: "photo-video", name: "Photo + film video", price: 26000 },
      { id: "premium", name: "Full day + engagement shoot", price: 36000 },
    ],
    booked: ["2026-11-07", "2026-11-21", "2026-12-12"],
  },
  {
    id: "p4", cat: "photographers", name: "Golden Hour Media", img: "images/photographers/cam-4.jpg",
    place: "New Cairo", rating: 4.7, reviews: 211, style: "Cinematic video",
    about: "A video-first team: cinematic highlight films, drone shots and a same-night teaser.",
    features: ["Drone", "Same-night teaser", "4K highlight film"],
    gallery: ["images/portfolio/w5.jpg", "images/portfolio/w9.jpg", "images/portfolio/w16.jpg", "images/portfolio/w7.jpg"],
    packages: [
      { id: "photo", name: "Photo only (6 hours)", price: 10000 },
      { id: "photo-video", name: "Photo + cinematic video", price: 24000 },
      { id: "premium", name: "Full crew + drone + teaser", price: 38000 },
    ],
    booked: ["2026-11-05", "2026-11-12", "2026-11-26"],
  },
  {
    id: "p5", cat: "photographers", name: "Youssef Adel", img: "images/photographers/cam-5.jpg",
    place: "Cairo", rating: 4.6, reviews: 58, style: "Documentary",
    about: "Stays in the background and tells the story of your day as it really happened.",
    features: ["Storytelling", "Fast delivery", "Budget friendly"],
    gallery: ["images/portfolio/w7.jpg", "images/portfolio/w6.jpg", "images/portfolio/w2.jpg", "images/portfolio/w11.jpg"],
    packages: [
      { id: "photo", name: "Photo only (6 hours)", price: 7000 },
      { id: "photo-video", name: "Photo + video (8 hours)", price: 13000 },
    ],
    booked: ["2026-11-14"],
  },
  {
    id: "p6", cat: "photographers", name: "Mariam Lens", img: "images/photographers/cam-6.jpg",
    place: "Sheikh Zayed", rating: 4.8, reviews: 102, style: "Bright & airy",
    about: "Light, pastel edits and lots of bride portraits. All-female team on request.",
    features: ["All-female team", "Bride portraits", "Online gallery"],
    gallery: ["images/portfolio/w10.jpg", "images/portfolio/w14.jpg", "images/portfolio/w1.jpg", "images/portfolio/w8.jpg"],
    packages: [
      { id: "photo", name: "Photo only (6 hours)", price: 11000 },
      { id: "photo-video", name: "Photo + video (8 hours)", price: 20000 },
      { id: "premium", name: "Full day + album", price: 28000 },
    ],
    booked: ["2026-11-08", "2026-12-05"],
  },

  // ---------- Food menus (price is per guest) ----------
  {
    id: "c1", cat: "catering", name: "Classic Open Buffet", img: "images/food/buffet.jpg",
    place: "All venues", rating: 4.7, reviews: 320, minGuests: 80,
    about: "A rich buffet with hot dishes, salads and a dessert corner, served by our waiters.",
    menu: ["Beef stroganoff", "Chicken with mushrooms", "Rice & pasta", "6 salads", "Fresh bread", "Dessert corner"],
    packages: [
      { id: "std", name: "Standard", price: 550 },
      { id: "plus", name: "With juice bar & live station", price: 750 },
    ],
    booked: [],
  },
  {
    id: "c2", cat: "catering", name: "Oriental Mixed Grill", img: "images/food/grill.jpg",
    place: "All venues", rating: 4.9, reviews: 275, minGuests: 60,
    about: "Kofta, shish tawook, lamb chops and grilled vegetables, with tahini and fresh bread.",
    menu: ["Kofta & kebab", "Shish tawook", "Lamb chops", "Grilled vegetables", "Tahini & baba ghanoush", "Oriental rice"],
    packages: [
      { id: "std", name: "Standard", price: 700 },
      { id: "plus", name: "With live grill station", price: 900 },
    ],
    booked: [],
  },
  {
    id: "c3", cat: "catering", name: "Royal Plated Dinner", img: "images/food/plated.jpg",
    place: "All venues", rating: 4.8, reviews: 118, minGuests: 50,
    about: "A served three-course dinner at the table — elegant and calm, perfect for smaller weddings.",
    menu: ["Soup or starter", "Duck breast or beef fillet", "Seasonal vegetables", "Mini dessert plate"],
    packages: [
      { id: "std", name: "3 courses", price: 950 },
      { id: "plus", name: "4 courses + welcome drink", price: 1200 },
    ],
    booked: [],
  },
  {
    id: "c4", cat: "catering", name: "Seafood Night", img: "images/food/seafood.jpg",
    place: "Sea venues", rating: 4.8, reviews: 89, minGuests: 50,
    about: "Shrimp, calamari, grilled fish and mussels — a favourite for beach weddings.",
    menu: ["Grilled sea bass", "Shrimp & calamari", "Mussels", "Seafood rice", "Salads & dips"],
    packages: [
      { id: "std", name: "Standard", price: 1050 },
      { id: "plus", name: "With oyster & sushi corner", price: 1350 },
    ],
    booked: [],
  },
  {
    id: "c5", cat: "catering", name: "Mezze & Salad Garden", img: "images/food/mezze.jpg",
    place: "All venues", rating: 4.6, reviews: 64, minGuests: 40,
    about: "Light and fresh: cold mezze, salads, pastries and cheese — great as a starter or for day weddings.",
    menu: ["Hummus & moutabal", "Tabbouleh & fattoush", "Cheese boards", "Mini pastries", "Fresh fruits"],
    packages: [
      { id: "std", name: "Standard", price: 400 },
      { id: "plus", name: "With hot mezze", price: 520 },
    ],
    booked: [],
  },
  {
    id: "c6", cat: "catering", name: "Family Feast", img: "images/food/feast.jpg",
    place: "All venues", rating: 4.7, reviews: 143, minGuests: 100,
    about: "Big trays of roasted chicken and lamb on rice, the way family weddings are done.",
    menu: ["Roasted chicken on rice", "Lamb ouzi", "Molokhia", "Salads", "Basbousa & kunafa"],
    packages: [
      { id: "std", name: "Standard", price: 480 },
      { id: "plus", name: "With whole lamb", price: 650 },
    ],
    booked: [],
  },

  // ---------- Makeup artists ----------
  {
    id: "m1", cat: "makeup", name: "Nour Beauty Lounge", img: "images/makeup/mu-1.jpg",
    place: "Heliopolis", rating: 4.9, reviews: 233, style: "Soft glam",
    about: "Soft, glowing bridal makeup that lasts all night and looks beautiful in photos.",
    features: ["Lashes included", "Long-wear products", "Comes to your venue"],
    gallery: ["images/makeup/looks/m1-1.jpg", "images/makeup/looks/m1-2.jpg", "images/makeup/looks/m1-3.jpg", "images/makeup/looks/m1-4.jpg"],
    packages: [
      { id: "bride", name: "Bride only", price: 6000 },
      { id: "trial", name: "Bride + trial session", price: 8000 },
      { id: "party", name: "Bride + 3 bridesmaids", price: 12000 },
    ],
    booked: ["2026-11-06", "2026-11-13", "2026-12-04"],
  },
  {
    id: "m2", cat: "makeup", name: "Salma Hijab Styling", img: "images/makeup/mu-2.jpg",
    place: "Nasr City", rating: 4.8, reviews: 167, style: "Makeup + hijab",
    about: "Bridal makeup with elegant hijab and veil styling, plus the crown and pins.",
    features: ["Hijab & veil styling", "Crown fitting", "Touch-up kit"],
    gallery: ["images/makeup/looks/m2-1.jpg", "images/makeup/looks/m2-2.jpg", "images/makeup/looks/m2-3.jpg", "images/makeup/looks/m2-4.jpg"],
    packages: [
      { id: "bride", name: "Bride only", price: 5000 },
      { id: "trial", name: "Bride + trial session", price: 6800 },
      { id: "party", name: "Bride + mother + sister", price: 9500 },
    ],
    booked: ["2026-11-20", "2026-11-27"],
  },
  {
    id: "m3", cat: "makeup", name: "Dina Glam Studio", img: "images/makeup/mu-3.jpg",
    place: "Zamalek", rating: 4.7, reviews: 121, style: "Full glam",
    about: "Bold, camera-ready full glam with contour, lashes and a matching hairstyle.",
    features: ["Hair styling", "Airbrush", "Studio or venue"],
    gallery: ["images/makeup/looks/m3-1.jpg", "images/makeup/looks/m3-2.jpg", "images/makeup/looks/m3-3.jpg", "images/makeup/looks/m3-4.jpg"],
    packages: [
      { id: "bride", name: "Bride makeup + hair", price: 9000 },
      { id: "trial", name: "With trial session", price: 11500 },
      { id: "party", name: "Bride + 4 bridesmaids", price: 16000 },
    ],
    booked: ["2026-11-07", "2026-11-14", "2026-11-21"],
  },
  {
    id: "m4", cat: "makeup", name: "Habiba Artistry", img: "images/makeup/mu-4.jpg",
    place: "6th of October", rating: 4.6, reviews: 72, style: "Natural",
    about: "Fresh, natural looks for brides who want to look like themselves — just glowing.",
    features: ["Skin prep", "Natural lashes", "Budget friendly"],
    gallery: ["images/makeup/looks/m4-1.jpg", "images/makeup/looks/m4-2.jpg", "images/makeup/looks/m4-3.jpg", "images/makeup/looks/m4-4.jpg"],
    packages: [
      { id: "bride", name: "Bride only", price: 3500 },
      { id: "trial", name: "Bride + trial session", price: 5000 },
    ],
    booked: ["2026-11-28"],
  },
  {
    id: "m5", cat: "makeup", name: "Rania Pro Makeup", img: "images/makeup/mu-5.jpg",
    place: "New Cairo", rating: 4.9, reviews: 189, style: "Luxury bridal",
    about: "Luxury brands, a two-person team and a full day with you — from henna night to wedding.",
    features: ["Two artists", "Henna night look", "Luxury brands"],
    gallery: ["images/makeup/looks/m5-1.jpg", "images/makeup/looks/m5-2.jpg", "images/makeup/looks/m5-3.jpg", "images/makeup/looks/m5-4.jpg"],
    packages: [
      { id: "bride", name: "Wedding day", price: 12000 },
      { id: "trial", name: "Wedding + henna night", price: 18000 },
      { id: "party", name: "Wedding + henna + 3 guests", price: 24000 },
    ],
    booked: ["2026-11-05", "2026-11-19", "2026-12-12"],
  },

  // ---------- Wedding cakes ----------
  {
    id: "k1", cat: "cakes", name: "Rose Garden", img: "images/cakes/rose-garden.jpg",
    place: "Sugar & Lace Bakery", rating: 4.9, reviews: 98, servings: 150,
    about: "Three tiers in mint fondant, wrapped with pink sugar roses.",
    flavors: ["Vanilla & raspberry", "Chocolate fudge", "Red velvet", "Pistachio"],
    packages: [
      { id: "3", name: "3 tiers · 150 servings", price: 7500 },
      { id: "4", name: "4 tiers · 220 servings", price: 10500 },
    ],
    booked: ["2026-11-06"],
  },
  {
    id: "k2", cat: "cakes", name: "Ivory Peony", img: "images/cakes/ivory-peony.jpg",
    place: "Maison Sucre", rating: 4.8, reviews: 76, servings: 120,
    about: "Blush and gold tiers on a vintage stand, topped with white sugar peonies.",
    flavors: ["Vanilla & raspberry", "Lemon & elderflower", "Chocolate fudge", "Caramel"],
    packages: [
      { id: "2", name: "2 tiers · 80 servings", price: 5200 },
      { id: "3", name: "3 tiers · 120 servings", price: 7800 },
    ],
    booked: [],
  },
  {
    id: "k3", cat: "cakes", name: "White Rosette", img: "images/cakes/white-rosette.jpg",
    place: "Sugar & Lace Bakery", rating: 4.7, reviews: 143, servings: 60,
    about: "A single big cake covered in hand-piped buttercream roses. Simple and romantic.",
    flavors: ["Vanilla", "Red velvet", "Carrot & walnut"],
    packages: [
      { id: "1", name: "1 tier · 60 servings", price: 2800 },
      { id: "2", name: "2 tiers · 100 servings", price: 4500 },
    ],
    booked: [],
  },
  {
    id: "k4", cat: "cakes", name: "Pink Floral Tiers", img: "images/cakes/pink-floral.jpg",
    place: "La Rose Cakes", rating: 4.9, reviews: 64, servings: 180,
    about: "Ivory tiers with hand-painted pink flowers and gold leaf — a showpiece for the hall.",
    flavors: ["Pistachio & rose", "Chocolate fudge", "Vanilla & raspberry", "Lotus"],
    packages: [
      { id: "3", name: "3 tiers · 180 servings", price: 9500 },
      { id: "4", name: "4 tiers · 250 servings", price: 13000 },
    ],
    booked: ["2026-11-13", "2026-11-20"],
  },
  {
    id: "k5", cat: "cakes", name: "Chocolate Naked Cake", img: "images/cakes/choco-naked.jpg",
    place: "Maison Sucre", rating: 4.8, reviews: 51, servings: 90,
    about: "Rich chocolate layers with strawberry cream, finished with fresh pink roses.",
    flavors: ["Chocolate & strawberry", "Chocolate & hazelnut", "Mocha"],
    packages: [
      { id: "2", name: "2 tiers · 60 servings", price: 4200 },
      { id: "3", name: "3 tiers · 90 servings", price: 6000 },
    ],
    booked: [],
  },
  {
    id: "k6", cat: "cakes", name: "Vintage Ribbon", img: "images/cakes/vintage-ribbon.jpg",
    place: "La Rose Cakes", rating: 4.6, reviews: 39, servings: 100,
    about: "Cream tiers with red satin ribbons and sugar roses in pink and ivory.",
    flavors: ["Vanilla", "Lemon", "Red velvet"],
    packages: [
      { id: "3", name: "3 tiers · 100 servings", price: 5500 },
    ],
    booked: [],
  },
  {
    id: "k7", cat: "cakes", name: "Cupcake Tower", img: "images/cakes/cupcake-tower.jpg",
    place: "Sugar & Lace Bakery", rating: 4.7, reviews: 87, servings: 100,
    about: "100 cupcakes in lace wrappers with pearl sprinkles, plus a small cake on top to cut.",
    flavors: ["Vanilla", "Chocolate", "Mixed"],
    packages: [
      { id: "100", name: "100 cupcakes + top cake", price: 3800 },
      { id: "200", name: "200 cupcakes + top cake", price: 6500 },
    ],
    booked: [],
  },
];

const DEFAULT_CHECKLIST = [
  { id: "t1", text: "Set the budget and guest count", when: "12 months before" },
  { id: "t2", text: "Book the venue", when: "10 months before" },
  { id: "t3", text: "Book the photographer", when: "9 months before" },
  { id: "t4", text: "Choose the food menu", when: "6 months before" },
  { id: "t5", text: "Buy or rent the dress", when: "6 months before" },
  { id: "t6", text: "Book the makeup artist and do a trial", when: "4 months before" },
  { id: "t7", text: "Send the invitations", when: "2 months before" },
  { id: "t8", text: "Order the wedding cake", when: "6 weeks before" },
  { id: "t9", text: "Confirm the final guest count with the caterer", when: "2 weeks before" },
  { id: "t10", text: "Pack an emergency kit for the day", when: "1 day before" },
];

const TESTIMONIALS = [
  { name: "Sara & Karim", date: "September 2026", text: "We booked the venue, the photographer and the cake in one evening. On the day everything just worked." },
  { name: "Mariam & Ahmed", date: "July 2026", text: "The planner kept us on budget — we always knew how much was left. The grill menu was a hit!" },
  { name: "Nada & Youssef", date: "May 2026", text: "Seeing who's free on our date saved us so many phone calls. Our makeup artist was perfect." },
];

const FAQ = [
  { q: "Is my booking confirmed right away?", a: "Your plan is sent to us on WhatsApp. We call the vendors, confirm the date and send you a confirmation within 24 hours." },
  { q: "Do I need to pay a deposit?", a: "Most vendors ask for 20–30% to hold the date. We tell you the exact amount when we confirm." },
  { q: "Can I change my menu or package later?", a: "Yes. You can change the package or guest count until two weeks before the wedding." },
  { q: "Are the prices final?", a: "The prices shown are the starting prices for each package. Extras like decoration or travel to another city are added on request." },
];
