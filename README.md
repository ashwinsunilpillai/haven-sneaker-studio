# Haven Sneaker Studio

Build the frontend for a premium B2C sneaker ecommerce website called "Haven".

IMPORTANT:

This is the FRONTEND/DESIGN phase only.

Do NOT implement a real backend, database, authentication backend, Stripe, Socket.IO, Redis, Cloudinary, Nodemailer, or any external API.

Use realistic mock data and mock interactions for now. Structure the frontend cleanly so that a real Express/Node backend can be connected later.

==================================================

1. TECHNOLOGY

==================================================

Use:

- Next.js

- React

- TypeScript

- Modern responsive CSS / Tailwind if appropriate

- Reusable React components

- Clean component architecture

The frontend should be production-quality rather than a simple demo.

Avoid unnecessarily complicated dependencies.

==================================================

2. BRAND

==================================================

Brand name:

HAVEN

Haven is a premium sneaker marketplace focused on authentic sneakers, modern streetwear culture, and a clean shopping experience.

The visual identity should feel:

- Premium

- Modern

- Minimal

- Fashion-oriented

- Slightly editorial

- Sophisticated

- Youthful without looking childish

- Similar in quality to a high-end sneaker/fashion ecommerce website

Do NOT make it look like a generic Shopify template.

The sneakers should be the visual focus.

Use generous whitespace, strong typography, large product imagery, subtle animations, clean cards, and polished hover states.

==================================================

3. MAIN NAVIGATION

==================================================

Create a persistent responsive navbar.

Desktop navbar:

-------------------------------------------------------------------------------

HAVEN       Search sneakers...        Live Auctions          Cart            Account

-------------------------------------------------------------------------------

Left:

HAVEN

Clicking "HAVEN" should navigate to the homepage "/".

Center:

A search bar that allows the user to search products.

Right:

- Live Auctions

- Cart icon

- Account icon/menu

The homepage should focus on Featured Sneakers.

The navbar should become a mobile-friendly menu on smaller screens.

==================================================

4. ROUTES

==================================================

Create these frontend routes:

/login

/signup

/

/auction

/product/[slug]

/cart

/checkout

After login/signup, the mock flow should take the user to "/".

After logout, the user should be taken back to "/login".

Use mock authentication state for now.

==================================================

5. LOGIN PAGE

==================================================

Create a polished Haven login page.

Include:

- Haven logo/name

- Email input

- Password input

- Login button

- "Don't have an account? Sign up" link

- Appropriate validation/error states

- Loading state

The login should use mock authentication for now.

After successful mock login:

/login -> /

==================================================

6. SIGNUP PAGE

==================================================

Create a polished signup page.

Fields:

- Name

- Email

- Password

- Confirm password

Include:

- Create Account button

- Link back to login

- Validation states

- Loading state

Use mock authentication.

After successful signup:

/signup -> /

==================================================

7. HOMEPAGE

==================================================

The homepage is the most important page.

Structure it as:

--------------------------------------------------

NAVBAR

--------------------------------------------------

HERO SECTION

Large premium hero section.

Display:

HAVEN

"Find your next pair."

Use a strong sneaker-focused visual treatment.

Include a primary CTA:

[ SHOP SNEAKERS ]

and a secondary CTA:

[ LIVE AUCTIONS ]

The Live Auctions CTA should be visually prominent because live bidding is an important part of Haven.

The hero should feel premium and editorial rather than like a basic ecommerce banner.

--------------------------------------------------

FEATURED SNEAKERS

--------------------------------------------------

Section title:

FEATURED SNEAKERS

Subtitle:

"Handpicked pairs worth having."

Display a responsive product grid.

Initially use mock data for approximately 20 sneaker products.

Each card should contain:

- Product image

- Brand

- Product name

- Price

- Optional "Auction" badge

- Optional "New" badge

- Hover interaction

- Quick visual interaction where appropriate

Clicking a product card should navigate to:

/product/[slug]

Do NOT manually hard-code 20 separate cards.

Create a reusable ProductCard component and render the cards from a product data array.

--------------------------------------------------

LIVE AUCTIONS SECTION

--------------------------------------------------

This should be one of the most prominent sections on the homepage.

Section title:

LIVE AUCTIONS

Subtitle:

"Bid on exclusive pairs before time runs out."

Display several auction cards.

Each auction card should show:

- Product image

- Product name

- Current bid

- Number of bids

- Time remaining

- "Bid Higher" button

Example:

Jordan 11

Current bid

₹18,500

12 bids

01:24:32 remaining

[ BID HIGHER ]

Clicking the section or button should navigate to:

