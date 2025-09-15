# Sutit Backend - Google Forms Alternative with Payments

A comprehensive form builder and submission system with integrated payment processing, event management, and ticketing capabilities.

## Features

### Core Functionality
- **Form Builder**: Create dynamic forms with multiple sections and field types
- **Version Control**: Track form versions and changes
- **Submission Management**: Handle form submissions with validation
- **Registration System**: Support for single, recurring, and group registrations
- **Payment Processing**: Integrated payment gateway support with installments
- **Event Management**: Create and manage events with capacity control
- **Ticketing System**: Automatic ticket generation from form submissions
- **Workflow Engine**: Automate actions based on form submissions
- **Analytics**: Track form performance and submission statistics
- **Multi-tenancy**: Organization-based isolation

### Security Features
- JWT-based authentication
- Magic link authentication
- OAuth support (Google, Microsoft, GitHub, etc.)
- Session management
- Rate limiting
- Audit logging

## Tech Stack

- **Framework**: Nuxt 3 / Nitro
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT + OAuth + Magic Links
- **Payment Gateways**: Stripe, PayPal, M-Pesa (ready for integration)
- **Validation**: Zod schemas

## Database Setup

1. Create a PostgreSQL database
2. Update `.env` file with database credentials:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sutit
JWT_SECRET=your-secret-key-here
APP_URL=http://localhost:3000
```

3. Run migrations:
```bash
pnpm drizzle-kit push
```

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "organizationName": "My Company"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Forms

#### Create Form
```http
POST /api/forms
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Event Registration Form",
  "description": "Register for our annual conference",
  "isPublic": true,
  "requiresLogin": false,
  "allowMultipleSubmissions": false,
  "sections": [
    {
      "title": "Personal Information",
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
          "label": "Email Address",
          "name": "email",
          "required": true,
          "orderIndex": 1
        },
        {
          "fieldType": "phone",
          "label": "Phone Number",
          "name": "phone",
          "required": false,
          "orderIndex": 2
        }
      ]
    },
    {
      "title": "Ticket Selection",
      "orderIndex": 1,
      "fields": [
        {
          "fieldType": "select",
          "label": "Ticket Type",
          "name": "ticketType",
          "required": true,
          "orderIndex": 0,
          "properties": {
            "options": [
              { "value": "standard", "label": "Standard - $50" },
              { "value": "vip", "label": "VIP - $150" },
              { "value": "premium", "label": "Premium - $250" }
            ]
          }
        }
      ]
    }
  ],
  "paymentConfig": {
    "enabled": true,
    "paymentType": "variable",
    "currency": "USD",
    "allowPartialPayment": true,
    "allowDeferredPayment": true,
    "deferredPaymentDays": 7
  },
  "eventConfig": {
    "title": "Annual Tech Conference 2024",
    "description": "Join us for the biggest tech event of the year",
    "eventDate": "2024-06-15T09:00:00Z",
    "endDate": "2024-06-17T18:00:00Z",
    "location": {
      "venue": "Convention Center",
      "address": "123 Main St, City",
      "coordinates": { "lat": 40.7128, "lng": -74.0060 }
    },
    "capacity": 500,
    "waitlistEnabled": true
  }
}
```

#### Submit Form
```http
POST /api/forms/{formId}/submit
Content-Type: application/json

{
  "formVersionId": "version-uuid",
  "registrationCode": "REG-ABC123XYZ",
  "responses": [
    {
      "fieldId": "field-uuid-1",
      "value": "John Doe"
    },
    {
      "fieldId": "field-uuid-2",
      "value": "john@example.com"
    },
    {
      "fieldId": "field-uuid-3",
      "value": "+1234567890"
    },
    {
      "fieldId": "field-uuid-4",
      "value": "vip"
    }
  ],
  "paymentData": {
    "amount": 150,
    "paymentMethod": "stripe",
    "installments": [
      {
        "amount": 75,
        "dueDate": "2024-05-01T00:00:00Z"
      },
      {
        "amount": 75,
        "dueDate": "2024-06-01T00:00:00Z"
      }
    ]
  }
}
```

## Field Types Supported

- `text` - Single line text input
- `textarea` - Multi-line text input
- `number` - Numeric input
- `email` - Email address input
- `phone` - Phone number input
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time picker
- `select` - Dropdown selection
- `multiselect` - Multiple selection
- `radio` - Radio button group
- `checkbox` - Checkbox input
- `file` - File upload
- `image` - Image upload
- `signature` - Digital signature
- `rating` - Star rating
- `scale` - Linear scale
- `matrix` - Matrix/grid questions
- `section` - Section divider
- `payment` - Payment field
- `hidden` - Hidden field
- `calculated` - Calculated/formula field

## Payment Integration

### Supported Gateways (Ready for Integration)
- Stripe
- PayPal
- M-Pesa (via Daraja API)

### Payment Features
- One-time payments
- Installment plans
- Partial payments
- Deferred payments
- Refunds
- Payment tracking
- Tax configuration

## Event Management

### Features
- Event creation linked to forms
- Capacity management
- Waitlist support
- Check-in tracking
- Recurring events
- Event analytics

## Workflow Automation

### Triggers
- Form submission
- Payment completion
- Registration approval
- Event capacity reached

### Actions (To be implemented)
- Send email notifications
- Create tickets
- Update user records
- Trigger webhooks
- Generate reports

## Performance Optimizations

1. **Database Indexes**: All foreign keys and frequently queried fields are indexed
2. **Caching**: In-memory caching for frequently accessed data
3. **Rate Limiting**: Protection against abuse
4. **Transaction Management**: Atomic operations for data consistency
5. **Pagination**: All list endpoints support pagination

## Security Best Practices

1. **Authentication**: JWT tokens with refresh mechanism
2. **Password Security**: Bcrypt hashing with salt rounds
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection Protection**: Parameterized queries via Drizzle ORM
5. **Rate Limiting**: Per-IP and per-user limits
6. **Audit Logging**: Track all important actions

## Development

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Run Production Server
```bash
pnpm preview
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sutit

# Authentication
JWT_SECRET=your-secret-key-here
APP_URL=http://localhost:3000

# Payment Gateways (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=...

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sutit.com
```

## Testing

### Test Payment
Use `paymentMethod: "test"` in the payment data to simulate successful payments.

### Test Submission
```bash
curl -X POST http://localhost:3000/api/forms/{formId}/submit \
  -H "Content-Type: application/json" \
  -d '{
    "formVersionId": "version-uuid",
    "responses": [
      {"fieldId": "field-1", "value": "Test User"},
      {"fieldId": "field-2", "value": "test@example.com"}
    ]
  }'
```

## Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Railway/Render/Vercel
The application is configured to work with modern deployment platforms. Simply connect your repository and deploy.

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Future Enhancements

- [ ] Real-time form collaboration
- [ ] Advanced workflow builder UI
- [ ] Email template system
- [ ] SMS notifications
- [ ] QR code generation for events
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] File storage with S3/CloudStorage
- [ ] Multi-language support
- [ ] A/B testing for forms
- [ ] Custom branding per organization
- [ ] API rate limit tiers
- [ ] GraphQL API
- [ ] WebSocket support for real-time updates

## Support

For questions or issues, please create an issue in the repository.

## License

MIT
