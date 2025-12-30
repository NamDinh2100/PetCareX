import express from 'express';
import * as productModel from '../../models/product.model.js';
import * as medicineModel from '../../models/medicine.model.js';
import * as vaccineModel from '../../models/vaccine.model.js';

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

router.get('/medicines', async function (req, res) {
    const list = await medicineModel.getAllMedicines();
    res.render('vwSaler/medicines', { 
        layout: 'saler',
        medicines: list
    });
});

router.post('/add-medicine', async function (req, res) {
    const medicine = { 
        medicine_name: req.body.medicine_name,
        form: req.body.form,
        description: req.body.description,
        selling_price: req.body.selling_price,
        stock_quantity: req.body.stock_quantity
    };
    
    await medicineModel.addMedicine(medicine);
    res.redirect('/saler/medicines');
});

router.get('/vaccines', async function (req, res) {
    const list = await vaccineModel.getAllVaccines();
    res.render('vwSaler/vaccines', {    
        layout: 'saler',
        vaccines: list 
    });
});

router.post('/add-vaccine', async function (req, res) {
    const vaccine = { 
        vaccine_name: req.body.vaccine_name,
        vaccine_type: req.body.vaccine_type,
        dosage: req.body.dosage,
        manufacturer: req.body.manufacturer,
        production_date: req.body.production_date,
        expiry_date: req.body.expiry_date,
        price: req.body.price,
    };

    await vaccineModel.addVaccine(vaccine);
    res.redirect('/saler/vaccines');
});

export default router;