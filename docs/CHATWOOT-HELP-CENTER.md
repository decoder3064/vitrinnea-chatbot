# Setting Up Chatwoot Help Center

## Overview

Chatwoot has a built-in Help Center (Knowledge Base) feature that allows you to create articles, FAQs, and documentation directly within the platform. This is better than hosting separate HTML files because:

- ✅ Integrated with your Chatwoot account
- ✅ Easy to edit and update
- ✅ Search functionality built-in
- ✅ Can be embedded in your website
- ✅ Multi-language support
- ✅ Analytics on article views
V
## Step 1: Enable Help Center in Chatwoot

1. **Login to Chatwoot**
   - Go to your Chatwoot dashboard (e.g., http://localhost:3000)

2. **Access Settings**
   - Click on Settings (gear icon) in the sidebar
   - Go to "Account Settings"

3. **Enable Portals**
   - Look for "Portals" or "Help Center" section
   - Click "Create Portal" or "Enable Help Center"

4. **Configure Your Portal**
   - Portal Name: "Vitrinnea Help Center"
   - Domain/Subdomain: Choose your URL
   - Logo: Upload your logo
   - Primary Color: Match your branding

## Step 2: Create Help Center Structure

### Create Categories

1. Go to **Portals** → **Categories**
2. Create these categories:

```
📦 Getting Started
   - How to place your first order
   - Creating an account
   - Understanding our products

🚚 Orders & Shipping
   - Tracking your order
   - Shipping times and methods
   - International shipping

🔄 Returns & Exchanges
   - Return policy
   - How to request a return
   - Refund timeline

💳 Payments & Billing
   - Payment methods
   - Billing issues
   - Requesting invoices

👤 Account Management
   - Updating your profile
   - Changing password
   - Managing addresses

❓ FAQ
   - Common questions
   - Troubleshooting
```

### Create Articles

For each category, create detailed articles. Example article structure:

**Title**: How to Track Your Order

**Content**:
```markdown
# How to Track Your Order

Once your order has shipped, you'll receive a tracking number via email.

## Steps to Track:

1. Check your email for "Order Shipped" notification
2. Click the tracking link in the email
3. Or visit our website and go to "My Orders"
4. Enter your order number

## Need Help?

If you can't find your tracking number, contact us at soporte@vitrinnea.com

**Related Articles:**
- Understanding shipping times
- What if my order is delayed?
```

## Step 3: Embed YouTube Videos in Articles

You can embed your YouTube videos directly in Chatwoot articles:

```markdown
## Video Tutorial

Watch our step-by-step guide:

<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
  frameborder="0" allowfullscreen>
</iframe>

Find more tutorials on our [YouTube Channel](https://www.youtube.com/@shopvitrinnea)
```

## Step 4: Get Your Help Center URL

After creating your portal:

1. Go to **Portals** → **Settings**
2. Copy your Help Center URL (e.g., `https://your-chatwoot.com/hc/vitrinnea`)
3. Update this URL in `message-handler.js`:

```javascript
const config = {
  name: 'Vitrinnea',
  supportEmail: 'soporte@vitrinnea.com',
  phone: '+506 XXXX-XXXX',
  helpCenterUrl: 'https://your-chatwoot-url.com/hc/vitrinnea' // ← Your actual URL
};
```

## Step 5: Link Articles to Bot Responses

You can link specific articles in bot responses:

```javascript
} else if (message === '2') {
  intent = 'shipping';
  response = `🚚 *Información de Envío*\n\n• Envío Estándar: 5-7 días hábiles\n• Envío Express: 2-3 días hábiles\n\n📖 Lee más: ${config.helpCenterUrl}/articles/shipping-info\n\n¿Necesitas rastrear un pedido?`;
```

## Step 6: Create a Help Center Home Page

In Chatwoot, customize your portal home page:

1. **Hero Section**
   - Welcome message
   - Search bar
   - Featured categories

2. **Popular Articles**
   - Most viewed articles
   - Quick links

3. **Contact Section**
   - Link to live chat
   - Email and phone
   - Business hours

## Step 7: Add Search Functionality

Chatwoot's Help Center includes built-in search. Users can:
- Search articles by keywords
- Browse by category
- See related articles

## Step 8: Embed Help Center Widget on Your Website

Chatwoot allows you to embed the Help Center on your website:

```html
<!-- Add to your website -->
<script>
  window.chatwootSettings = {
    hideMessageBubble: false,
    position: 'right',
    locale: 'es',
    type: 'expanded_bubble',
    showPopoutButton: true
  };
  (function(d,t) {
    var BASE_URL="https://your-chatwoot.com";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    s.parentNode.insertBefore(g,s);
    g.async=!0;
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: 'YOUR_WEBSITE_TOKEN',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

## Benefits of Using Chatwoot Help Center

### 1. **Analytics**
Track which articles are most viewed to understand customer needs.

### 2. **Easy Updates**
Edit articles directly in Chatwoot without deploying new code.

### 3. **SEO Friendly**
Articles are indexed by search engines, bringing organic traffic.

### 4. **Multi-language**
Create articles in Spanish, English, or other languages.

### 5. **Team Collaboration**
Multiple team members can contribute and edit articles.

## Recommended Articles to Create

Based on the bot's menu options, create these articles:

### Option 0 - Help Center
- ✅ Getting Started Guide
- ✅ Video Tutorial Index
- ✅ How to Use This Help Center

### Option 1 - Order Status
- ✅ How to Check Order Status
- ✅ Understanding Order Statuses
- ✅ What to Do If Order is Delayed

### Option 2 - Shipping
- ✅ Shipping Methods and Times
- ✅ International Shipping
- ✅ Tracking Your Package

### Option 3 - Returns
- ✅ Return Policy
- ✅ How to Return an Item
- ✅ Refund Timeline

### Option 4 - Pricing
- ✅ Understanding Our Pricing
- ✅ Discounts and Promotions
- ✅ Price Match Guarantee

### Option 5 - Account
- ✅ Creating an Account
- ✅ Resetting Your Password
- ✅ Updating Profile Information

### Option 6 - Billing
- ✅ Payment Methods Accepted
- ✅ Requesting an Invoice
- ✅ Billing Disputes

### Option 7 - Availability
- ✅ Checking Product Availability
- ✅ Back in Stock Notifications
- ✅ Pre-Orders

### Option 8 - Contact
- ✅ Business Hours
- ✅ Contact Methods
- ✅ Location Information

## Integration with Bot

Update bot responses to link to specific articles:

```javascript
} else if (message === '1') {
  intent = 'order_status';
  response = `🔍 *Estado de Pedido*\n\nPara revisar tu pedido:\n1. Ingresa a tu cuenta\n2. Ve a "Mis Pedidos"\n3. Selecciona tu orden\n\n📖 Guía completa: ${config.helpCenterUrl}/articles/check-order-status\n\n¿Tienes tu número de orden? Envíamelo.`;
}
```

## Maintenance

### Regular Tasks:
- Update articles monthly
- Add new FAQs based on common questions
- Update YouTube video embeds
- Review analytics to see which articles need improvement
- Archive outdated content

## Alternative: Standalone HTML Files

If you prefer standalone HTML files instead of Chatwoot's built-in help center:

1. Use the `help-center.html` file provided
2. Host on:
   - GitHub Pages (free)
   - Netlify (free)
   - Vercel (free)
   - Your own server

3. Update video IDs with your actual YouTube videos
4. Link from bot using the hosted URL

## Conclusion

**Recommended**: Use Chatwoot's built-in Help Center for better integration and ease of maintenance.

**Alternative**: Use standalone HTML files if you need more customization or want to host externally.

Both approaches work with the analytics tracking system we've set up!
