
## Plano de Implementação — Froiv para Produção

### 🔴 FASE 1 — Fluxo de Dinheiro (Prioridade Máxima)

**1.1 Edge Function `release-escrow`**
- Verificar buyer, calcular fee 10%, atualizar wallets/transactions/notifications
- Botão "Confirmar recebimento" na OrderDetail com bottom sheet de confirmação

**1.2 Disputas completas**  
- Migration: adicionar campos `admin_notes`, `resolution`, `resolved_by`, `resolved_at` na tabela disputes
- UI do comprador: bottom sheet com motivo + textarea + upload screenshot
- Admin: tela de resolução com reembolso/liberação

**1.3 Processamento de Saques**
- Melhorar WithdrawModal com tipo de chave Pix e validações
- Edge Function `process-withdrawal` (admin processa manualmente por ora)

---

### 🟡 FASE 2 — Core Features

**2.1 Entrega de Credenciais criptografadas**
- Edge Function para criptografar/descriptografar com AES-256
- Vendedor envia credenciais → comprador visualiza com botão copiar
- Timer de 72h para auto-release

**2.2 Chat da Transação (Realtime)**
- Usar tabela `transaction_messages` existente + Supabase Realtime
- Componente de chat na OrderDetail

**2.3 Busca Full-Text + Filtros**
- Migration: coluna `search_vector` tsvector
- SearchResultsPage com filtros por plataforma/preço/rating

**2.4 Upload de Screenshots**
- Bucket `listings` já existe (público)
- Componente de upload com preview e compressão

---

### 🟢 FASE 3 — Experiência do Usuário

- Perfil público do vendedor (`/perfil/:username`)
- Avaliações funcionais conectadas ao DB
- Histórico de visualizações
- Programa de afiliados funcional
- Ofertas/destaques do dia

---

### 🔵 FASE 4 — Segurança e Admin

- Dashboard admin completo com KPIs e gráficos
- 2FA com Supabase MFA
- Verificação de email obrigatória
- Header desktop com dropdown de perfil completo

---

### ⚡ Abordagem
Implemento fase por fase, começando pela **Fase 1** (fluxo de dinheiro) que é crítica para o negócio funcionar. Cada fase será entregue em 1-2 mensagens com migrations + edge functions + frontend.

Preciso adicionar o secret `CREDENTIALS_SECRET` antes da Fase 2.
