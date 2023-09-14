const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");

module.exports = {
  addCoupen: (coupon) => {
    const { cname, Offer, Date } = coupon;
    const coupoffer = parseInt(Offer);
    let couponObject = {
      couponName: cname,
      couponOffer: coupoffer,
      ExpireDate: Date,
    };
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupen_collection)
        .insertOne(couponObject)
        .then((response) => {
          resolve(response);
        });
    });
  },
  findCoupon: (couponId) => {
    console.log("coupon id that we got in the find coupon function" + couponId);
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.coupen_collection)
        .findOne({ _id: ObjectId(couponId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  usedCoupon: (coupid, uid) => {
    // console.log(coupid , uid)
    console.log("we have enter the used coupon function");
    let usedCoup = {
      coupon: coupid,
      user: ObjectId(uid),
    };
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.usedCoupon_collection)
        .insertOne(usedCoup)
        .then((response) => {
          console.log(response);
          resolve(response);
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  },
  getCoupon: () => {
    return new Promise(async (resolve, reject) => {
      let getcoup = await db
        .get()
        .collection(collection.coupen_collection)
        .find()
        .toArray();
      resolve(getcoup);
    });
  },
  removeCoupon: (coupid) => {
    console.log("coupid that we get in  remove function " + coupid);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.coupen_collection)
        .deleteOne({ _id: ObjectId(coupid) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  checkCoupon: (coupon, uid) => {
    let today = new Date().toISOString().slice(0, 10);
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.coupen_collection)
        .findOne({ couponName: coupon });
      if (data) {
        await db
          .get()
          .collection(collection.usedCoupon_collection)
          .findOne({ coupon: ObjectId(data._id) }, { user: ObjectId(uid) })
          .then((response) => {
            console.log(response);
            if (!response || (response == null && data.Date >= today)) {
              console.log("we have got a valid coupon");
              console.log(data);
              resolve(data);
            } else {
              console.log("Enter a valid coupon");
              resolve();
            }
          });
      } else {
        console.log("we dont have this kind of coupon");
        resolve();
      }
    });
  },
};
