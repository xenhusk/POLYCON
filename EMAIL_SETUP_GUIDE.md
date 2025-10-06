# Email Setup Guide for Production

## Problem
Your production server on Render is experiencing SMTP timeout issues when trying to send emails through Gmail's SMTP servers. This is because Render blocks outbound SMTP connections on ports 25, 587, and 465 to prevent spam and abuse.

## Solution
I've implemented a unified email service that automatically uses:
- **SendGrid API** for production (Render hosting)
- **SMTP** for local development

## Setup Instructions

### 1. Create a SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your account

### 2. Get Your SendGrid API Key
1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Give it a name like "POLYCON Production"
5. Under **Mail Send**, select **Full Access**
6. Click **Create & View**
7. **Copy the API key** (you won't see it again!)

### 3. Configure Render Environment Variables
1. Go to your Render dashboard
2. Select your `polycon-backend` service
3. Go to **Environment** tab
4. Add these environment variables:

```
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@polycon.com
FROM_NAME=POLYCON
```

### 4. Verify Domain (Optional but Recommended)
1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. This improves email deliverability

### 5. Deploy Your Changes
1. Commit and push your changes to your repository
2. Render will automatically redeploy
3. Test email functionality

## How It Works

The new system automatically detects the environment:

- **Production (Render)**: Uses SendGrid API when `SENDGRID_API_KEY` is set
- **Local Development**: Falls back to SMTP when SendGrid key is not available

## Files Modified

1. **`backend/services/sendgrid_email_service.py`** - New SendGrid service
2. **`backend/services/email_service_unified.py`** - Unified service that chooses the right method
3. **`backend/routes/account_routes.py`** - Updated to use unified service
4. **`backend/routes/auth_routes.py`** - Updated to use unified service
5. **`backend/requirements.txt`** - Added `requests` library
6. **`render.yaml`** - Added SendGrid environment variables

## Testing

### Local Testing
Your local environment will continue to work with SMTP as before.

### Production Testing
1. Try signing up a new user
2. Check the logs for successful email sending
3. Verify the email arrives in the inbox

## Troubleshooting

### If emails still don't work:
1. Check Render logs for SendGrid API errors
2. Verify your SendGrid API key is correct
3. Check SendGrid dashboard for delivery statistics
4. Ensure your SendGrid account is verified

### Common Issues:
- **401 Unauthorized**: Check your API key
- **403 Forbidden**: Check your SendGrid account status
- **422 Unprocessable Entity**: Check email format and content

## Alternative Solutions

If SendGrid doesn't work for you, other options include:
- **Mailgun** (similar API-based approach)
- **Postmark** (transactional email focused)
- **Amazon SES** (AWS-based)

## Cost
- SendGrid free tier: 100 emails/day
- For higher volumes, paid plans start at $14.95/month

## Security Notes
- Never commit your SendGrid API key to version control
- Use environment variables for all sensitive data
- Consider rotating API keys periodically
