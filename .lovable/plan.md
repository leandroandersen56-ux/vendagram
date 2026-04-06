
# Plano: Chat de Credenciais Pós-Compra

## Mapeamento para o schema existente
- `orders` → tabela `transactions` (já existe)
- `messages` → tabela `transaction_messages` (já existe)
- Status `transfer_in_progress` → equivale a `awaiting_credentials`
- Novo status necessário: `credentials_sent`

---

## Fase 1 — Banco de Dados (Migration)
- Adicionar colunas em `transaction_messages`: `is_system`, `allow_sensitive_data`, `read_at`
- Adicionar enum value `credentials_sent` ao `transaction_status`
- Habilitar Realtime para `transaction_messages` (se não estiver)

## Fase 2 — Webhook Mercado Pago
- Após pagamento confirmado, inserir mensagem de sistema no chat
- Criar notificações para comprador e vendedor
- Enviar email ao vendedor via Edge Function `send-email`

## Fase 3 — Componente TransactionChat
- Atualizar `TransactionChat.tsx` com novo visual (mensagens de sistema, banner vendedor, presença)
- Desativar filtro de content moderation quando `allow_sensitive_data = true`
- Adicionar Realtime presence para status online
- Marcar mensagens como lidas automaticamente

## Fase 4 — Páginas de Transação
- `OrderDetail.tsx` / `TransactionFlow.tsx`: substituir card de credenciais por chat
- Adicionar botão "Confirmar recebimento" após vendedor enviar mensagem
- Seller center: card de ação necessária com link para chat

## Fase 5 — Desativar fluxo antigo
- Ocultar formulário de credenciais e card de dados de acesso
- Manter tabela `credentials` sem dropar
- Remover/ocultar `CredentialsPanel.tsx` do fluxo ativo

## Fase 6 — Notificações e Toasts
- Toast in-app para nova mensagem quando em outra página
- Badge de notificação atualizado via Realtime
