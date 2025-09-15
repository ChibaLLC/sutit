# Quick Start Guide - Sutit Forms

Get your form builder up and running in 5 minutes!

## 1. Setup (One Time)

```bash
# Install dependencies
pnpm install

# Copy simple environment file
cp .env.simple .env

# Edit .env and change:
# - DATABASE_URL to your PostgreSQL connection
# - JWT_SECRET to a random string

# Create database tables
pnpm drizzle-kit push
```

## 2. Start Development

```bash
pnpm dev
```

Visit http://localhost:3000

## 3. Create Your First Form

### Option A: Using the API (Quick Test)

```bash
# 1. Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User"
  }'

# Save the token from response

# 2. Create a simple form
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Contact Form",
    "description": "Get in touch with us",
    "isPublic": true,
    "sections": [{
      "title": "Your Information",
      "orderIndex": 0,
      "fields": [
        {
          "fieldType": "text",
          "label": "Name",
          "name": "name",
          "required": true,
          "orderIndex": 0
        },
        {
          "fieldType": "email",
          "label": "Email",
          "name": "email",
          "required": true,
          "orderIndex": 1
        },
        {
          "fieldType": "textarea",
          "label": "Message",
          "name": "message",
          "required": true,
          "orderIndex": 2
        }
      ]
    }]
  }'
```

### Option B: Direct Database (Even Quicker)

```sql
-- Connect to your database and run:

-- Create a test organization
INSERT INTO organizations (name, slug, plan_type)
VALUES ('Test Org', 'test-org', 'free');

-- Create a test user
INSERT INTO users (email, name, password_hash, status, organization_id)
VALUES (
  'admin@example.com',
  'Admin',
  '$2b$10$YourHashedPasswordHere', -- Use bcrypt to hash
  'active',
  (SELECT id FROM organizations WHERE slug = 'test-org')
);

-- Create a simple form
INSERT INTO forms (
  title,
  slug,
  description,
  organization_id,
  created_by,
  is_public,
  status
) VALUES (
  'Contact Form',
  'contact-form',
  'Get in touch',
  (SELECT id FROM organizations WHERE slug = 'test-org'),
  (SELECT id FROM users WHERE email = 'admin@example.com'),
  true,
  'published'
);
```

## 4. View Your Form

Public form URL: `http://localhost:3000/api/public/forms/contact-form`

## 5. Submit to Your Form

```bash
curl -X POST http://localhost:3000/api/public/forms/contact-form/submit \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello, this is a test!"
    }
  }'
```

## Simple Examples

### Create an Event Registration Form

```json
{
  "title": "Workshop Registration",
  "isPublic": true,
  "sections": [{
    "title": "Register",
    "orderIndex": 0,
    "fields": [
      {
        "fieldType": "text",
        "label": "Full Name",
        "name": "fullName",
        "required": true,
        "orderIndex": 0
      },
      {
        "fieldType": "email",
        "label": "Email",
        "name": "email",
        "required": true,
        "orderIndex": 1
      },
      {
        "fieldType": "select",
        "label": "Workshop",
        "name": "workshop",
        "required": true,
        "orderIndex": 2,
        "properties": {
          "options": [
            {"value": "web", "label": "Web Development"},
            {"value": "mobile", "label": "Mobile Apps"},
            {"value": "ai", "label": "AI & ML"}
          ]
        }
      }
    ]
  }]
}
```

### Create a Payment Form

```json
{
  "title": "Product Order",
  "isPublic": true,
  "sections": [{
    "title": "Order Details",
    "orderIndex": 0,
    "fields": [
      {
        "fieldType": "text",
        "label": "Name",
        "name": "name",
        "required": true,
        "orderIndex": 0
      },
      {
        "fieldType": "select",
        "label": "Product",
        "name": "product",
        "required": true,
        "orderIndex": 1,
        "properties": {
          "options": [
            {"value": "basic", "label": "Basic Plan - $10"},
            {"value": "pro", "label": "Pro Plan - $30"}
          ]
        }
      }
    ]
  }],
  "paymentConfig": {
    "enabled": true,
    "paymentType": "variable",
    "currency": "USD"
  }
}
```

## Tips for Simplicity

1. **Start Small**: Create a basic contact form first
2. **Use Defaults**: Most settings have sensible defaults
3. **Skip Optional Features**: You don't need payments, events, or workflows to start
4. **Public Forms**: Set `isPublic: true` to skip authentication
5. **Test Mode**: Payments work in test mode by default

## Common Field Types

- `text` - Simple text input
- `email` - Email with validation
- `textarea` - Multi-line text
- `number` - Numbers only
- `select` - Dropdown menu
- `checkbox` - Yes/no choice
- `date` - Date picker
- `file` - File upload

## Need Help?

- Check `BACKEND_DOCS.md` for detailed API documentation
- Database schema is in `server/db/schema/form.ts`
- API routes are in `server/api/`

## Production Checklist

Before going live:

1. ✅ Change `JWT_SECRET` to a secure random string
2. ✅ Use a proper PostgreSQL database
3. ✅ Set `NODE_ENV=production`
4. ✅ Configure real payment keys (if using payments)
5. ✅ Set up email (if sending notifications)

That's it! You now have a working form builder. 🎉
