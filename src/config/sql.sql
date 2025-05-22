-- ===========================================
-- 0. 通用枚举类型
-- ===========================================
CREATE TYPE IF NOT EXISTS goods_nature_enum AS ENUM (
  'contract','multi_contract','partial_contract',
  'warranty','gift','self_purchased','consignment'
);
CREATE TYPE IF NOT EXISTS approval_status_enum AS ENUM ('pending','approved','rejected');
CREATE TYPE IF NOT EXISTS stock_status_enum    AS ENUM ('pending','in_stock','not_applicable');
CREATE TYPE IF NOT EXISTS order_status_enum    AS ENUM (
  'draft','ordered','deposit_received','final_payment_received',
  'pre_delivery_inspection','shipped','delivered','order_closed','cancelled'
);
CREATE TYPE IF NOT EXISTS currency_code_enum   AS ENUM ('AUD','USD','CNY','EUR','GBP');
CREATE TYPE IF NOT EXISTS customer_type_enum   AS ENUM ('retail','wholesale','online');
CREATE TYPE IF NOT EXISTS order_type_enum      AS ENUM ('purchase','sales');

-- 产品主分类枚举（简化后只保留这一级）
CREATE TYPE IF NOT EXISTS product_type_enum AS ENUM (
  'machine',    -- 主机
  'parts',      -- 配件
  'attachment', -- 属具
  'tools',      -- 工具
  'others'      -- 其他
);


-- ===========================================
-- 1. 用户与权限（RBAC）
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL       PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  version       BIGINT       NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY(role_id, permission_id)
);


