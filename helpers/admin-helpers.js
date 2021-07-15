const NAME_COLLECTION = require("../config/nameCollections");
const PROMISE = require("promise");
const { resolve, reject } = require("promise");
const db = require("../config/dataBaseConnection");
const ObjectId = require("mongodb").ObjectID;
const { response } = require("express");
var voucher_codes = require("voucher-code-generator");
var bcrypt = require("bcrypt");

module.exports = {
  adminLogin: (adminData) => {
    return new PROMISE(async (resolve, reject) => {
      console.log(adminData);
      let adminLoginStatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(NAME_COLLECTION.ADMIN_COLLECTION)
        .findOne({ username: adminData.username });
      if (admin && admin.username) {
        await bcrypt
          .compare(adminData.password, admin.password)
          .then((status) => {
            if (status) {
              console.log(`Login Success`);
              response.admin = admin;
              response.status = true;
              resolve(response);
            } else {
              console.log(`Login Failed`);
              resolve({ status: false });
            }
          });
      } else {
        console.log(`Login Failed`);
        resolve({ status: false });
      }
    });
  },
  addProductCategory: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.CATEGORY_COLLECTION)
        .insertOne(categoryName)
        .then((data) => {
          console.log(data.ops[0]);
          resolve(data.ops[0]._id);
        });
    });
  },
  getAllProductCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(NAME_COLLECTION.CATEGORY_COLLECTION)
        .find({})
        .toArray();
      resolve(category);
    });
  },
  deleteCategory: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.CATEGORY_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          console.log("category item delted");
          resolve({ categoryRemove: true });
        });
    });
  },
  editProductCategory: (id, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.CATEGORY_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              category: data.category,
            },
          }
        )
        .then(() => resolve());
    });
  },
  getOneCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((category) => {
          resolve(category);
        });
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .find({ block: "unblock" })
        .toArray()
        .then((user) => resolve(user));
    });
  },
  // get blocked users/
  getBlockedUsers: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .find({ block: "block" })
        .toArray()
        .then((users) => {
          resolve(users);
        });
    });
  },
  // block user
  banUser: (id, value) => {
    console.log(id, value);
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: { block: value },
          }
        )
        .then((data) => {
          resolve({ block: true });
        })
        .catch(() => {
          resolve();
        });
    });
  },
  // get all users count
  getUsersCount: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .countDocuments({});
      // console.log(users);
      resolve(users);
    });
  },
  // get all vendors count
  getVendorsCount: () => {
    return new Promise(async (resolve, reject) => {
      let vendors = await db
        .get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .countDocuments({});
      // console.log(vendors);
      resolve(vendors);
    });
  },
  // get products count
  getProductsCount: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .countDocuments({});
      // console.log(products);
      resolve(products);
    });
  },

  // get all vendor
  getAllVendor: () => {
    return new Promise(async (resolve, reject) => {
      let vendor = await db
        .get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .find({ status: "unblock" })
        .toArray();
      resolve(vendor);
    });
  },

  // get blocked vendors
  getBlockedVendor: () => {
    return new Promise(async (resolve, reject) => {
      let vendor = await db
        .get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .find({ status: "block" })
        .toArray();
      resolve(vendor);
    });
  },
  // vendor status change
  VendorStatusChange: (id, value) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              status: value,
            },
          }
        )
        .then((response) => {
          resolve({ vendorStatusChange: true });
        });
    });
  },

  // generate coupen
  generateCoupen: (amount) => {
    return new Promise(async (resolve, reject) => {
      let coupen = await voucher_codes.generate({
        prefix: "FLAT_",
        postfix: `_${amount.discound}`,
      });
      console.log(coupen);
      resolve(coupen);
    });
  },

  // add coupen collection
  addCoupon: (data) => {
    let coupenObj = {
      admin: ObjectId(data.adminID),
      discound: data.discound,
      coupenCode: data.coupenCode,
      createdBy: "Admin",
      type: "global",
      users: [],
    };
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .insertOne(coupenObj)
        .then((response) => {
          resolve({ coupenAddedd: true });
        });
    });
  },
  getAdminCoupen: (id) => {
    console.log("id");
    console.log(id);
    return new Promise(async (resolve, reject) => {
      let coupon = await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .find({ admin: ObjectId(id) })
        .toArray();

      console.log(coupon);
      resolve(coupon);
    });
  },
  getSingleCoupen: (id) => {
    return new Promise(async (resolve, reject) => {
      let coupens = await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(id) },
          },
          {
            $lookup: {
              from: NAME_COLLECTION.CATEGORY_COLLECTION,
              localField: "categoryID",
              foreignField: "_id",
              as: "cat",
            },
          },
          {
            $project: {
              _id: 1,
              admin: 1,
              categoryID: 1,
              discound: 1,
              coupenCode: 1,
              cat: { $arrayElemAt: ["$cat", 0] },
            },
          },
        ])
        .toArray();
      console.log(coupens[0]);
      resolve(coupens[0]);
    });
  },
  // update coupen
  updateCoupen: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .updateOne(
          { _id: ObjectId(data.coupenID) },
          {
            $set: {
              discound: data.discound,
              coupenCode: data.coupenCode,
            },
          }
        )
        .then((response) => {
          resolve({ CoupenUpdated: true });
        });
    });
  },
  // delete coupen
  deleteCoupen: (id) => {
    console.log(id);
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          // console.log(response);
          resolve({ coupenDeleted: true });
        });
    });
  },
  getSalesReport: () => {
    return new Promise(async (resolve, reject) => {
      let salesReport = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          { $match: { orderStatus: "Order Placed" } },
          {
            $lookup: {
              from: NAME_COLLECTION.VENDOR_COLLECTION,
              localField: "order.product.vendorID",
              foreignField: "_id",
              as: "vendor",
            },
          },
          {
            $unwind: "$vendor",
          },
        ])
        .toArray();
      console.log(salesReport);
      resolve(salesReport);
    });
  },
  salesReportWithinRange: (min, max) => {
    console.log(min);
    console.log(max);
    return new Promise(async (resolve, reject) => {
      let report = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { orderStatus: "Order Placed" },
                {
                  date: { $gte: min, $lte: max },
                },
              ],
            },
          },
          {
            $lookup: {
              from: NAME_COLLECTION.VENDOR_COLLECTION,
              localField: "order.product.vendorID",
              foreignField: "_id",
              as: "vendor",
            },
          },
          {
            $unwind: "$vendor",
          },
        ])
        .toArray();
      resolve(report);
    });
  },
};