/auction

The countdown can be simulated using mock data.

The frontend should be structured so that this can later be replaced with real-time Socket.IO data.

--------------------------------------------------

ABOUT HAVEN

--------------------------------------------------

At the bottom of the homepage create an About Haven section.

Title:

ABOUT HAVEN

Use a short, sophisticated paragraph explaining Haven as a destination for sneaker enthusiasts looking to buy, discover, and bid on desirable sneakers.

Example tone:

"Haven is built for people who see sneakers as more than just something you wear. Discover carefully selected pairs, find your next favorite silhouette, and compete for exclusive sneakers through live auctions."

Keep it concise.

--------------------------------------------------

FOOTER

--------------------------------------------------

Create a clean footer containing:

HAVEN

About

Contact

Privacy

Terms

Social media placeholders

Copyright

==================================================

8. PRODUCT DETAILS PAGE

==================================================

Route:

/product/[slug]

Create a premium product detail page.

Layout:

LEFT:

Large product image/gallery.

RIGHT:

Product information.

Include:

- Brand

- Product name

- Price

- Description

- Available sizes

- Size selector

- Add to Cart

- Buy Now

- Bid Now / Bid Higher if the product is an auction item

Example:

Jordan 11 Retro

₹22,999

Select Size:

[ 7 ] [ 8 ] [ 9 ] [ 10 ] [ 11 ]

[ ADD TO CART ]

[ BUY NOW ]

If the product has an active auction:

CURRENT BID

₹18,500

TIME LEFT

01:24:32

[ BID HIGHER ]

The cart icon must be visible in the navbar on every product page.

Include a product image gallery or thumbnails if appropriate.

Include a product description/details section below the main product area.

==================================================

9. CART PAGE

==================================================

Route:

/cart

Display products currently added to the mock shopping cart.

Each cart item should show:

- Product image

- Product name

- Selected size

- Price

- Quantity

- Remove button

Show:

Subtotal

Shipping

Total

Include:

[ PROCEED TO CHECKOUT ]

Create appropriate empty-cart UI:

"Your cart is empty."

[ SHOP SNEAKERS ]

Cart state should persist during navigation using frontend state/local storage for this prototype.

Structure the code so it can later be replaced by backend/user-specific cart data.

==================================================

10. CHECKOUT PAGE

==================================================

Route:

/checkout

Create a polished checkout interface.

Include:

Customer information

- Name

- Email

- Phone

Shipping address:

- Address

- City

- State

- Postal code

- Country

Order summary:

- Products

- Subtotal

- Shipping

- Total

Include a prominent:

[ PAY NOW ]

button.

Do NOT implement real Stripe yet.

The button can show a mock payment/loading state.

The frontend should be structured so Stripe can later be integrated.

==================================================

11. LIVE AUCTION PAGE

==================================================

Route:

/auction

This should feel like a major feature of Haven.

Header:

LIVE AUCTIONS

Subtitle:

"Real-time bidding on exclusive pairs."

Display a grid/list of active auctions.

Each auction card should contain:

- Large product image

- Product name

- Current highest bid

- Number of bids

- Time remaining

- Current user's bid status where appropriate

- Bid Higher button

Example:

--------------------------------------------------

Jordan 11 Retro

Current Bid

₹18,500

12 Bids

Time Remaining

01:24:32

[ BID HIGHER ]

--------------------------------------------------

Clicking an auction should open the corresponding product page or auction detail interface.

For now, bidding can be simulated in frontend state.

IMPORTANT:

Structure the auction components so they can later receive real-time updates from Socket.IO.

Do not build fake Socket.IO infrastructure in this phase.

==================================================

12. SEARCH

==================================================

The navbar search bar should work against the mock product dataset.

When the user searches for:

"kobe"

show matching products.

When searching:

"jordan"

show matching Jordan products.

Search should be case-insensitive.

Create a polished search interaction/dropdown or search results experience.

The architecture should allow the mock search to later be replaced by an API call.

==================================================

13. PRODUCT DATA

==================================================

Create a typed product model/interface.

For example:

Product:

- id

- slug

- name

- brand

- model

- description

- price

- image

- sizes

- category

- isNew

- isAuction

- currentBid

- bidCount

- auctionEndsAt

Do NOT hard-code product information directly inside ProductCard components.

Use a central mock product dataset.

==================================================

14. INITIAL PRODUCTS

==================================================

The initial catalogue should contain approximately these 20 products:

1. Air Max 95

2. Air Max 97

3. Flightposite

4. Foamposite

5. Jordan 11

6. Jordan 12

7. Jordan 13

