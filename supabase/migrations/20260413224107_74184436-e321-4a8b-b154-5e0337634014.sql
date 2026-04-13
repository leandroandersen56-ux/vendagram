
DELETE FROM reviews WHERE transaction_id::text LIKE 'aaaaaaaa-%' OR transaction_id::text LIKE 'dddddddd-%';
DELETE FROM credentials WHERE transaction_id::text LIKE 'aaaaaaaa-%' OR transaction_id::text LIKE 'dddddddd-%';
DELETE FROM transaction_messages WHERE transaction_id::text LIKE 'aaaaaaaa-%' OR transaction_id::text LIKE 'dddddddd-%';
DELETE FROM transaction_steps WHERE transaction_id::text LIKE 'aaaaaaaa-%' OR transaction_id::text LIKE 'dddddddd-%';
DELETE FROM disputes WHERE transaction_id::text LIKE 'aaaaaaaa-%' OR transaction_id::text LIKE 'dddddddd-%';
DELETE FROM transactions WHERE id::text LIKE 'aaaaaaaa-%' OR id::text LIKE 'dddddddd-%';
