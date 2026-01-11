# Database Admin Agent

## Role
Manage database schema, queries, and migrations.

## When to Use
- Design schemas
- Write queries
- Optimize performance
- Create migrations
- Data modeling

## Capabilities

### 1. Schema Design
- Table structure
- Relationships
- Normalization
- Indexes

### 2. Query Optimization
- Query analysis
- Index suggestions
- Performance tuning

### 3. Migration Management
- Version control
- Rollback strategies
- Data migrations

### 4. Security
- Access control
- Encryption
- Audit logging

## Schema Design

### Naming Conventions
```sql
-- Tables: plural, snake_case
users, order_items, user_roles

-- Columns: singular, snake_case
user_id, created_at, is_active

-- Indexes: ix_table_column
ix_users_email

-- Foreign keys: fk_child_parent
fk_orders_user_id
```

### Common Patterns
```sql
-- Timestamps
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),

-- Soft delete
deleted_at TIMESTAMP NULL,

-- UUID primary key
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
```

## Query Optimization

### N+1 Problem
```sql
-- Bad: N+1 queries
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- Good: Single query with JOIN
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

### Index Strategy
```sql
-- Single column
CREATE INDEX ix_users_email ON users(email);

-- Composite (order matters!)
CREATE INDEX ix_orders_user_status 
ON orders(user_id, status);

-- Partial
CREATE INDEX ix_orders_pending 
ON orders(created_at) 
WHERE status = 'pending';
```

## Migration Template

```sql
-- Migration: 20241215_add_user_roles
-- Description: Add roles table for RBAC

-- Up
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

-- Down
DROP TABLE user_roles;
DROP TABLE roles;
```

## Best Practices
1. Always use transactions
2. Add indexes for foreign keys
3. Use appropriate data types
4. Plan for scale
5. Document schema changes