8. KD 4

9. KD 6

10. KD 12

11. Kobe 5

12. Kobe 6

13. Kobe 11

14. Kyrie 1

15. Kyrie 2

16. Kyrie 3

17. LeBron 10

18. LeBron 11

19. LeBron 12

20. Nike Mag

Use the supplied sneaker images (attached with the prompt) where available.

IMPORTANT:

Do not create 20 independent pieces of markup.

Use the reusable ProductCard component and a product data array.

If the supplied local images cannot be accessed during this generation phase, use temporary placeholders but keep the image paths/data centralized so they can easily be replaced later.

==================================================

15. DESIGN SYSTEM

==================================================

Create a consistent design system.

Use:

- Strong modern typography

- Large headings

- Clean spacing

- Premium product cards

- Rounded corners where appropriate, but don't overuse them

- Subtle borders

- Subtle shadows

- Smooth hover transitions

- Image zoom/scale on product card hover

- Button hover states

- Skeleton loading states

Avoid:

- Excessive gradients

- Excessive glassmorphism

- Cartoonish elements

- Huge rounded UI everywhere

- Generic dashboard styling

- Overly colorful backgrounds

- Unnecessary animations

The sneakers should remain the visual focus.

==================================================

16. RESPONSIVENESS

==================================================

The entire website must be responsive.

Desktop:

- Large product grids

- Full navbar

- Spacious layouts

Tablet:

- Adapt product grid

- Adjust typography

- Responsive navigation

Mobile:

- Mobile navbar

- Search accessible

- 1–2 column product grids

- Comfortable touch targets

- Product details stacked vertically

- Checkout optimized for mobile

Test the layout conceptually at:

- Desktop

- Tablet

- Mobile

==================================================

17. ACCESSIBILITY

==================================================

Use:

- Semantic HTML

- Accessible buttons

- Labels for inputs

- Keyboard-friendly navigation

- Proper alt text for product images

- Sufficient contrast

- Visible focus states

==================================================

18. COMPONENT ARCHITECTURE

==================================================

Create reusable components such as:

Navbar

SearchBar

ProductCard

ProductGrid

ProductImageGallery

ProductDetails

SizeSelector

CartIcon

CartItem

AuctionCard

AuctionGrid

BidPanel

HeroSection

FeaturedSneakers

LiveAuctionsSection

AboutSection

Footer

Button

Input

Modal / Dialog where appropriate

Do not duplicate UI unnecessarily.

==================================================

19. MOCK DATA / FUTURE BACKEND

==================================================

Keep all mock data and frontend service logic separated from UI components.

For example:

/data/products.ts

/data/auctions.ts

and/or:

/services/products.ts

/services/auth.ts

/services/cart.ts

/services/auctions.ts

The service layer should make it easy to later replace mock data with calls to an Express backend.

For example, eventually:

getProducts()

getProductBySlug()

searchProducts()

getAuctions()

placeBid()

getCart()

addToCart()

Do not implement the real API yet.

==================================================

20. AUTH UI STATE

==================================================

Create mock authentication state.

Support:

Logged out:

- Login

- Signup

Logged in:

- Account

- Logout

After logout:

-> /login

Do not implement JWT, bcrypt, cookies, or real authentication yet.

==================================================

21. IMPORTANT ENGINEERING REQUIREMENTS

==================================================

Keep the frontend clean and modular.

Do not create one giant page component.

Use reusable components.

Use TypeScript types/interfaces.

Keep mock data separate from components.

Use clear route structure.

Avoid unnecessary dependencies.

Do not implement backend functionality.

Do not implement fake versions of:

- PostgreSQL

- Prisma

- Express

- Redis

- Socket.IO

- Stripe

- Cloudinary

- Nodemailer

Those will be implemented later in the backend phase.

The goal of this phase is to produce a polished, production-quality frontend that can later be connected to a real backend.

==================================================

22. FINAL UX GOAL

==================================================

The final experience should feel like a legitimate premium sneaker marketplace.

The primary user journey should be:

LOGIN/SIGNUP

      ↓

HOME

      ↓

FEATURED SNEAKERS

      ↓

PRODUCT

      ↓

ADD TO CART

      ↓

CART

      ↓

CHECKOUT

And:

HOME

      ↓

LIVE AUCTIONS

      ↓

AUCTION

      ↓

BID HIGHER

      ↓

WIN AUCTION

Make "Live Auctions" a prominent part of the Haven identity.

The overall design should communicate:

HAVEN

"Your next pair is waiting."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1cc7e598-8013-40a4-bdc7-b7869dafdd7c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
