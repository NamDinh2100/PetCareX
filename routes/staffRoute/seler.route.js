import express from 'express';
import * as productModel from '../../models/product.model.js';

const router = express.Router();

router.get('/products', async function (req, res) {

    const products = await productModel.getAllProducts();
    res.render('vwStaff/product/list', { 
        products: products 
    });
    
});

export default router;