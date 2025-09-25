# Supabase Integration Setup Guide

## Overview
This guide will help you connect your SpareSmart inventory management app to Supabase for real-time database functionality.

## Prerequisites
- Node.js installed
- A Supabase account (free at https://supabase.com)

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `sparesmart-inventory`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
6. Click "Create new project"
7. Wait for the project to be set up (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Your Environment

### Option A: Using Environment Variables (Recommended)

1. Create a `.env.local` file in your project root:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Option B: Using Config File

1. Open `src/config/supabase.js`
2. Replace the placeholder values with your actual credentials:
```javascript
export const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-anon-key-here'
}
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the schema

This will create:
- `parts` table for spare parts inventory
- `machines` table for machine management
- `lines` table for production lines
- `checkweighers` table for checkweigher equipment
- Sample data for testing

## Step 5: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open your browser and check the console for any connection errors
3. The app should now be connected to Supabase

## Step 6: Verify Data Loading

1. Check that the inventory data loads from Supabase
2. Test creating, updating, and deleting items
3. Verify that changes persist in the Supabase dashboard

## Database Schema Details

### Parts Table
- **id**: Unique identifier (UUID)
- **name**: Part name
- **part_number**: Unique part number
- **description**: Part description
- **category**: Part category
- **manufacturer**: Manufacturer name
- **supplier**: Supplier name
- **cost**: Purchase cost
- **selling_price**: Selling price
- **stock_quantity**: Current stock level
- **min_stock_level**: Minimum stock threshold
- **max_stock_level**: Maximum stock threshold
- **location**: Storage location
- **status**: Active/inactive status

### Machines Table
- **id**: Unique identifier (UUID)
- **name**: Machine name
- **model**: Machine model
- **manufacturer**: Manufacturer name
- **serial_number**: Unique serial number
- **description**: Machine description
- **status**: Active/inactive status
- **location**: Machine location
- **installation_date**: Installation date
- **last_maintenance**: Last maintenance date
- **next_maintenance**: Next maintenance date

### Lines Table
- **id**: Unique identifier (UUID)
- **name**: Line name
- **description**: Line description
- **status**: Active/inactive status
- **location**: Line location
- **capacity**: Production capacity
- **efficiency**: Efficiency percentage

### Checkweighers Table
- **id**: Unique identifier (UUID)
- **name**: Checkweigher name
- **model**: Model number
- **manufacturer**: Manufacturer name
- **serial_number**: Unique serial number
- **description**: Description
- **status**: Active/inactive status
- **location**: Location
- **accuracy**: Accuracy specification
- **max_weight**: Maximum weight capacity
- **min_weight**: Minimum weight capacity

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Currently set to allow all operations (customize as needed)
- Policies can be modified in Supabase dashboard

### Authentication (Optional)
To add user authentication:
1. Go to **Authentication** → **Settings** in Supabase
2. Configure your preferred auth providers
3. Update the service to handle authentication

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your URL and API key
2. **CORS Error**: Ensure your domain is added to allowed origins
3. **Permission Denied**: Check RLS policies
4. **Data Not Loading**: Verify the schema was created correctly

### Debug Steps

1. Check browser console for errors
2. Verify Supabase project is active
3. Test API calls in Supabase dashboard
4. Check network tab for failed requests

## Next Steps

1. **Customize the schema** based on your specific needs
2. **Set up authentication** if required
3. **Configure RLS policies** for security
4. **Add real-time subscriptions** for live updates
5. **Set up backups** and monitoring

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase/discussions
- Project Issues: Create an issue in your project repository

## Production Deployment

When deploying to production:

1. **Use environment variables** for all sensitive data
2. **Set up proper RLS policies** for security
3. **Configure backups** and monitoring
4. **Test thoroughly** before going live
5. **Set up proper error handling** and logging
