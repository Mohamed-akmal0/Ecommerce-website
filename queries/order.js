const db = require("../config/connection");
const collection = require("../config/collection");
const objectID = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { resolve } = require("path");
require("dotenv").config();

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
module.exports = {
  getOrders: (userid) => {
    console.log("we have entered get order function");
    console.log(userid);
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.order_collection)
        .find({ userID: objectID(userid) })
        .toArray();
      console.log(orders);
      resolve(orders);
    });
  },

  getOrdersproduct: (orderid) => {
    try {
      return new Promise(async (resolve, reject) => {
        let orders = await db
          .get()
          .collection(collection.order_collection)
          .aggregate([
            {
              $match: { _id: objectID(orderid) },
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
        console.log(orders);
        resolve(orders);
      });
    } catch (error) {
      // throw new Error('order product function error')
      console.log(
        "There is an error occurred in the get order product function" + error
      );
    }
  },
  getUserOrders: () => {
    return new Promise(async (resolve, reject) => {
      let userOrders = await db
        .get()
        .collection(collection.order_collection)
        .find()
        .toArray();
      resolve(userOrders);
    });
  },
  cancelOrder: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.order_collection)
        .updateOne(
          { _id: objectID(details) },
          {
            $set: {
              status: "cancelled",
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  returnOrder: (orderid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.order_collection)
        .updateOne(
          { _id: objectID(orderid) },
          {
            $set: {
              status: "returned",
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  editStatus: (body, details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.order_collection)
        .updateOne(
          { _id: objectID(details) },
          {
            $set: {
              status: body,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  razorPay: (orderid, totalAmount) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalAmount * 100, //amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderid,
      };
      instance.orders.create(options, function (err, order) {
        console.log(order);
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
  },
  paymentVerify: (paymentDetails) => {
    return new Promise(async (resolve, reject) => {
      console.log("dData:" + paymentDetails["payment[razorpay_payment_id]"]);
      console.log("DaTa:" + paymentDetails["payment[razorpay_order_id]"]);
      console.log("DATA::" + paymentDetails["payment[razorpay_signature]"]);
      const { createHmac } = await import("node:crypto");
      let hmac = createHmac("sha256", "FczuHHJBjBKkC7WQamtQrPFm");
      hmac.update(
        paymentDetails["payment[razorpay_order_id]"] +
          "|" +
          paymentDetails["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == paymentDetails["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  ChangingPaymentStatus: (orderid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.order_collection)
        .updateOne(
          { _id: objectID(orderid) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
};
