import coverFreefire from "@/assets/covers/cover-freefire.jpg";
import coverInstagram from "@/assets/covers/cover-instagram.jpg";
import coverTiktok from "@/assets/covers/cover-tiktok.jpg";
import coverValorant from "@/assets/covers/cover-valorant.jpg";
import coverYoutube from "@/assets/covers/cover-youtube.jpg";
import coverFacebook from "@/assets/covers/cover-facebook.jpg";
import coverRoblox from "@/assets/covers/cover-roblox.jpg";
import coverFortnite from "@/assets/covers/cover-fortnite.jpg";

import ssFreefire from "@/assets/screenshots/screenshot-freefire.jpg";
import ssInstagram from "@/assets/screenshots/screenshot-instagram.jpg";
import ssTiktok from "@/assets/screenshots/screenshot-tiktok.jpg";
import ssValorant from "@/assets/screenshots/screenshot-valorant.jpg";
import ssYoutube from "@/assets/screenshots/screenshot-youtube.jpg";
import ssFacebook from "@/assets/screenshots/screenshot-facebook.jpg";
import ssRoblox from "@/assets/screenshots/screenshot-roblox.jpg";
import ssFortnite from "@/assets/screenshots/screenshot-fortnite.jpg";

export const PLATFORM_COVERS: Record<string, string> = {
  free_fire: coverFreefire,
  instagram: coverInstagram,
  tiktok: coverTiktok,
  valorant: coverValorant,
  youtube: coverYoutube,
  facebook: coverFacebook,
  roblox: coverRoblox,
  fortnite: coverFortnite,
};

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerSales: number;
  platform: string;
  title: string;
  description: string;
  price: number;
  status: 'active' | 'sold' | 'paused' | 'removed';
  screenshots: string[];
  fields: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  status: 'pending_payment' | 'credentials_pending' | 'transfer_in_progress' | 'completed' | 'disputed' | 'cancelled' | 'refunded';
  createdAt: string;
  listing?: Listing;
}

export interface TransactionStep {
  id: string;
  transactionId: string;
  stepIndex: number;
  stepLabel: string;
  confirmedAt: string | null;
  problemReported: boolean;
}

