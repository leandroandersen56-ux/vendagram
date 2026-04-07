ALTER TABLE public.listings ADD COLUMN stock integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.listings.stock IS 'Number of available units. Default 1 for unique items. Items with stock > 1 are replicable.';