-- ===========================================
-- 2. 附件表
-- ===========================================
CREATE TABLE IF NOT EXISTS attachments (
  id          SERIAL       PRIMARY KEY,
  file_name   VARCHAR(255) NOT NULL,
  file_type   VARCHAR(100) NOT NULL,
  file_size   INT,
  url         TEXT         NOT NULL,
  uploaded_by INT REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===========================================
-- 3. 门店与客户
-- ===========================================
CREATE TABLE IF NOT EXISTS stores (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  region     VARCHAR(50),
  address    VARCHAR(255),
  manager_id INT REFERENCES users(id),
  version    BIGINT       NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN     NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_stores_manager ON stores(manager_id);

CREATE TABLE IF NOT EXISTS customers (
  id         SERIAL              PRIMARY KEY,
  store_id   INT     REFERENCES stores(id),
  type       customer_type_enum NOT NULL DEFAULT 'retail',
  name       VARCHAR(100)       NOT NULL,
  phone      VARCHAR(20),
  email      VARCHAR(100),
  address    VARCHAR(255),
  version    BIGINT             NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ        NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ        NOT NULL DEFAULT now(),
  is_deleted BOOLEAN            NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id);


-- ===========================================
-- 4. 币种与汇率
-- ===========================================
CREATE TABLE IF NOT EXISTS currency_rates (
  code        currency_code_enum PRIMARY KEY,
  rate_to_aud NUMERIC(14,6)     NOT NULL,
  version     BIGINT            NOT NULL DEFAULT 1,
  updated_at  TIMESTAMPTZ        NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS currency_rate_history (
  id             SERIAL              PRIMARY KEY,
  code           currency_code_enum  NOT NULL,
  rate_to_aud    NUMERIC(14,6)       NOT NULL,
  effective_date DATE                NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crh_code_date ON currency_rate_history(code,effective_date);


-- ===========================================
-- 5. 产品与详情
-- ===========================================
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL           PRIMARY KEY,
  djj_code        VARCHAR(50)      UNIQUE NOT NULL,
  name            VARCHAR(100)     NOT NULL,
  manufacturer    VARCHAR(100),
  model           VARCHAR(100),
  technical_specs JSONB,
  price           NUMERIC(12,2),
  currency        currency_code_enum NOT NULL DEFAULT 'AUD',
  status          order_status_enum  NOT NULL DEFAULT 'draft',
  product_type    product_type_enum  NOT NULL DEFAULT 'others',
  version         BIGINT            NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  is_deleted      BOOLEAN           NOT NULL DEFAULT FALSE
);

-- 存储子类／三级分类／扩展字段等可变信息
CREATE TABLE IF NOT EXISTS product_details (
  id          SERIAL       PRIMARY KEY,
  product_id  INT           NOT NULL UNIQUE
               REFERENCES products(id) ON DELETE CASCADE,
  details     JSONB        NOT NULL DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pd_product ON product_details(product_id);


-- ===========================================
-- 6. 仓库
-- ===========================================
CREATE TABLE IF NOT EXISTS warehouses (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  location    VARCHAR(255),
  version     BIGINT       NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE
);


-- ===========================================
-- 7. 库存与日志
-- ===========================================
CREATE TABLE IF NOT EXISTS inventory (
  id                 SERIAL       PRIMARY KEY,
  product_id         INT          NOT NULL REFERENCES products(id),
  warehouse_id       INT          NOT NULL REFERENCES warehouses(id),
  on_hand            INT          NOT NULL DEFAULT 0,
  reserved_for_order INT          NOT NULL DEFAULT 0,
  version            BIGINT       NOT NULL DEFAULT 1,
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);
CREATE INDEX IF NOT EXISTS idx_inventory_product   ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id           SERIAL       PRIMARY KEY,
  inventory_id INT          NOT NULL REFERENCES inventory(id),
  change_type  VARCHAR(20)  NOT NULL,
  quantity     INT          NOT NULL,
  operator     VARCHAR(50),
  remark       TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invlog_inventory ON inventory_logs(inventory_id);


-- ===========================================
-- 8. 订单与明细
-- ===========================================
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL             PRIMARY KEY,
  order_type   order_type_enum    NOT NULL,
  order_number VARCHAR(50)        UNIQUE NOT NULL,
  store_id     INT     REFERENCES stores(id),
  partner_id   INT     NOT NULL,
  order_date   DATE    NOT NULL,
  status       order_status_enum  NOT NULL DEFAULT 'draft',
  currency     currency_code_enum NOT NULL DEFAULT 'AUD',
  total_amount NUMERIC(14,2),
  version      BIGINT             NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL       PRIMARY KEY,
  order_id   INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT          NOT NULL REFERENCES products(id),
  quantity   INT          NOT NULL,
  unit_price NUMERIC(12,2)
);
CREATE INDEX IF NOT EXISTS idx_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_items_product ON order_items(product_id);


-- ===========================================
-- 9. 发票与付款
-- ===========================================
CREATE TABLE IF NOT EXISTS invoices (
  id             SERIAL       PRIMARY KEY,
  order_id       INT          NOT NULL REFERENCES orders(id),
  invoice_number VARCHAR(50)  UNIQUE NOT NULL,
  issue_date     DATE         NOT NULL,
  total_amount   NUMERIC(14,2)
);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);

CREATE TABLE IF NOT EXISTS payments (
  id       SERIAL       PRIMARY KEY,
  order_id INT          NOT NULL REFERENCES orders(id),
  amount   NUMERIC(12,2) NOT NULL,
  paid_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);


-- ===========================================
-- 10. PD 检查 & 发货
-- ===========================================
CREATE TABLE IF NOT EXISTS pd_inspections (
  id         SERIAL       PRIMARY KEY,
  order_id   INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  passed     BOOLEAN      NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
  id         SERIAL       PRIMARY KEY,
  order_id   INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipped_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- ===========================================
-- 11. 客户活动、提醒、审批日志
-- ===========================================
CREATE TABLE IF NOT EXISTS customer_activities (
  id            SERIAL       PRIMARY KEY,
  customer_id   INT          NOT NULL REFERENCES customers(id),
  activity_type VARCHAR(50),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reminders (
  id         SERIAL       PRIMARY KEY,
  ref_type   VARCHAR(20),
  ref_id     INT,
  remind_at  TIMESTAMPTZ  NOT NULL,
  message    TEXT
);

CREATE TABLE IF NOT EXISTS approval_logs (
  id         SERIAL       PRIMARY KEY,
  ref_type   VARCHAR(20),
  ref_id     INT,
  result     VARCHAR(20),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- ===========================================
-- 12. 报价申请与报价单
-- ===========================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id           SERIAL       PRIMARY KEY,
  store_id     INT           REFERENCES stores(id),
  quote_date   DATE          NOT NULL,
  total_amount NUMERIC(14,2)
);

CREATE TABLE IF NOT EXISTS quote_lists (
  id               SERIAL       PRIMARY KEY,
  quote_request_id INT          REFERENCES quote_requests(id),
  list_date        DATE,
  total_amount     NUMERIC(14,2)
);


-- ===========================================
-- 13. 统一审计历史表
-- ===========================================
CREATE TYPE IF NOT EXISTS audited_table_enum AS ENUM (
  'inventory','orders','quote_requests','quote_lists'
);

CREATE TABLE IF NOT EXISTS audited_history (
  history_id BIGSERIAL            PRIMARY KEY,
  table_name audited_table_enum   NOT NULL,
  record_id  INT                  NOT NULL,
  store_id   INT,
  changed_by INT                  NOT NULL REFERENCES users(id),
  operation  VARCHAR(10)          NOT NULL,
  payload    JSONB                NOT NULL,
  changed_at TIMESTAMPTZ          NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audhist_tbl   ON audited_history(table_name);
CREATE INDEX IF NOT EXISTS idx_audhist_store ON audited_history(store_id);
CREATE INDEX IF NOT EXISTS idx_audhist_user  ON audited_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_audhist_time  ON audited_history(changed_at);


-- ===========================================
-- 14. 通用审计触发函数 & 触发器
-- ===========================================
CREATE OR REPLACE FUNCTION fn_audit_generic()
RETURNS TRIGGER AS $$
DECLARE
  rec_json JSONB;
  sid      INT;
  uid      INT := current_setting('app.current_user_id')::INT;
BEGIN
  rec_json := to_jsonb(OLD);
  BEGIN
    sid := OLD.store_id;
  EXCEPTION WHEN undefined_column THEN
    sid := NULL;
  END;
  INSERT INTO audited_history(
    table_name, record_id, store_id,
    changed_by,  operation,  payload,  changed_at
  ) VALUES (
    TG_TABLE_NAME::audited_table_enum,
    OLD.id,
    sid,
    uid,
    TG_OP,
    rec_json,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_audit ON inventory;
CREATE TRIGGER trg_inventory_audit
  BEFORE UPDATE OR DELETE ON inventory
  FOR EACH ROW EXECUTE FUNCTION fn_audit_generic();

DROP TRIGGER IF EXISTS trg_orders_audit ON orders;
CREATE TRIGGER trg_orders_audit
  BEFORE UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_audit_generic();

DROP TRIGGER IF EXISTS trg_qr_audit ON quote_requests;
CREATE TRIGGER trg_qr_audit
  BEFORE UPDATE OR DELETE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION fn_audit_generic();

DROP TRIGGER IF EXISTS trg_ql_audit ON quote_lists;
CREATE TRIGGER trg_ql_audit
  BEFORE UPDATE OR DELETE ON quote_lists
  FOR EACH ROW EXECUTE FUNCTION fn_audit_generic();


-- ===========================================
-- 15. 回滚示例函数
-- ===========================================
CREATE OR REPLACE FUNCTION fn_rollback_audit(
  p_table audited_table_enum,
  p_store INT,
  p_user  INT,
  p_to_ts TIMESTAMPTZ
) RETURNS VOID AS $$
DECLARE
  rec  audited_history%ROWTYPE;
  cols TEXT;
BEGIN
  SELECT * INTO rec
    FROM audited_history
   WHERE table_name = p_table
     AND (p_store IS NULL OR store_id = p_store)
     AND changed_by = p_user
     AND changed_at <= p_to_ts
   ORDER BY changed_at DESC
   LIMIT 1;

  IF NOT FOUND THEN
    RAISE NOTICE 'No audit record found';
    RETURN;
  END IF;

  SELECT string_agg(format('%I = %L', key, value), ', ')
    INTO cols
    FROM jsonb_each_text(rec.payload)
   WHERE key <> 'id';

  EXECUTE format('UPDATE %I SET %s WHERE id = %L',
    rec.table_name, cols, rec.record_id);

  RAISE NOTICE 'Rolled back % to % at %', rec.table_name, rec.record_id, rec.changed_at;
END;
$$ LANGUAGE plpgsql;
