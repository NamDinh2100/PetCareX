import express from 'express';
import * as statisticalService from '../models/statistical.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const services = await statisticalService.getRevenueByService();

        const top4 = services.slice(0, 4);
        const othersSum = services.slice(4).reduce((sum, item) => sum + parseFloat(item.revenue), 0);
        
        const pieData = {
            labels: [...top4.map(s => s.service_name), 'Others'],
            data: [...top4.map(s => parseFloat(s.revenue)), othersSum]
        };

        const top5 = services.slice(0, 5);
        const barData = {
            labels: top5.map(s => s.service_name),
            data: top5.map(s => parseFloat(s.revenue))
        };

        res.render('vwAdmin/vwStatistic/chart', {
            layout: 'admin-layout', 
            stats: JSON.stringify({ 
                pieData, 
                barData,
                exportData: services
            }) 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;