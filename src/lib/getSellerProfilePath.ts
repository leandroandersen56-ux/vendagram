export function getSellerProfilePath(identifier?: string | null) {
  const value = identifier?.trim();
  return value ? `/perfil/${value}` : null;
}
