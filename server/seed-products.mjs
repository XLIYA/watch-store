import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "db.json");

const db = JSON.parse(
  fs.readFileSync(dbPath, "utf8"),
);

const existingSlugs = new Set(
  db.products.map((product) => product.slug),
);

const images = [
  "/images/products/watch-placeholder-1.webp",
  "/images/products/watch-placeholder-2.webp",
  "/images/products/watch-placeholder-3.webp",
];

const catalog = [
  {
    category: 1,
    brand: "Aurel",
    subcategories: [1, 2, 3],
    products: [
      [
        "Heritage Classic 38",
        "heritage-classic-38",
        118000000,
      ],
      [
        "Tradition Hand Wound",
        "tradition-hand-wound",
        137000000,
      ],
      [
        "Maison Automatic",
        "maison-automatic",
        152000000,
      ],
      [
        "Vintage Sector 40",
        "vintage-sector-40",
        164000000,
      ],
      [
        "Heritage Small Seconds",
        "heritage-small-seconds",
        179000000,
      ],
    ],
  },
  {
    category: 2,
    brand: "Velmont",
    subcategories: [4, 5, 6],
    products: [
      [
        "Élite Slim 39",
        "elite-slim-39",
        155000000,
      ],
      [
        "Luna Moonphase",
        "luna-moonphase",
        188000000,
      ],
      [
        "Épure Ultra Thin",
        "epure-ultra-thin",
        205000000,
      ],
      [
        "Maison Dress 01",
        "maison-dress-01",
        168000000,
      ],
      [
        "Velmont Réserve",
        "velmont-reserve",
        232000000,
      ],
    ],
  },
  {
    category: 3,
    brand: "Rivane",
    subcategories: [7, 8, 9],
    products: [
      [
        "Aero Sport RS",
        "aero-sport-rs",
        132000000,
      ],
      [
        "Pilot Automatic 42",
        "pilot-automatic-42",
        149000000,
      ],
      [
        "Field Expedition",
        "field-expedition",
        97000000,
      ],
      [
        "Racing Carbon GT",
        "racing-carbon-gt",
        184000000,
      ],
      [
        "Aviation GMT",
        "aviation-gmt",
        176000000,
      ],
    ],
  },
  {
    category: 4,
    brand: "Aurel",
    subcategories: [10, 11, 12],
    products: [
      [
        "Ocean Professional 500",
        "ocean-professional-500",
        214000000,
      ],
      [
        "Deep Sea Ceramic",
        "deep-sea-ceramic",
        238000000,
      ],
      [
        "Abyss Automatic",
        "abyss-automatic",
        198000000,
      ],
      [
        "Ocean GMT 300",
        "ocean-gmt-300",
        226000000,
      ],
      [
        "Mariner Black",
        "mariner-black",
        187000000,
      ],
    ],
  },
  {
    category: 5,
    brand: "Montreux",
    subcategories: [13, 14, 15],
    products: [
      [
        "Chronos Bi Compax",
        "chronos-bi-compax",
        196000000,
      ],
      [
        "Circuit Tri Compax",
        "circuit-tri-compax",
        209000000,
      ],
      [
        "Flyback Racing 42",
        "flyback-racing-42",
        245000000,
      ],
      [
        "Chronograph Heritage",
        "chronograph-heritage",
        189000000,
      ],
      [
        "Montreux Tachymeter",
        "montreux-tachymeter",
        228000000,
      ],
    ],
  },
  {
    category: 6,
    brand: "Velmont",
    subcategories: [16, 17, 18],
    products: [
      [
        "Skeleton No. 12",
        "skeleton-no-12",
        420000000,
      ],
      [
        "Tourbillon Atelier",
        "tourbillon-atelier",
        740000000,
      ],
      [
        "Métiers Artistic 01",
        "metiers-artistic-01",
        510000000,
      ],
      [
        "Openworked Reserve",
        "openworked-reserve",
        465000000,
      ],
      [
        "Grand Complication 06",
        "grand-complication-06",
        890000000,
      ],
    ],
  },
];

let nextId =
  Math.max(
    0,
    ...db.products.map((product) =>
      Number(product.id),
    ),
  ) + 1;

const newProducts = [];

let globalIndex = 0;

for (const collection of catalog) {
  collection.products.forEach(
    ([name, slug, price], index) => {
      if (existingSlugs.has(slug)) {
        return;
      }

      const firstQuantity =
        2 + ((globalIndex + index) % 5);

      const secondQuantity =
        1 + ((globalIndex + index * 2) % 4);

      const quantity =
        firstQuantity + secondQuantity;

      const product = {
        id: nextId++,

        name,
        slug,

        brand: collection.brand,

        category: collection.category,

        subcategory:
          collection.subcategories[
            index %
              collection.subcategories.length
          ],

        thumbnail:
          images[globalIndex % images.length],

        images: [
          images[globalIndex % images.length],
          images[
            (globalIndex + 1) % images.length
          ],
        ],

        description: `<p>${name} ساعتی از مجموعه ${collection.brand} با طراحی دقیق، کیفیت ساخت بالا و هویتی متمایز برای استفاده روزمره و حرفه‌ای است.</p>`,

        price,

        quantity,

        variants: [
          {
            id: "black",
            name: "مشکی",
            hex: "#111111",
            quantity: firstQuantity,
          },
          {
            id: "silver",
            name: "نقره‌ای",
            hex: "#BFC0C2",
            quantity: secondQuantity,
          },
        ],

        soldCount:
          4 +
          ((globalIndex * 11 +
            collection.category * 7) %
            60),

        isHero: false,

        heroOrder: null,

        createdAt:
          Date.now() -
          globalIndex *
            24 *
            60 *
            60 *
            1000,
      };

      newProducts.push(product);
      existingSlugs.add(slug);

      globalIndex += 1;
    },
  );
}

db.products.push(...newProducts);

fs.writeFileSync(
  dbPath,
  JSON.stringify(db, null, 2) + "\n",
  "utf8",
);

console.log(
  `Seed completed: ${newProducts.length} products added.`,
);

console.log(
  `Total products: ${db.products.length}`,
);
