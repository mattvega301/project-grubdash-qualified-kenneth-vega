const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists (req, res, next) {
  const foundDish = dishes.find((dish) => dish.id === req.params.dishId);
  if (foundDish) {
    next();
  }
  else {
    next({
      status: 404,
      message: `Dish does not exist: ${req.params.dishId}`
    });
  }
}

function areDishIdsMatching (req, res, next) {
  const { data: { id }} = req.body;
  const routeId = req.params.dishId;
  if (id) { 
    if (id === routeId) {
      next();
    }
    else {
      next({
        status: 400,
        message: `Dish id does not match route id. Dish ${id}, Route: ${routeId}`
      });
    }
  }
  else {
    next();
  }
}

function hasDishProperties (req, res, next) {
  const { data: { name, description, price, image_url }} = req.body;
  if (!name){
    next({
      status: 400,
      message: 'Dish must include a name'
    });
  } else if (!description) {
    next({
      status: 400,
      message: 'Dish must include a description'
    });
  } else if (!price) {
    next({
      status: 400,
      message: 'Dish must include a price'
    });
  } else if (price <= 0 || !(typeof price === 'number')) {
    next({
      status: 400,
      message: 'Dish must have a price that is an integer greater than 0'
    });
  } else if (!image_url) {
    next({
      status: 400,
      message: 'Dish must include a image_url'
    });
  } else {
    next();
  }
}

function list (req, res, next) {
  res.json({ data: dishes });
}
function read (req, res, next) {
  const foundDish = dishes.find((dish) => dish.id === req.params.dishId);
  res.json({ data: foundDish });
}
function create (req, res, next) {
  const { data: { name, description, price, image_url }} = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url
  }
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}
function update (req, res, next) {
  const { data: { name, description, price, image_url }} = req.body;
  const { id } = dishes.find((dish) => dish.id === req.params.dishId);
  const index = dishes.findIndex((dish) => dish.id === req.params.dishId);
  const newDish = {
    id: id,
    name: name,
    description: description,
    price: price,
    image_url: image_url
  };
  dishes.splice(index, 1, newDish);
  res.json({ data: newDish });
}


module.exports = {
  create: [hasDishProperties, create],
  read: [dishExists, read],
  update: [dishExists, areDishIdsMatching, hasDishProperties, update],
  list
}