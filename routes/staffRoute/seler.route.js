import express from 'express';
import * as productModel from '../../models/product.model.js';

const router = express.Router();

// Dashboard
router.get('/', async function (req, res) {
    const products = await productModel.getAllProducts();
    
    // Calculate statistics
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.stock_quantity > 50).length;
    const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 50).length;
    
    // Get recent products (last 5)
    const recentProducts = products.slice(0, 5);
    
    res.render('vwSaler/dashboard', { 
        layout: 'saler',
        totalProducts,
        inStockProducts,
        lowStockProducts,
        todayOrders: 0,
        products: recentProducts,
        currentDate: new Date().toLocaleDateString('vi-VN')
    });
});

// Products page
router.get('/products', async function (req, res) {
    const products = await productModel.getAllProducts();
    res.render('vwSaler/products', { 
        layout: 'saler',
        products: products 
    });
});

// Add product
router.post('/add-product', async function (req, res) {
    const product = { 
        product_name: req.body.product_name, 
        product_type: req.body.product_type, 
        description: req.body.description, 
        selling_price: req.body.selling_price, 
        stock_quantity: req.body.stock_quantity
    }
    
    await productModel.addProduct(product);
    res.redirect('/saler/products');
});

// Orders page (placeholder)
router.get('/orders', function (req, res) {
    res.render('vwSaler/orders', { 
        layout: 'saler',
        orders: []
    });
});

// Inventory page (placeholder)
router.get('/inventory', async function (req, res) {
    const products = await productModel.getAllProducts();
    res.render('vwSaler/inventory', { 
        layout: 'saler',
        products: products
    });
});

export default router;