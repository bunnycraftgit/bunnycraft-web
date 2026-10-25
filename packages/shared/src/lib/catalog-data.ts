
export function img(seed: string, w = 800, h = 800) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// A small curated pool of real, freely-licensed (Unsplash License) 3D
// printing photos — printers in action, filament, and nozzle/extruder
// detail shots — used in place of generic stock photography across
// categories and products. Cycled/reused positionally since dedicated
// stock photography doesn't exist for every specific product niche.
const PRINT_PHOTO_IDS = [
  "photo-1758387933125-5ac945b4e2cd", // 3D printer mid-print, neon-lit workspace
  "photo-1742971239045-afabc9f7d744", // Spools of colorful PLA filament
  "photo-1743056586194-837401d75e0a", // 3D printer actively printing a model
  "photo-1563520240344-52b067aa5f84", // Gray desktop 3D printer
  "photo-1563520239648-a24e51d4b570", // Laptop beside a 3D printer, workspace
  "photo-1739607448062-7d4accb12fe1", // Close-up of 3D printer, neon lighting
  "photo-1737010513550-9a2040761980", // Close-up of 3D printer machine
  "photo-1742971500442-8fb8610dfbf5", // Macro shot of nozzle/extruder with orange filament
];

export function printImage(index: number, w = 800, h = 800) {
  const i = ((index % PRINT_PHOTO_IDS.length) + PRINT_PHOTO_IDS.length) % PRINT_PHOTO_IDS.length;
  return `https://images.unsplash.com/${PRINT_PHOTO_IDS[i]}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

export const CATEGORIES = [
  { name: "Home Decor", slug: "home-decor", icon: "Home", description: "Sculptural pieces and functional decor for every room.", imageIndex: 1 },
  { name: "Gaming", slug: "gaming", icon: "Gamepad2", description: "Dice towers, controller mounts, and tabletop accessories.", imageIndex: 2 },
  { name: "Miniatures", slug: "miniatures", icon: "Dices", description: "High-detail 28mm and 32mm miniatures for tabletop games.", imageIndex: 7 },
  { name: "Figures", slug: "figures", icon: "UserRound", description: "Articulated and display figures, stylized or true-to-scale.", imageIndex: 6 },
  { name: "Organizers", slug: "organizers", icon: "Boxes", description: "Desk, drawer, and cable organization built to fit your space.", imageIndex: 3 },
  { name: "Tools", slug: "tools", icon: "Wrench", description: "Jigs, stands, and workshop helpers printed to spec.", imageIndex: 5 },
  { name: "Replacement Parts", slug: "replacement-parts", icon: "Cog", description: "One-off replacement parts for appliances and gear.", imageIndex: 4 },
  { name: "Gifts", slug: "gifts", icon: "Gift", description: "Personalized, one-of-a-kind gifts made to order.", imageIndex: 0 },
] as const;

export const FILAMENTS = [
  {
    id: "PLA",
    name: "Standard PLA",
    type: "PLA",
    pricePerGram: 0.045,
    density: 1.24,
    stockGrams: 12000,
    strength: "MEDIUM" as const,
    finish: "Matte",
    description: "Easy-to-print, biodegradable filament. Great all-purpose choice for decor and prototypes.",
    colors: [
      { name: "Arctic White", hex: "#F5F5F0" },
      { name: "Jet Black", hex: "#111214" },
      { name: "Crimson Red", hex: "#B3241C" },
      { name: "Ocean Blue", hex: "#1E5FA8" },
      { name: "Forest Green", hex: "#2F6B3A" },
      { name: "Sunflower Yellow", hex: "#E8B923" },
    ],
  },
  {
    id: "PLA+",
    name: "PLA+",
    type: "PLA+",
    pricePerGram: 0.055,
    density: 1.24,
    stockGrams: 9000,
    strength: "HIGH" as const,
    finish: "Semi-Gloss",
    description: "Reinforced PLA blend with improved layer adhesion and impact resistance over standard PLA.",
    colors: [
      { name: "Graphite Grey", hex: "#4A4A4E" },
      { name: "Pearl White", hex: "#F7F5EF" },
      { name: "Burnt Orange", hex: "#C6631B" },
      { name: "Teal", hex: "#1F8A8C" },
    ],
  },
  {
    id: "PETG",
    name: "PETG",
    type: "PETG",
    pricePerGram: 0.06,
    density: 1.27,
    stockGrams: 8000,
    strength: "HIGH" as const,
    finish: "Glossy",
    description: "Durable, semi-flexible, and moisture resistant. Ideal for functional and outdoor parts.",
    colors: [
      { name: "Clear", hex: "#DCEFEF" },
      { name: "Black", hex: "#15161A" },
      { name: "Safety Orange", hex: "#E4581E" },
      { name: "Deep Blue", hex: "#1B3F8C" },
    ],
  },
  {
    id: "ABS",
    name: "ABS",
    type: "ABS",
    pricePerGram: 0.05,
    density: 1.04,
    stockGrams: 7000,
    strength: "HIGH" as const,
    finish: "Matte",
    description: "Tough, heat resistant thermoplastic. Great for mechanical parts and enclosures.",
    colors: [
      { name: "Onyx Black", hex: "#131313" },
      { name: "Bright White", hex: "#F2F2F2" },
      { name: "Signal Red", hex: "#C4231F" },
    ],
  },
  {
    id: "TPU",
    name: "TPU (Flexible)",
    type: "TPU",
    pricePerGram: 0.09,
    density: 1.21,
    stockGrams: 4000,
    strength: "MEDIUM" as const,
    finish: "Rubber-like Flexible",
    description: "Elastic, impact-absorbing filament for phone cases, gaskets, and wearable parts.",
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Translucent", hex: "#E7E7E2" },
      { name: "Neon Green", hex: "#8FD400" },
    ],
  },
  {
    id: "Silk PLA",
    name: "Silk PLA",
    type: "Silk PLA",
    pricePerGram: 0.065,
    density: 1.23,
    stockGrams: 5000,
    strength: "LOW" as const,
    finish: "Silky High-Gloss",
    description: "Metallic, silk-like sheen. Best for display pieces and gifts where finish matters most.",
    colors: [
      { name: "Champagne Gold", hex: "#C9A24B" },
      { name: "Rose Gold", hex: "#B76E79" },
      { name: "Silver", hex: "#C7C9CC" },
      { name: "Midnight Purple", hex: "#4B2E83" },
    ],
  },
  {
    id: "Carbon Fiber PLA",
    name: "Carbon Fiber PLA",
    type: "Carbon Fiber PLA",
    pricePerGram: 0.12,
    density: 1.15,
    stockGrams: 3000,
    strength: "VERY_HIGH" as const,
    finish: "Matte Textured",
    description: "PLA infused with chopped carbon fiber for maximum stiffness and a matte, textured finish.",
    colors: [{ name: "Carbon Black", hex: "#0F0F10" }],
  },
  {
    id: "Wood PLA",
    name: "Wood PLA",
    type: "Wood PLA",
    pricePerGram: 0.08,
    density: 1.15,
    stockGrams: 3500,
    strength: "LOW" as const,
    finish: "Wood Grain (sandable)",
    description: "PLA blended with recycled wood fiber. Can be sanded and stained for a natural wood look.",
    colors: [
      { name: "Natural Oak", hex: "#B98850" },
      { name: "Walnut", hex: "#5A3A29" },
    ],
  },
] as const;

export const PRODUCTS = [
  {
    name: "Geometric Wall Planter",
    slug: "geometric-wall-planter",
    categorySlug: "home-decor",
    description: "A faceted, low-poly planter that mounts flush to any wall. Drainage-ready with a hidden tray.",
    price: 24.99,
    material: "PETG",
    featured: true,
    tags: ["planter", "wall-mounted", "low-poly"],
  },
  {
    name: "Honeycomb Wall Shelf",
    slug: "honeycomb-wall-shelf",
    categorySlug: "home-decor",
    description: "Modular hexagonal shelving units that click together to build the display you want.",
    price: 34.99,
    material: "PLA+",
    tags: ["shelf", "modular", "storage"],
  },
  {
    name: "Modular Dice Tower",
    slug: "modular-dice-tower",
    categorySlug: "gaming",
    description: "A collapsible dice tower with a felt-lined ramp for quiet, fair rolls at the table.",
    price: 29.99,
    compareAtPrice: 36.99,
    material: "PLA",
    featured: true,
    tags: ["tabletop", "dice", "board-games"],
  },
  {
    name: "Controller Wall Mount",
    slug: "controller-wall-mount",
    categorySlug: "gaming",
    description: "A snug-fit wall mount that displays your controller like a trophy while keeping it in reach.",
    price: 18.99,
    material: "PLA+",
    tags: ["controller", "mount", "setup"],
  },
  {
    name: "Dragon Miniature (28mm)",
    slug: "dragon-miniature-28mm",
    categorySlug: "miniatures",
    description: "High-detail resin-quality dragon miniature, pre-supported and scaled for 28mm tabletop play.",
    price: 14.99,
    material: "Detail PLA",
    featured: true,
    tags: ["dnd", "tabletop", "fantasy"],
  },
  {
    name: "Fantasy Terrain Tile Set",
    slug: "fantasy-terrain-tile-set",
    categorySlug: "miniatures",
    description: "A 6-piece modular terrain set — ruins, rubble, and stairs — for building tabletop battle maps.",
    price: 39.99,
    material: "PLA",
    tags: ["terrain", "tabletop", "modular"],
  },
  {
    name: "Articulated Robot Figure",
    slug: "articulated-robot-figure",
    categorySlug: "figures",
    description: "A fully posable robot figure printed in place — no assembly, ball-jointed at every limb.",
    price: 27.99,
    material: "PETG",
    tags: ["print-in-place", "articulated", "collectible"],
  },
  {
    name: "Custom Bust Figure",
    slug: "custom-bust-figure",
    categorySlug: "figures",
    description: "A stylized display bust, sculpted for crisp detail at 150mm scale. Great gift piece.",
    price: 44.99,
    material: "Silk PLA",
    featured: true,
    tags: ["bust", "display", "collectible"],
  },
  {
    name: "Desktop Cable Organizer",
    slug: "desktop-cable-organizer",
    categorySlug: "organizers",
    description: "A weighted cable clip tray that keeps charging cables tidy and within reach on your desk.",
    price: 12.99,
    material: "PLA",
    tags: ["desk", "cable-management"],
  },
  {
    name: "Modular Drawer Divider Set",
    slug: "modular-drawer-divider-set",
    categorySlug: "organizers",
    description: "Interlocking dividers that reconfigure to fit any drawer — no measuring required.",
    price: 19.99,
    material: "PLA+",
    tags: ["drawer", "modular", "storage"],
  },
  {
    name: "Precision Tool Stand",
    slug: "precision-tool-stand",
    categorySlug: "tools",
    description: "A soldering iron and precision-tool stand with a stable, weighted base and cable channel.",
    price: 16.99,
    material: "ABS",
    tags: ["workshop", "stand"],
  },
  {
    name: "Adjustable Phone Stand",
    slug: "adjustable-phone-stand",
    categorySlug: "tools",
    description: "A ratcheting phone stand with 5 viewing angles, printed as a single interlocking piece.",
    price: 9.99,
    material: "PETG",
    featured: true,
    tags: ["phone", "stand", "desk"],
  },
  {
    name: "Universal Hinge Bracket",
    slug: "universal-hinge-bracket",
    categorySlug: "replacement-parts",
    description: "A reinforced replacement hinge bracket, sized to fit common cabinet and enclosure hinges.",
    price: 7.99,
    material: "Carbon Fiber PLA",
    tags: ["hinge", "bracket", "repair"],
  },
  {
    name: "Vacuum Cleaner Wheel Replacement",
    slug: "vacuum-cleaner-wheel-replacement",
    categorySlug: "replacement-parts",
    description: "A drop-in replacement wheel for common upright vacuum models, printed in wear-resistant PETG.",
    price: 6.49,
    material: "PETG",
    tags: ["wheel", "vacuum", "repair"],
  },
  {
    name: "Personalized Nameplate",
    slug: "personalized-nameplate",
    categorySlug: "gifts",
    description: "A custom-engraved desk nameplate in your choice of font, color, and finish.",
    price: 22.99,
    material: "Silk PLA",
    featured: true,
    tags: ["personalized", "desk", "gift"],
  },
  {
    name: "Custom Photo Lithophane",
    slug: "custom-photo-lithophane",
    categorySlug: "gifts",
    description: "Your photo, translated into a backlit 3D relief panel that reveals the image when lit from behind.",
    price: 32.99,
    material: "Standard PLA",
    tags: ["lithophane", "photo", "gift"],
  },
] as const;

export const REVIEW_POOL = [
  { authorName: "Maya R.", rating: 5, comment: "The detail on this is incredible — way better than I expected for the price. Shipped fast too." },
  { authorName: "Daniel K.", rating: 5, comment: "Ordered a custom piece and the quote tool made it painless to know exactly what I'd pay upfront." },
  { authorName: "Priya S.", rating: 4, comment: "Great quality print, very clean layer lines. Packaging could be a touch sturdier but nothing broke." },
  { authorName: "Jordan T.", rating: 5, comment: "This is the third thing I've ordered from BunnyCraft and every single one has been spot on." },
  { authorName: "Ines M.", rating: 5, comment: "Beautiful finish, exactly matched the color swatch shown on site. Will be back for more." },
  { authorName: "Leo F.", rating: 4, comment: "Sturdy and functional, does exactly what I needed. Turnaround was quicker than I expected." },
  { authorName: "Aaliyah P.", rating: 5, comment: "Gifted this to my partner and they loved it — the custom engraving came out crisp." },
  { authorName: "Sam W.", rating: 5, comment: "Print quality is genuinely gallery-level. Worth every penny for a display piece." },
  { authorName: "Chen Y.", rating: 4, comment: "Solid build quality, held up great to daily use on my desk for months now." },
  { authorName: "Grace O.", rating: 5, comment: "The upload-to-order flow is so smooth. Watching the price update live as I tweaked the model was great." },
] as const;
