const moment = require('moment');
const Order = require('../models/Order');
const errorHandler = require('../utils/errorHandler');

module.exports.overview = async function (req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1});
        const ordersMap = getOrdersMap(allOrders);
        const totalOrdersNumber = allOrders.length;
        const daysNumber = Object.keys(ordersMap).length;
        const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(0);
        const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || [];
        const yesterdayOrdersAmount = yesterdayOrders.length;

        //percentage for orders quantity:  ((yesterday orders / orders per day) - 1) * 100
        const ordersPercent = ((yesterdayOrdersAmount / ordersPerDay - 1) * 100).toFixed(2);
        const totalProceeds = calculatePrice(allOrders);
        const proccedsPerDay = totalProceeds / daysNumber;
        const yesterdayProceeds = calculatePrice(yesterdayOrders);
        const proceedsPercent = ((yesterdayProceeds / proccedsPerDay - 1) * 100).toFixed(2);
        const compareProceeds = (yesterdayProceeds - proccedsPerDay).toFixed(2);

        //compare amount of orders
        const compareNumber = (yesterdayOrdersAmount - ordersPerDay).toFixed(2);
        res.status(200).json({
            proceeds: {
                percent: Math.abs(+proceedsPercent),
                compare: Math.abs(+compareProceeds),
                yesterday: +yesterdayProceeds,
                isHigher: proceedsPercent > 0
            },
            orders: {
                percent: Math.abs(+ordersPercent),
                compare: Math.abs(+compareNumber),
                yesterday: +yesterdayOrdersAmount,
                isHigher: ordersPercent > 0
            }
        });
    } catch (e) {
        errorHandler(res, e);
    }
};

module.exports.analytics = async function (req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1});
        const ordersMap = getOrdersMap(allOrders);

        const average = +(calculatePrice(allOrders) / Object.keys(ordersMap).length).toFixed(2);

        const chart = Object.keys(ordersMap).map(label => {
            const proceeds = calculatePrice(ordersMap[label]);
            const order = ordersMap[label].length;
            return {label, proceeds, order};
        })

        res.status(200).json({average, chart})
    } catch (e) {
        errorHandler(res, e);
    }
};

function getOrdersMap(orders = []) {
    const daysOrders = {};
    orders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYYY');

        if (date === moment().format('DD.MM.YYYY')) {
            return;
        }

        if (!daysOrders[date]) {
            daysOrders[date] = [];
        }

        daysOrders[date].push(order);
    });

    return daysOrders;
}

function calculatePrice(orders = []) {
    return orders.reduce((total, order) => {
        const orderPrice = order.list.reduce((orderTotal, item) => {
            return orderTotal += item.cost * item.quantity;
        }, 0)

        return total += orderPrice;
    }, 0)
}