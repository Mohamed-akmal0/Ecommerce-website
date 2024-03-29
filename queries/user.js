const db = require("../config/connection");
const collection = require("../config/collection");
const objectID = require("mongodb").ObjectId;
const { response } = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const product = require("./product");
const { user_collection } = require("../config/collection");
const { ObjectID } = require("bson");
module.exports = {
  getUsers: () => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.user_collection)
        .find()
        .toArray();
      resolve(user);
    });
  },
  userDetails: (udetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collection)
        .findOne({ _id: objectID(udetails) })
        .then((user) => {
          resolve(user);
        });
    });
  },
  updateUser: (uid, udetails) => {
    if (udetails.blocked == true) {
      (session.user = null),
        (session.loggedIn = null),
        (session.loginErr = null);
    }
    const { user, email, password } = udetails;
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10).then((pass) => {
        db.get()
          .collection(collection.user_collection)
          .updateOne(
            { _id: objectID(uid) },
            {
              $set: {
                user: user,
                email: email,
                password: pass,
                blocked: udetails.blocked,
              },
            }
          )
          .then(() => {
            resolve(true);
          });
      });
    });
  },
  addtocart: (pid, uid) => {
    let productObject = {
      item: objectID(pid),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.cart_collection)
        .findOne({ user: objectID(uid) });
      if (cart) {
        let productExist = cart.products.findIndex(
          (product) => product.item == pid
        );
        if (productExist != -1) {
          db.get()
            .collection(collection.cart_collection)
            .updateOne(
              { user: objectID(uid), "products.item": objectID(pid) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          //if cart already exist for a particular user just update it
          db.get()
            .collection(collection.cart_collection)
            .updateOne(
              { user: objectID(uid) },
              {
                $push: { products: productObject },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectID(uid),
          products: [productObject],
        };
        db.get()
          .collection(collection.cart_collection)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  addtoWhishlist: (pid, uid) => {
    let proObj = {
      item: objectID(pid),
    };
    return new Promise(async (resolve, reject) => {
      let wishCart = await db
        .get()
        .collection(collection.whishlist_collection)
        .findOne({ user: objectID(uid) });
      if (wishCart) {
        let proExist = wishCart.products.findIndex(
          (product) => product.item == pid
        );

        if (proExist != -1) {
          db.get()
            .collection(collection.whishlist_collection)
            .updateOne(
              { user: objectID(uid) },
              {
                $pull: { products: proObj },
              }
            )
            .then((response) => {
              console.log("deleted");
              resolve();
            });
        } else {
          db.get()
            .collection(collection.whishlist_collection)
            .updateOne(
              { user: objectID(uid) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let wishObj = {
          user: objectID(uid),
          products: [proObj],
        };

        db.get()
          .collection(collection.whishlist_collection)
          .insertOne(wishObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  addAddress: (address) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.address_collection)
        .insertOne(address)
        .then((response) => {
          resolve();
        });
    });
  },

  viewUser: (uid) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.user_collection)
        .findOne({ _id: objectID(uid) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getAddress: (uid) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.address_collection)
        .find({ userid: uid })
        .toArray();
      resolve(data);
    });
  },
  getEditAddress: (Aid) => {
    try {
      return new Promise(async (resolve, reject) => {
        let getEdit = await db
          .get()
          .collection(collection.address_collection)
          .findOne({ _id: objectID(Aid) });
        resolve(getEdit);
      });
    } catch (err) {
      console.log("Error that occured in the getEditAddress" + err);
      res.redirect("/serverError");
    }
  },

  editAddress: (addressId, addressDetails) => {
    const { full_name, house, phone, country, state, district, pincode } =
      addressDetails; //object constructering
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.address_collection)
          .updateOne(
            { _id: objectID(addressId) },
            {
              $set: {
                full_name: full_name,
                house: house,
                phone: phone,
                country: country,
                state: state,
                district: district,
                pincode: pincode,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } catch (err) {
        console.log("Error that occurred in editAddress function" + err);
        res.redirect("/serverError");
      }
    });
  },
  deleteAddress: (deleteId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.address_collection)
        .deleteOne({ _id: objectID(deleteId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getWhishlist: (uid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let list = await db
          .get()
          .collection(collection.whishlist_collection)
          .aggregate([
            {
              $match: { user: objectID(uid) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: { item: "$products.item" },
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
              $unwind: "$product",
            },
            // {
            //     $project:{
            //         item:1,
            //         product:{$arrayElemAt:['$product',0]}
            //     }
            // }
          ])
          .toArray();
        resolve(list);
      } catch (err) {
        console.log("Error that occurred in get whishlist function" + err);
        res.redirect("/serverError");
      }
    });
  },
  deleteWhishlist: (whishlist) => {
    try {
      const { wishid, productid } = whishlist;
      console.log(typeof productid);
      console.log(wishid);
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.whishlist_collection)
          .updateOne(
            { _id: objectID(wishid) },
            {
              $pull: { products: { item: ObjectID(productid) } },
            }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (err) {
      console.log("Error that occurred in the deleteWhishlist" + err);
      res.redirect("/serverError");
    }
  },
  changePassword: (userid, passbody) => {
    try {
      const { old_password, new_password, confirm_password } = passbody;
      return new Promise(async (resolve, reject) => {
        let user = await db
          .get()
          .collection(collection.user_collection)
          .findOne({ _id: objectID(userid) });
        var oldPassword = await bcrypt.compare(old_password, user.password);
        console.log(oldPassword);
        if (oldPassword == true) {
          if (new_password == confirm_password) {
            var newP = await bcrypt.hash(new_password, 10);
            console.log(newP);
            db.get()
              .collection(collection.user_collection)
              .updateOne(
                { _id: objectID(userid) },
                {
                  $set: {
                    password: newP,
                  },
                }
              )
              .then((data) => {
                resolve(data);
              });
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.log("Error that occured in the change password function" + err);
      res.redirect("/serverError");
    }
  },
  getProfile: (uid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.user_collection)
        .findOne({ _id: objectID(uid) })
        .then((data) => {
          resolve(data);
        });
    });
  },

  editProfile: (uid, editBody) => {
    try {
      const { user, email } = editBody;
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.user_collection)
          .updateOne(
            { _id: objectID(uid) },
            {
              $set: {
                user: user,
                email: email,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (err) {
      console.log("Error that occured in the edit profile function" + err);
      res.redirect("/serverError");
    }
  },
};