export const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C' },
  { id: 'tiktok', name: 'TikTok', color: '#00F2EA' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'free_fire', name: 'Free Fire', color: '#FF6B35' },
  { id: 'valorant', name: 'Valorant', color: '#FF4655' },
  { id: 'fortnite', name: 'Fortnite', color: '#9D4DBB' },
  { id: 'roblox', name: 'Roblox', color: '#E2231A' },
  { id: 'clash_royale', name: 'Clash Royale', color: '#F5C518' },
  { id: 'other', name: 'Outros', color: '#7C3AED' },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    sellerId: 'u1',
    sellerName: 'GameMaster99',
    sellerRating: 4.9,
    sellerSales: 23,
    platform: 'free_fire',
    title: 'Conta Free Fire Nível 75 - Full Skin',
    description: 'Conta com todas as skins raras, incluindo Angelical e Lendárias. Level 75, mais de 200 diamantes. Rank Heroico.',
    price: 350,
    status: 'active',
    screenshots: [ssFreefire],
    fields: { 'Nível': 75, 'Diamantes': 200, 'Skins': 45, 'Rank': 'Heroico', 'Facebook Vinculado': true },
    createdAt: '2024-03-20',
  },
  {
    id: '2',
    sellerId: 'u2',
    sellerName: 'SocialSeller',
    sellerRating: 4.7,
    sellerSales: 12,
    platform: 'instagram',
    title: 'Conta Instagram 50K Seguidores - Nicho Fitness',
    description: 'Conta com 50 mil seguidores reais, engajamento de 3.5%. Nicho fitness com conteúdo de alta qualidade.',
    price: 1200,
    status: 'active',
    screenshots: [ssInstagram],
    fields: { 'Seguidores': '50K', 'Engajamento': '3.5%', 'Nicho': 'Fitness', 'Verificada': false },
    createdAt: '2024-03-19',
  },
  {
    id: '3',
    sellerId: 'u3',
    sellerName: 'TikTokPro',
    sellerRating: 5.0,
    sellerSales: 8,
    platform: 'tiktok',
    title: 'TikTok 100K Seguidores - Nicho Humor',
    description: 'Conta de humor com 100K seguidores, vários vídeos virais com milhões de views.',
    price: 2500,
    status: 'active',
    screenshots: [ssTiktok],
    fields: { 'Seguidores': '100K', 'Likes Totais': '2.5M', 'Nicho': 'Humor', 'Verificada': true },
    createdAt: '2024-03-18',
  },
  {
    id: '4',
    sellerId: 'u4',
    sellerName: 'ValPlayer',
    sellerRating: 4.3,
    sellerSales: 5,
    platform: 'valorant',
    title: 'Conta Valorant Imortal 3 - 50+ Skins',
    description: 'Conta Imortal 3 com mais de 50 skins de armas, incluindo Knife Reaver e Vandal Prime.',
    price: 800,
    status: 'active',
    screenshots: [ssValorant],
    fields: { 'Rank': 'Imortal 3', 'Skins': 50, 'Agentes Desbloqueados': 'Todos' },
    createdAt: '2024-03-17',
  },
  {
    id: '5',
    sellerId: 'u1',
    sellerName: 'GameMaster99',
    sellerRating: 4.6,
    sellerSales: 23,
    platform: 'youtube',
    title: 'Canal YouTube 10K Inscritos - Monetizado',
    description: 'Canal monetizado com 10K inscritos e mais de 500K views totais. Nicho de tecnologia.',
    price: 3000,
    status: 'active',
    screenshots: [ssYoutube],
    fields: { 'Inscritos': '10K', 'Views Totais': '500K', 'Monetizado': true, 'Nicho': 'Tecnologia' },
    createdAt: '2024-03-16',
  },
  {
    id: '6',
    sellerId: 'u5',
    sellerName: 'FBTrader',
    sellerRating: 4.1,
    sellerSales: 3,
    platform: 'facebook',
    title: 'Facebook com Marketplace Ativo - 2000 Amigos',
    description: 'Conta Facebook com marketplace ativo, 2000 amigos reais, sem restrições.',
    price: 150,
    status: 'active',
    screenshots: [ssFacebook],
    fields: { 'Amigos': 2000, 'Marketplace Ativo': true, 'Restrições': false },
    createdAt: '2024-03-15',
  },
  {
    id: '7',
    sellerId: 'u6',
    sellerName: 'RobloxKing',
    sellerRating: 4.8,
    sellerSales: 15,
    platform: 'roblox',
    title: 'Conta Roblox Premium - Limiteds Raros',
    description: 'Conta com Roblox Premium ativo, mais de 5000 Robux e diversos limiteds raros.',
    price: 420,
    status: 'active',
    screenshots: [ssRoblox],
    fields: { 'Robux': 5000, 'Limiteds': 12, 'Premium': true },
    createdAt: '2024-03-14',
  },
  {
    id: '8',
    sellerId: 'u7',
    sellerName: 'FortBuilder',
    sellerRating: 4.5,
    sellerSales: 9,
    platform: 'fortnite',
    title: 'Conta Fortnite OG - Renegade Raider',
    description: 'Conta OG Season 1, com Renegade Raider, Black Knight e mais de 200 skins.',
    price: 2800,
    status: 'active',
    screenshots: [ssFortnite],
    fields: { 'Skins': 200, 'Season': 'OG S1', 'V-Bucks': 1500 },
    createdAt: '2024-03-13',
  },
  {
    id: '9',
    sellerId: 'u8',
    sellerName: 'ClashPro',
    sellerRating: 4.4,
    sellerSales: 6,
    platform: 'clash_royale',
    title: 'Conta Clash Royale - Desafiante 3',
    description: 'Conta nível máximo com todas as cartas, troféus acima de 7000.',
    price: 550,
    status: 'active',
    screenshots: [ssInstagram],
    fields: { 'Troféus': 7200, 'Nível': 14, 'Cartas Max': true },
    createdAt: '2024-03-12',
  },
  {
    id: '10',
    sellerId: 'u9',
    sellerName: 'InstaGrowth',
    sellerRating: 4.6,
    sellerSales: 18,
    platform: 'instagram',
    title: 'Instagram 120K - Nicho Moda Feminina',
    description: 'Conta consolidada com 120K seguidores, engajamento alto. Nicho moda feminina com parcerias ativas.',
    price: 3200,
    status: 'active',
    screenshots: [ssTiktok],
    fields: { 'Seguidores': '120K', 'Engajamento': '4.2%', 'Nicho': 'Moda' },
    createdAt: '2024-03-11',
  },
  {
    id: '11',
    sellerId: 'u10',
    sellerName: 'TikMaster',
    sellerRating: 4.9,
    sellerSales: 11,
    platform: 'tiktok',
    title: 'TikTok 250K - Nicho Dança e Trends',
    description: 'Conta viral com 250K seguidores, vários vídeos acima de 1M de views. Monetização ativa.',
    price: 4500,
    status: 'active',
    screenshots: [],
    fields: { 'Seguidores': '250K', 'Likes': '8M', 'Monetizada': true },
    createdAt: '2024-03-10',
  },
  {
    id: '12',
    sellerId: 'u11',
    sellerName: 'YTCreator',
    sellerRating: 4.7,
    sellerSales: 7,
    platform: 'youtube',
    title: 'Canal YouTube 50K Inscritos - Gaming',
    description: 'Canal de gaming monetizado com 50K inscritos, receita média de R$800/mês.',
    price: 8500,
    status: 'active',
    screenshots: [],
    fields: { 'Inscritos': '50K', 'Views': '2M', 'Monetizado': true },
    createdAt: '2024-03-09',
  },
];

export const SOCIAL_MEDIA_STEPS = [
  'Recebi o login e senha da conta',
  'Consegui fazer login na conta com sucesso',
  'Troquei o endereço de email da conta para o meu email',
  'Confirmei a troca de email no meu email (cliquei no link de verificação)',
  'A conta removeu o email antigo e agora está com meu email',
  'Troquei a senha da conta para uma senha nova',
  'Removi dispositivos anteriores conectados (sessões antigas)',
  'Ativei a autenticação em dois fatores com meu número/app',
  'A conta agora está 100% sob meu controle',
  'CONFIRMO A TRANSFERÊNCIA COMPLETA — Liberar pagamento ao vendedor',
];

export const GAME_STEPS = [
  'Recebi o login e senha da conta',
  'Fiz login no jogo com sucesso',
  'Confirmei que os itens, skins e level estão conforme anunciado',
  'Desvincular conta do Facebook/Google antigo (vendedor faz isso ao vivo)',
  'Vinculei a conta ao meu Facebook/Google',
  'Troquei o email de cadastro para o meu email',
  'Confirmei acesso exclusivo — não consigo mais entrar pelo método antigo',
  'Troquei a senha da conta',
  'CONFIRMO A TRANSFERÊNCIA COMPLETA — Liberar pagamento ao vendedor',
];

export function getPlatformSteps(platform: string): string[] {
  const gameCategories = ['free_fire', 'valorant'];
  return gameCategories.includes(platform) ? GAME_STEPS : SOCIAL_MEDIA_STEPS;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function getPlatform(id: string) {
  return PLATFORMS.find(p => p.id === id) || PLATFORMS[PLATFORMS.length - 1];
}
