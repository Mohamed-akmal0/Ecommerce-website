const db = require("../config/connection");
const collection = require("../config/collection");
const { resolveInclude } = require("ejs");
const { GridFSBucket } = require("mongodb");
const { response } = require("../app");
const product = require("./product");
const objectID = require("mongodb").ObjectId;

module.exports = {
  getCart: (uid) => {
    return new Promise(async (resolve, reject) => {
      // try{
      let cartItems = await db
        .get()
        .collection(collection.cart_collection)
        .aggregate([
          {
            $match: { user: objectID(uid) }, // we are matching the id of two collections
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.product_collection,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      if (cartItems.length == 0) {
        resolve();
      } else {
        resolve(cartItems); //taking only the cartitems key value pairs  from the documents that we get
      }
      // }catch(err){
      //   console.log("Error that occured in get cart"+err)
      // }
    });
  },
  getCartCount: (uid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let cart = await db
          .get()
          .collection(collection.cart_collection)
          .findOne({ user: objectID(uid) });
        if (cart) {
          count = cart.products.length;
        }
        resolve(count);
      } catch (err) {
        console.log("Error that occurred in get cart count function" + err);
      }
    });
  },
  changeQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      try {
        if (details.count == -1 && details.quantity == 1) {
          db.get()
            .collection(collection.cart_collection)
            .updateOne(
              { _id: objectID(details.cart) },
              {
                $pull: { products: { item: objectID(details.product) } },
              }
            )
            .then(() => {
              resolve({ removeProduct: true });
            });
        } else {
          db.get()
            .collection(collection.cart_collection)
            .updateOne(
              {
                _id: objectID(details.cart),
                "products.item": objectID(details.product),
              },
              {
                $inc: { "products.$.quantity": details.count },
              }
            )
            .then(() => {
              resolve({ status: true });
            });
        }
      } catch (err) {
        console.log("Error that occured in changeQantity function" + err);
        reject(err);
      }
    });
  },
  deleteCart: (pid, uid) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.cart_collection)
          .updateOne(
            { user: objectID(uid), "products.item": objectID(pid) },
            {
              $pull: {
                products: { item: objectID(pid) },
              },
            }
          )
          .then((response) => {
            resolve({ removeStatus: true });
          });
      } catch (err) {
        console.log("Error that occurred in delete cart function" + err);
      }
    });
  },
  getTotal: (uid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let totalPrice = await db
          .get()
          .collection(collection.cart_collection)
          .aggregate([
            {
              $match: { user: objectID(uid) }, // Fetch the cart by matching the user id
            },
            {
              $unwind: "$products", //Took the products.
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.product_collection, //Taking products details from products collection
                localField: "item",
                foreignField: "_id",
                as: "product", //insert it into product using alias
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      { $toInt: "$quantity" },
                      { $toInt: "$product.price" },
                    ],
                  },
                },
              },
            },
          ])
          .toArray();
        if (totalPrice.length == 0) {
          resolve();
        } else {
          console.log(totalPrice[0].total);
          resolve(totalPrice[0].total);
        }
      } catch (err) {
        console.log("Error that occured in get total function" + err);
        reject(err);
      }
    });
  },
  getCartProductList: (uid) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.cart_collection)
        .findOne({ user: objectID(uid) });
      resolve(cart.products);
    });
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      let { firstname } = order;
      console.log(firstname);
      var today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();
      today = mm + "-" + dd + "-" + yyyy;
      order.Date = today;
      let date = order.Date;
      let status = order.payment === "COD" ? "placed" : "pending";
      let orderObject = {
        deliveryDetails: {
          firstname: order.firstname,
          lastname: order.house,
          country: order.country,
          phone: order.phone,
          state: order.state,
          district: order.district,
          pincode: order.pincode,
        },
        userID: objectID(order.userid),
        payment: order.payment,
        products: products,
        totalAmount: total,
        status: status,
        date: date,
        orderDate: new Date(),
      };
      db.get()
        .collection(collection.order_collection)
        .insertOne(orderObject)
        .then((response) => {
          console.log(response);
          db.get()
            .collection(collection.cart_collection)
            .deleteOne({ user: objectID(order.userid) });
          resolve(response.insertedId);
        });
    });
  },
};
