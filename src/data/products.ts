import type { Product } from "@/lib/types";

import airMax95 from "@/assets/air_max_95.asset.json";
import airMax97 from "@/assets/air_max_97.asset.json";
import flightposite from "@/assets/flightposite.asset.json";
import foamposite from "@/assets/foamposite.asset.json";
import jordan11 from "@/assets/jordan_11.asset.json";
import jordan12 from "@/assets/jordan_12.asset.json";
import jordan13 from "@/assets/jordan_13.asset.json";
import kd4 from "@/assets/kd_4.asset.json";
import kd6 from "@/assets/kd_6.asset.json";
import kd12 from "@/assets/kd_12.jpg";
import kobe5 from "@/assets/kobe_5.jpg";
import kobe6 from "@/assets/kobe_6.jpg";
import kobe11 from "@/assets/kobe_11.jpg";
import kyrie1 from "@/assets/kyrie_1.jpg";
import kyrie2 from "@/assets/kyrie_2.jpg";
import kyrie3 from "@/assets/kyrie_3.jpg";
import lebron10 from "@/assets/lebron_10.jpg";
import lebron11 from "@/assets/lebron_11.jpg";
import lebron12 from "@/assets/lebron_12.jpg";
import nikeMag from "@/assets/nike_mag.jpg";

/** Auction end times are mocked relative to load time. A real backend will supply absolute timestamps. */
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const CORE_SIZES = [7, 8, 9, 10, 11, 12];

