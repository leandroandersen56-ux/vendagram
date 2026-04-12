
-- Tabela de clientes externos
CREATE TABLE public.external_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  country TEXT,
  ip_address TEXT,
  external_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.external_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage external_customers"
  ON public.external_customers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Tabela de pedidos externos
CREATE TABLE public.external_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.external_customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  platform_fee NUMERIC DEFAULT 0,
  commission NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  raw_data JSONB DEFAULT '{}'::jsonb,
  ordered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.external_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage external_orders"
  ON public.external_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_external_orders_status ON public.external_orders(status);
CREATE INDEX idx_external_orders_ordered_at ON public.external_orders(ordered_at);

-- Tabela de itens dos pedidos
CREATE TABLE public.external_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.external_orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  external_product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.external_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage external_order_items"
  ON public.external_order_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_external_orders_updated_at
  BEFORE UPDATE ON public.external_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_customers_updated_at
  BEFORE UPDATE ON public.external_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
