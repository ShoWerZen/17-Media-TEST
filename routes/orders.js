var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	res.render('order', { 
		title: '訂單總覽'
	});
});

router.get('/orders', (req, res, next) => {
	res.send(req.app.locals.orders);
});

router.delete('/orders', (req, res, next)  => {
	var order = req.body.order;
	var orders = req.app.locals.orders;
	for(var i = 0 ; i < orders.length ; i++){
		if(orders[i].date == order.date && 
			orders[i].name == order.name){
			orders.splice(i, 1);
			break;
		}
	}
	ordersSave(orders).then((newOrders) => {
		res.send(newOrders);
	}, (err) => {
		res.status(500).send(err);
	});
});

router.post('/orders', (req, res, next) => {
	var name = req.body.name;
	var date = new Date().toLocaleString();
	var orders = req.app.locals.orders;
	var duplicate = false;
	for(var i = 0 ; i < orders.length ; i++){
		if(orders[i].date == date && 
			orders[i].name == name){
			duplicate = true;
			break;
		}
	}
	if(duplicate)
		res.status(500).send("date and name are duplicate!");
	else{
		orders.splice(0, 0, {
			date: date,
			name: name,
			items: []
		});
		ordersSave(orders).then((newOrders) => {
			res.send(newOrders);
		}, (err) => {
			res.status(500).send(err);
		});
	}
});

router.post('/orders/item', (req, res, next) => {
	var item = req.body.item;
	item.id = Math.floor(new Date().getTime() / 1000);
	var order = req.body.order;
	var orders = req.app.locals.orders;
	var items = null;
	for(var i = 0 ; i < orders.length ; i++){
		if(orders[i].date == order.date && 
			orders[i].name == order.name){
			orders[i].items.push(item);
			items = orders[i].items;
			break;
		}
	}

	ordersSave(orders).then((newOrders) => {
		res.send(items);
	}, (err) => {
		res.status(500).send(err);
	});
});

router.delete('/orders/item', (req, res, next) => {
	var item = req.body.item;
	var order = req.body.order;
	var orders = req.app.locals.orders;
	var items = null;
	for(var i = 0 ; i < orders.length ; i++){
		if(orders[i].date == order.date && 
			orders[i].name == order.name){
			for(var j = 0 ; j < orders[i].items.length ; j++){
				if(orders[i].items[j].id == item.id){
					orders[i].items.splice(j, 1);
					break;
				}
			}
			items = orders[i].items;
			break;
		}
	}

	ordersSave(orders).then((newOrders) => {
		res.send(items);
	}, (err) => {
		res.status(500).send(err);
	});
});

router.put('/orders/item', (req, res, next) => {
	var item = req.body.item;
	var order = req.body.order;
	var orders = req.app.locals.orders;
	var items = null;
	for(var i = 0 ; i < orders.length ; i++){
		if(orders[i].date == order.date && 
			orders[i].name == order.name){
			for(var j = 0 ; j < orders[i].items.length ; j++){
				if(orders[i].items[j].id == item.id){
					orders[i].items[j] = item;
					break;
				}
			}
			items = orders[i].items;
			break;
		}
	}

	ordersSave(orders).then((newOrders) => {
		res.send(items);
	}, (err) => {
		res.status(500).send(err);
	});
});

function ordersSave(orders){
	return new Promise((resolve, reject) => {
		fs.writeFile(path.join(__dirname, '../orders.json'), JSON.stringify(orders), (err) => {
	        if(err)
	        	reject(err);
	        else
	        	resolve(orders);
	    });
	});
}

module.exports = router;
