export interface TrustedSellerSeed {
  slug: string;
  aliases: string[];
  email: string;
  name: string;
  username: string;
  userId: string;
  avatarUrl: string | null;
  sales: number;
  rating: number;
  bio: string;
  createdAt: string;
}

export const TRUSTED_SELLER_LIST: TrustedSellerSeed[] = [
  {
    slug: "contabanco",
    aliases: ["contabanco", "conta banco", "adm gl", "gl", "beccd2b1-0a31-4fd5-9701-4dce5eaa125c", "contabanco743@gmail.com"],
    email: "contabanco743@gmail.com",
    name: "ADM GL",
    username: "contabanco",
    userId: "beccd2b1-0a31-4fd5-9701-4dce5eaa125c",
    avatarUrl: "https://yzwncktlibdfycqhvlqg.supabase.co/storage/v1/object/public/avatars/beccd2b1-0a31-4fd5-9701-4dce5eaa125c/avatar.png?t=1776120747125",
    sales: 47,
    rating: 4.8,
    bio: "Vendedor verificado da plataforma Froiv.",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    slug: "gb-vendas",
    aliases: ["gb vendas", "gb_vendas", "gb-vendas", "adm gb", "vg", "af11290b-014b-43db-aca1-ed1a12ab1707", "vg786674@gmail.com"],
    email: "vg786674@gmail.com",
    name: "ADM GB",
    username: "gb vendas",
    userId: "af11290b-014b-43db-aca1-ed1a12ab1707",
    avatarUrl: "https://yzwncktlibdfycqhvlqg.supabase.co/storage/v1/object/public/avatars/af11290b-014b-43db-aca1-ed1a12ab1707/avatar.jpeg?t=1776109088807",
    sales: 63,
    rating: 4.8,
    bio: "Vendedor verificado da plataforma Froiv.",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    slug: "eduardo",
    aliases: ["eduardo", "eduardo klunck", "d7f85dfb-0f1d-4c58-9a64-0544ec5b158d", "eduardoklunck95@gmail.com"],
    email: "eduardoklunck95@gmail.com",
    name: "Eduardo Klunck",
    username: "eduardo",
    userId: "d7f85dfb-0f1d-4c58-9a64-0544ec5b158d",
    avatarUrl: null,
    sales: 31,
    rating: 4.8,
    bio: "Vendedor verificado da plataforma Froiv.",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    slug: "theus",
    aliases: ["theus", "theus klunck", "costa", "73740fcc-5a53-4a10-8645-eeb76ec7642b", "costawlc7@gmail.com"],
    email: "costawlc7@gmail.com",
    name: "Theus Klunck",
    username: "theus",
    userId: "73740fcc-5a53-4a10-8645-eeb76ec7642b",
    avatarUrl: "https://yzwncktlibdfycqhvlqg.supabase.co/storage/v1/object/public/avatars/73740fcc-5a53-4a10-8645-eeb76ec7642b/avatar.jpg",
    sales: 42,
    rating: 4.9,
    bio: "Vendedor verificado da plataforma Froiv.",
    createdAt: "2024-11-01T00:00:00Z",
  },
];

export function normalizeTrustedSellerKey(value?: string | null) {
  return decodeURIComponent((value || "").trim())
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const trustedSellerLookup = new Map<string, TrustedSellerSeed>();

for (const seller of TRUSTED_SELLER_LIST) {
  const keys = [seller.slug, seller.email, seller.userId, seller.username, seller.name, ...seller.aliases];

  keys.forEach((key) => {
    const normalized = normalizeTrustedSellerKey(key);
    if (normalized) trustedSellerLookup.set(normalized, seller);
  });
}

export function getTrustedSellerByIdentifier(identifier?: string | null) {
  const normalized = normalizeTrustedSellerKey(identifier);
  return normalized ? trustedSellerLookup.get(normalized) ?? null : null;
}

export function getTrustedSellerByEmail(email?: string | null) {
  return getTrustedSellerByIdentifier(email);
}

export function toTrustedSellerProfile(seller: TrustedSellerSeed) {
  return {
    user_id: seller.userId,
    username: seller.username,
    name: seller.name,
    email: seller.email,
    avatar_url: seller.avatarUrl,
    cover_url: null,
    bio: seller.bio,
    is_verified: true,
    avg_rating: seller.rating,
    total_reviews: 0,
    total_sales: seller.sales,
    total_purchases: 0,
    created_at: seller.createdAt,
    referral_code: null,
  };
}
