const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Now define the webhook router - mount at /api so /webhook becomes /api/webhook
const webhookRouter = require('./routes/webhook');
app.use('/api', webhookRouter);


// CORS for regular API routes
app.use(cors({
  origin: true,
  credentials: true
}));

// Additional CORS headers for preflight
app.options('*', cors({
  origin: true,
  credentials: true
}));

// Regular JSON parsing for all other routes
app.use(express.json());

// Import route modules
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const siteSettingsRouter = require('./routes/siteSettings');
const userRolesRouter = require('./routes/userRoles');
const appRolesRouter = require('./routes/appRoles');
const orderItemsRouter = require('./routes/orderItems');
const categoriesRouter = require('./routes/categories');
const checkoutRouter = require('./routes/checkout');
const reviewsRouter = require('./routes/reviews');
const trackOrderRouter = require('./routes/trackOrder');
const couponsRouter = require('./routes/coupons');
const visitorsRouter = require('./routes/visitors');
const bannersRouter = require('./routes/banners');
const bundlesRouter = require('./routes/bundles');

app.get('/backend', (req, res) => {
    res.json({ 
        message: 'Server is running',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});
  
// Use route modules
app.use('/backend/api', authRouter);
app.use('/backend/api', productsRouter);
app.use('/backend/api', ordersRouter);
app.use('/backend/api', siteSettingsRouter);
app.use('/backend/api', userRolesRouter);
app.use('/backend/api', appRolesRouter);
app.use('/backend/api', orderItemsRouter);
app.use('/backend/api', categoriesRouter);
app.use('/backend/api', checkoutRouter);
app.use('/backend/api', reviewsRouter);
app.use('/backend/api', trackOrderRouter);
app.use('/backend/api', couponsRouter);
app.use('/backend/api', visitorsRouter);
app.use('/backend/api', bannersRouter);
app.use('/backend/api', bundlesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
