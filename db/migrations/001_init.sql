-- 001_init.sql — initial schema for FreshCart (INR / India)
-- All monetary columns store integer paise (1 INR = 100 paise).
-- Run with: psql $DATABASE_URL < db/migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cart_status AS ENUM ('active', 'converted', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_unit AS ENUM ('kg', 'g', 'piece', 'bunch', 'dozen');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('order_status', 'low_stock', 'promotion', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(30),
  role            user_role NOT NULL DEFAULT 'customer',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url      TEXT,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── refresh_tokens ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ── addresses (default country IN) ─────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(50),
  street      VARCHAR(255) NOT NULL,
  apartment   VARCHAR(100),
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  zip_code    VARCHAR(20) NOT NULL,
  country     VARCHAR(3) NOT NULL DEFAULT 'IN',
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ── categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON categories(is_active, sort_order);

-- ── products (price in paise INR) ──────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(200) NOT NULL,
  slug                  VARCHAR(220) NOT NULL UNIQUE,
  description           TEXT NOT NULL,
  price                 INTEGER NOT NULL,            -- paise (INR)
  compare_at_price      INTEGER,                     -- paise (INR)
  unit                  product_unit NOT NULL DEFAULT 'piece',
  stock_quantity        INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold   INTEGER NOT NULL DEFAULT 10,
  is_organic            BOOLEAN NOT NULL DEFAULT FALSE,
  is_seasonal           BOOLEAN NOT NULL DEFAULT FALSE,
  seasonal_availability VARCHAR(100),
  origin                VARCHAR(100),
  image_urls            JSONB DEFAULT '[]'::jsonb,
  thumbnail_url         TEXT,
  average_rating        DECIMAL(3,2),
  total_reviews         INTEGER NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_organic ON products(is_organic);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);

-- ── product_categories ─────────────────────────────────
CREATE TABLE IF NOT EXISTS product_categories (
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_pc_category ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_pc_product ON product_categories(product_id);

-- ── carts / cart_items ─────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     cart_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_carts_user_status ON carts(user_id, status);

CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,           -- paise (INR)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cart_items_cart_product UNIQUE (cart_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ── orders / order_items ───────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        VARCHAR(30) NOT NULL UNIQUE,
  user_id             UUID NOT NULL REFERENCES users(id),
  address_id          UUID NOT NULL REFERENCES addresses(id),
  status              order_status NOT NULL DEFAULT 'pending',
  subtotal            INTEGER NOT NULL,           -- paise
  delivery_fee        INTEGER NOT NULL DEFAULT 0, -- paise
  tax                 INTEGER NOT NULL DEFAULT 0, -- paise (GST)
  total_amount        INTEGER NOT NULL,           -- paise
  notes               TEXT,
  delivery_preference VARCHAR(100),
  payment_intent_id   VARCHAR(255),
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  confirmed_at        TIMESTAMPTZ,
  packed_at           TIMESTAMPTZ,
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(200) NOT NULL,
  quantity     INTEGER NOT NULL,
  unit_price   INTEGER NOT NULL,   -- paise
  total_price  INTEGER NOT NULL,   -- paise
  unit         product_unit NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ── reviews ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating                INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title                 VARCHAR(200),
  comment               TEXT,
  is_verified_purchase  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_reviews_user_product UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ── notifications ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  data       JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