export const products: Product[] = [
  {
    id: "p-01",
    slug: "air-max-95",
    name: "Air Max 95 OG",
    brand: "Nike",
    model: "Air Max 95",
    description:
      "The 1995 silhouette that rewrote sportswear. Layered gradient panels reference human anatomy, while visible Air in the heel and forefoot keeps the ride effortless.",
    price: 18999,
    image: airMax95.url,
    sizes: CORE_SIZES,
    category: "lifestyle",
    isNew: true,
  },
  {
    id: "p-02",
    slug: "air-max-97",
    name: "Air Max 97 Silver Bullet",
    brand: "Nike",
    model: "Air Max 97",
    description:
      "Wavy metallic lines inspired by Japanese bullet trains, wrapped over full-length Air. The most quietly futuristic pair in the archive.",
    price: 21499,
    image: airMax97.url,
    sizes: CORE_SIZES,
    category: "lifestyle",
    isAuction: true,
    currentBid: 16250,
    bidCount: 9,
    auctionEndsAt: inMinutes(148),
  },
  {
    id: "p-03",
    slug: "flightposite",
    name: "Air Flightposite",
    brand: "Nike",
    model: "Flightposite",
    description:
      "A moulded shell, a hidden zip shroud and zero visible seams. Late-nineties basketball design at its most sculptural.",
    price: 23999,
    image: flightposite.url,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-04",
    slug: "foamposite-one",
    name: "Air Foamposite One Royal",
    brand: "Nike",
    model: "Foamposite",
    description:
      "Poured foam over a carbon fibre plate. The Royal colourway remains the definitive statement piece of hardwood design.",
    price: 27999,
    image: foamposite.url,
    sizes: CORE_SIZES,
    category: "collectible",
    isAuction: true,
    currentBid: 24100,
    bidCount: 17,
    auctionEndsAt: inMinutes(52),
  },
  {
    id: "p-05",
    slug: "jordan-11",
    name: "Jordan 11 Retro Bred",
    brand: "Jordan",
    model: "Air Jordan 11",
    description:
      "Patent leather, ballistic mesh and a translucent outsole. The pair that made a basketball shoe formalwear.",
    price: 22999,
    image: jordan11.url,
    sizes: CORE_SIZES,
    category: "basketball",
    isAuction: true,
    currentBid: 18500,
    bidCount: 12,
    auctionEndsAt: inMinutes(84),
  },
  {
    id: "p-06",
    slug: "jordan-12",
    name: "Jordan 12 Taxi",
    brand: "Jordan",
    model: "Air Jordan 12",
    description:
      "Stitched leather panels inspired by a nineteenth-century Japanese flag, built on one of the sturdiest midsoles in the line.",
    price: 20999,
    image: jordan12.url,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-07",
    slug: "jordan-13",
    name: "Jordan 13 Playoff",
    brand: "Jordan",
    model: "Air Jordan 13",
    description:
      "A panther-paw outsole and a holographic eye on the collar. Quietly aggressive, endlessly wearable.",
    price: 21499,
    image: jordan13.url,
    sizes: CORE_SIZES,
    category: "basketball",
    isNew: true,
  },
  {
    id: "p-08",
    slug: "kd-4",
    name: "KD 4 Aunt Pearl",
    brand: "Nike",
    model: "KD 4",
    description:
      "A pink-on-pink tribute build with a mid-cut strap and Zoom cushioning. One of the most collected player editions ever made.",
    price: 24999,
    image: kd4.url,
    sizes: CORE_SIZES,
    category: "collectible",
    isAuction: true,
    currentBid: 21750,
    bidCount: 23,
    auctionEndsAt: inMinutes(31),
  },
  {
    id: "p-09",
    slug: "kd-6",
    name: "KD 6 Peanut Butter & Jelly",
    brand: "Nike",
    model: "KD 6",
    description:
      "Low, light and unapologetically loud. Visible Air in the heel with a printed graphic swoosh.",
    price: 17999,
    image: kd6.url,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-10",
    slug: "kd-12",
    name: "KD 12",
    brand: "Nike",
    model: "KD 12",
    description:
      "Full-length Zoom Air Strobel under a woven upper. Built for players who never stop moving.",
    price: 15999,
    image: kd12,
    sizes: CORE_SIZES,
    category: "basketball",
    isNew: true,
  },
  {
    id: "p-11",
    slug: "kobe-5",
    name: "Kobe 5 Protro",
    brand: "Nike",
    model: "Kobe 5",
    description:
      "The low-top that changed basketball footwear. Minimal weight, maximum court feel.",
    price: 19999,
    image: kobe5,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-12",
    slug: "kobe-6",
    name: "Kobe 6 Grinch",
    brand: "Nike",
    model: "Kobe 6",
    description:
      "Scaled upper, snake-inspired texture, and one of the loudest colour stories in the archive.",
    price: 26999,
    image: kobe6,
    sizes: CORE_SIZES,
    category: "collectible",
    isAuction: true,
    currentBid: 23400,
    bidCount: 14,
    auctionEndsAt: inMinutes(119),
  },
  {
    id: "p-13",
    slug: "kobe-11",
    name: "Kobe 11 Elite",
    brand: "Nike",
    model: "Kobe 11",
    description:
      "Flyknit over a carbon plate — barely there weight with lockdown that still holds up today.",
    price: 18499,
    image: kobe11,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-14",
    slug: "kyrie-1",
    name: "Kyrie 1",
    brand: "Nike",
    model: "Kyrie 1",
    description:
      "A rounded outsole built for direction changes, wrapped in a snug hyperfuse upper.",
    price: 12999,
    image: kyrie1,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-15",
    slug: "kyrie-2",
    name: "Kyrie 2",
    brand: "Nike",
    model: "Kyrie 2",
    description:
      "Sharper traction and a locked-in midfoot for the tightest handles in the league.",
    price: 13499,
    image: kyrie2,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-16",
    slug: "kyrie-3",
    name: "Kyrie 3",
    brand: "Nike",
    model: "Kyrie 3",
    description:
      "Low collar, aggressive outsole radius, and a fit that disappears once you're moving.",
    price: 13999,
    image: kyrie3,
    sizes: CORE_SIZES,
    category: "basketball",
    isNew: true,
  },
  {
    id: "p-17",
    slug: "lebron-10",
    name: "LeBron 10",
    brand: "Nike",
    model: "LeBron 10",
    description:
      "Articulated 180 Max Air with a Hyperfuse upper. Heavyweight cushioning with a premium finish.",
    price: 22499,
    image: lebron10,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-18",
    slug: "lebron-11",
    name: "LeBron 11",
    brand: "Nike",
    model: "LeBron 11",
    description:
      "Megafuse panels and dual Zoom units — engineered armour for the most physical game in basketball.",
    price: 23499,
    image: lebron11,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-19",
    slug: "lebron-12",
    name: "LeBron 12",
    brand: "Nike",
    model: "LeBron 12",
    description:
      "Hexagonal Zoom pods tuned by zone, under a megafuse cage. Explosive, responsive, unmistakable.",
    price: 24499,
    image: lebron12,
    sizes: CORE_SIZES,
    category: "basketball",
  },
  {
    id: "p-20",
    slug: "nike-mag",
    name: "Nike Mag",
    brand: "Nike",
    model: "Mag",
    description:
      "The most mythologised sneaker ever produced. Illuminated panels, a light-up sole and an unmatched grail status.",
    price: 149999,
    image: nikeMag,
    sizes: [8, 9, 10, 11],
    category: "collectible",
    isAuction: true,
    currentBid: 132000,
    bidCount: 41,
    auctionEndsAt: inMinutes(203),
  },
];
