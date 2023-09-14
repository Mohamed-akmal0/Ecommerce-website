const db = require("../config/connection");
const collection = require("../config/collection");
const objectID = require("mongodb").ObjectId;

module.exports = {
  addProduct: (product) => {
    let { name, description, stock, price, catogory } = product;

    var today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + "-" + dd + "-" + yyyy;
    product.Date = today;
    let pro = {
      name: name,
      description: description,
      stock: stock,
      price: price,
      category: objectID(catogory),
      Date: today,
    };
    console.log(pro);
    return new Promise(async (resolve, reject) => {
      try {
        await db
          .get()
          .collection(collection.product_collection)
          .insertOne(pro)
          .then((data) => {
            resolve(data.insertedId);
          });
      } catch (err) {
        console.log("Error that occured in add product function" + err);
        reject();
      }
    });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.product_collection)
        .aggregate([
          {
            $lookup: {
              from: collection.categoy_collection,
              localField: "category",
              foreignField: "_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: "$categoryInfo",
          },
        ])
        .toArray();
      // console.log(products)
      resolve(products);
    });
  },
  products: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.product_collection)
        .aggregate([
          {
            $lookup: {
              from: collection.categoy_collection,
              localField: "catogory",
              foreignField: "name",
              as: "categories",
            },
          },
          {
            $unwind: "$categories",
          },
          // {
          //  $project: {
          //     name:'$name',
          //     category:'$catogory',
          //     offer:'$categories.Offer',
          //     price:'$price'
          //  }
          // }
        ])
        .toArray()
        .then((data) => {
          console.log(data);
          resolve(data);
        });
    });
  },
  productdetails: (pdetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.product_collection)
        .findOne({ _id: objectID(pdetails) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  editProduct: (pid, pdetails) => {
    const { name, description, stock, price, catogory } = pdetails;
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.product_collection)
          .updateOne(
            { _id: objectID(pid) },
            {
              $set: {
                name: name,
                description: description,
                stock: stock,
                price: price,
                catogory: catogory,
              },
            }
          )
          .then((response) => {
            resolve();
          });
      } catch (err) {
        console.log("Error that occurred in edit product function" + err);
        reject();
      }
    });
  },

  deleteProduct: (pid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.product_collection)
        .deleteOne({ _id: objectID(pid) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  addCategory: (category) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.categoy_collection)
        .insertOne(category)
        .then((data) => {
          resolve(data);
        });
    });
  },
  findCategories: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.product_collection)
        .aggregate([
          {
            $lookup: {
              from: collection.categoy_collection,
              localField: "category",
              foreignField: "_id",
              as: "categories",
            },
          },
          {
            $unwind: "$categories",
          },
          {
            $project: {
              name: "$name",
              // category:'$category',
              Offer: "$categories.Offer",
              price: "$price",
            },
          },
        ])
        .toArray();
      resolve(data);
    });
  },
  addDiscountProduct: (id, value) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.product_collection)
        .findOneAndUpdate(
          { _id: objectID(id) },
          {
            $set: {
              discountedPrice: value,
            },
          }
        );
    });
  },
  getCategories: () => {
    return new Promise(async (resolve, reject) => {
      let getcategory = await db
        .get()
        .collection(collection.categoy_collection)
        .find()
        .toArray();
      // console.log(getcategory)
      resolve(getcategory);
    });
  },
  categoryDetails: (catId) => {
    return new Promise((resolve, reject) => {
      let category = db
        .get()
        .collection(collection.categoy_collection)
        .findOne({ _id: objectID(catId) });
      resolve(category);
    });
  },

  editcategory: (catDetails) => {
    const { catId, category, offer } = catDetails;
    let Offer = parseInt(offer);
    console.log(Offer);
    console.log(typeof Offer);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.categoy_collection)
        .updateOne(
          { _id: objectID(catId) },
          {
            $set: {
              catogory: category,
              Offer: Offer,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  deletecategory: (catId) => {
    console.log(catId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.categoy_collection)
        .deleteOne({ _id: objectID(catId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  getMonth: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.order_collection)
        .aggregate([
          {
            $match: {
              orderDate: {
                $gte: new Date(new Date().getMonth() - 2),
              },
            },
          },
          { $unwind: "$products" },
          {
            $project: {
              year: { $year: "$orderDate" },
              month: { $month: "$orderDate" },
              day: { $dayOfMonth: "$orderDate" },
              dayOfWeek: { $dayOfWeek: "$orderDate" },
              week: { $week: "$orderDate" },
              date: { $toDate: "$orderDate" },
            },
          },
          {
            $group: {
              _id: "$month",
              count: { $sum: 1 },
              detail: { $first: "$$ROOT" },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ])
        .toArray()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          console.log("chart function error" + err);
          reject(err);
        });
    });
  },
  getDay: () => {
    try {
      return new Promise(async (resolve, reject) => {
        let data = await db
          .get()
          .collection(collection.order_collection)
          .aggregate([
            {
              $match: {
                orderDate: {
                  $gte: new Date(new Date() - 60 * 60 * 24 * 1000 * 7),
                },
              },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                year: { $year: "$orderDate" },
                month: { $month: "$orderDate" },
                day: { $dayOfMonth: "$orderDate" },
                dayOfWeek: { $dayOfWeek: "$orderDate" },
              },
            },
            {
              $group: {
                _id: "$dayOfWeek",
                count: { $sum: 1 },
                detail: { $first: "$$ROOT" },
              },
            },
            {
              $sort: { detail: 1 },
            },
          ])
          .toArray();
        resolve(data);
      });
    } catch (error) {
      console.log(error);
      reject(data);
    }
  },
  getWeek: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.order_collection)
        .aggregate([
          {
            $match: {
              orderDate: {
                $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 7),
              },
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              year: { $year: "$orderDate" },
              month: { $month: "$orderDate" },
              day: { $dayOfMonth: "$orderDate" },
              dayOfWeek: { $dayOfWeek: "$orderDate" },
              week: { $week: "$orderDate" },
            },
          },
          {
            $group: {
              _id: "$week",
              count: { $sum: 1 },
              detail: { $first: "$$ROOT" },
            },
          },
          {
            $sort: {
              detail: 1,
            },
          },
        ])
        .toArray();
      console.log(data);
      resolve(data);
    }).catch((err) => {
      console.log("Error that occurred in get order by week function" + err);
      reject(data);
    });
  },
};
