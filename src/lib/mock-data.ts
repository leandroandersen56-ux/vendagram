import ssFreefire from "@/assets/screenshots/screenshot-freefire.jpg";
import ssInstagram from "@/assets/screenshots/screenshot-instagram.jpg";
import ssTiktok from "@/assets/screenshots/screenshot-tiktok.jpg";
import ssValorant from "@/assets/screenshots/screenshot-valorant.jpg";
import ssYoutube from "@/assets/screenshots/screenshot-youtube.jpg";
import ssFacebook from "@/assets/screenshots/screenshot-facebook.jpg";
import ssRoblox from "@/assets/screenshots/screenshot-roblox.jpg";
import ssFortnite from "@/assets/screenshots/screenshot-fortnite.jpg";
import ssClashRoyale from "@/assets/screenshots/screenshot-clashroyale.jpg";
import ssInstagram2 from "@/assets/screenshots/screenshot-instagram2.jpg";
import ssTiktok2 from "@/assets/screenshots/screenshot-tiktok2.jpg";
import ssYoutube2 from "@/assets/screenshots/screenshot-youtube2.jpg";

export const PLATFORM_COVERS: Record<string, string> = {
  free_fire: ssFreefire,
  instagram: ssInstagram,
  tiktok: ssTiktok,
  valorant: ssValorant,
  youtube: ssYoutube,
  facebook: ssFacebook,
  roblox: ssRoblox,
  fortnite: ssFortnite,
  clash_royale: ssClashRoyale,
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

export const MOCK_LISTINGS: Listing[] = [];

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
