# API Endpoints Test Guide

This document provides curl commands to test the new catalog and order APIs.

## Setup

First, start the development server:
```bash
npm run dev
```

## 1. Test Catalog Endpoints

### Get Drape Types
```bash
curl -X GET http://localhost:3000/api/drape-types \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Get Surgery Types
```bash
curl -X GET http://localhost:3000/api/surgery-types \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Get Surgery Type Defaults (Auto-suggestion)
```bash
# Replace {id} with actual surgery type ID
curl -X GET http://localhost:3000/api/surgery-types/{id}/defaults \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Search Items Catalog
```bash
# Basic search
curl -X GET "http://localhost:3000/api/items?search=drape" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# With pagination
curl -X GET "http://localhost:3000/api/items?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## 2. Test Order Creation

### Create Order (as SUBMITTER)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "drapeTypeId": "YOUR_DRAPE_TYPE_ID",
    "surgeryTypeId": "YOUR_SURGERY_TYPE_ID",
    "customizationNotes": "Test order with specific requirements",
    "items": [
      {
        "itemId": "YOUR_ITEM_ID",
        "itemName": "Large Sterile Drape",
        "quantity": 3
      },
      {
        "itemName": "Custom Item",
        "quantity": 1,
        "notes": "Custom item not in catalog"
      }
    ]
  }'
```

## 3. Test Order Listing with Filters

### Get Orders with Pagination (as FULFILLMENT)
```bash
# Basic listing
curl -X GET "http://localhost:3000/api/orders?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/api/orders?status=PENDING&page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Filter by hospital
curl -X GET "http://localhost:3000/api/orders?hospitalId=YOUR_HOSPITAL_ID&page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Combined filters
curl -X GET "http://localhost:3000/api/orders?status=IN_PROGRESS&hospitalId=YOUR_HOSPITAL_ID&page=1" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## 4. Getting Session Token

To get your session token for testing:

1. Log in to the application at http://localhost:3000/login
2. Open browser DevTools → Application/Storage → Cookies
3. Copy the value of `next-auth.session-token` cookie
4. Use it in the curl commands above

## Test Users

After seeding, you can use these accounts:

**Fulfillment User (for order listing):**
- Email: fulfillment@example.com
- Password: password123

**Submitter Users (for order creation):**
- Email: sarah.connor@generalhospital.org
- Password: password123
- Email: jack.ryan@stmary.org
- Password: password123

## Expected Responses

### Drape Types Response
```json
[
  {
    "id": "...",
    "name": "Standard Orthopedic Pack",
    "description": "Standard drape setup for general orthopedic procedures."
  }
]
```

### Surgery Type Defaults Response
```json
{
  "id": "...",
  "name": "Total Knee Replacement",
  "description": "Comprehensive drape coverage for knee arthroplasty.",
  "defaultDrapeType": {
    "id": "...",
    "name": "Standard Orthopedic Pack",
    "description": "..."
  },
  "defaultItems": [
    {
      "id": "...",
      "name": "Large Sterile Drape",
      "description": "Full coverage sterile field drape.",
      "unit": "each",
      "defaultQuantity": 2
    }
  ]
}
```

### Items Catalog Response
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 7,
    "totalPages": 1
  }
}
```

### Order Creation Response (201 Created)
```json
{
  "id": "...",
  "orderNumber": "...",
  "hospital": "General Hospital",
  "drapeType": "Standard Orthopedic Pack",
  "surgeryType": "Total Knee Replacement",
  "status": "PENDING",
  "customizationNotes": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "completedAt": null,
  "submitter": {
    "id": "...",
    "name": "Sarah Connor",
    "email": "sarah.connor@generalhospital.org"
  },
  "items": [...]
}
```

### Orders List Response
```json
{
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 4,
    "totalPages": 1
  }
}
```
