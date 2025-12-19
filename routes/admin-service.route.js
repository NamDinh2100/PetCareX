import express from 'express';
import * as serviceService from '../models/service.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    const total = await serviceService.countByService();

    const nPages = Math.ceil(+total.count / limit);
    const pageNumbers = [];

    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +page,
        });
    }

    const list = await serviceService.findPageByService(limit, offset);

    res.render('vwAdmin/vwService/list',{
        services: list,
        isAddMode: false,
        pageNumbers: pageNumbers,
        layout: 'admin-layout'
    });
});

router.get('/add', async function (req, res) {
    const list = await serviceService.getAllServices();
    res.render('vwAdmin/vwService/list', {
        services: list,
        isAddMode: true,
        layout: 'admin-layout'
    });
});

router.post('/add', async function (req, res) {
    const service = {
        service_name: req.body.service_name,
        base_price: req.body.base_price,
        description: req.body.description,
    };
    await serviceService.addService(service);
    res.redirect('/admin/services');
});

router.get('/edit', async function (req, res) {
    const id = req.query.id;
    const service = await serviceService.getServiceByID(id);
    res.render('vwAdmin/vwService/edit', { 
        service: service,
        layout: 'admin-layout'
    });
    
});

router.post('/edit', async function (req, res) {
    const id = req.query.id;
    const service = {
        service_name: req.body.service_name,
        base_price: req.body.base_price,
        description: req.body.description,
    };
    await serviceService.updateService(id, service);
    res.redirect('/admin/services');
});

export default router;