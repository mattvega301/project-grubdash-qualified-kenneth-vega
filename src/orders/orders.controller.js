const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists (req, res, next) {
  const foundOrder = orders.find((order) => order.id === req.params.orderId);
  if (foundOrder) {
    next();
  }
  else {
    next({
      status: 404,
      message: `Order does not exist: ${req.params.orderId}`
    });
  }
}

function hasOrderProperties (req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes }} = req.body;
  
  if (!dishes) {
    next({
      status: 400,
      message: 'Order must include a dish'
    });
  }
  
  if (!Array.isArray(dishes)){
    next({
      status: 400,
      message: 'Order must include at least one dish'
    });
  }
  
  if (dishes){
    dishes.forEach((dish, index) => {
      if (!dish.quantity || dish.quantity <= 0 || !(typeof dish.quantity == 'number')){
        next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`
        });
      }
    });
    if (!Array.isArray(dishes)){
    next({
      status: 400,
      message: 'Dishes must be an array'
    });
    } else if (!deliverTo) {
      next({
        status: 400,
        message: 'Order must include a deliverTo'
      });
    } else if (!mobileNumber) {
      next({
        status: 400,
        message: 'Order must include a mobileNumber'
      });
    } else if (dishes.length === 0) {
      next({
        status: 400,
        message: 'Order must include at least one dish'
      });
    } else {
      next();
    }
  }  else if (!dishes) {
      next({
        status: 400,
        message: 'Order must include a dish'
      });
    } 
  
}

function ableToUpdate (req, res, next) {
  const { data: { id, status }} = req.body;
  const routeId = req.params.orderId;
  
  if (id){
    if (id === routeId){
      if (!status){
        next({
          status: 400,
          message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
        });
      } else if (status === "delivered"){
        next({
          status: 400,
          message: 'A delivered order cannot be changed'
        });
      } else if (status === "invalid"){
        next({
          status: 400,
          message: 'status'
        });
      } else {
        next();
      }
      
    } else {
      next({
        status: 400,
        message: `Order id does not match route id. Order ${id}, Route: ${routeId}`
      });
    }
    
  } else {
    if (!status){
        next({
          status: 400,
          message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
        });
      } else if (status === "delivered"){
        next({
          status: 400,
          message: 'A delivered order cannot be changed'
        });
      } else {
        next();
      }
  }
}

function ableToDelete (req, res, next) {
  const { status } = orders.find((order) => order.id === req.params.orderId);
  if (status !== 'pending') {
    next({
      status: 400,
      message: 'An order cannot be deleted unless it is pending'
    });
  }
  else {
    next();
  }
}

function list (req, res, next) {
  res.json({ data: orders });
}

function read (req, res, next) {
  const foundOrder = orders.find((order) => order.id === req.params.orderId);
  res.json({ data: foundOrder });
}

function create (req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes }} = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: [...dishes]
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update (req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes }} = req.body;
  const { id } = orders.find((order) => order.id === req.params.orderId);
  const index = orders.findIndex((order) => order.id === req.params.orderId);
  const newOrder = {
    id: id,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: [...dishes]
  };
  orders.splice(index, 1, newOrder);
  res.json({ data: newOrder });
}

function destroy (req, res, next) {
  const index = orders.findIndex((order) => order.id === req.params.orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [hasOrderProperties, create],
  update: [orderExists, hasOrderProperties, ableToUpdate, update],
  delete: [orderExists, ableToDelete, destroy]
}
