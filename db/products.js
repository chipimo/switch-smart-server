const knex = require("../knex"); // the connection!
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const { Purchases } = require("./purchases");

const dateNow = new Date(); // Creating a new date object with the current date and time
const year = dateNow.getFullYear(); // Getting current year from the created Date object
const monthWithOffset = dateNow.getUTCMonth() + 1; // January is 0 by default in JS. Offsetting +1 to fix date for calendar.
const month = // Setting current Month number from current Date object
  monthWithOffset.toString().length < 2 // Checking if month is < 10 and pre-prending 0 to adjust for date input.
    ? `0${monthWithOffset}`
    : monthWithOffset;
const date =
  dateNow.getUTCDate().toString().length < 2 // Checking if date is < 10 and pre-prending 0 if not to adjust for date input.
    ? `0${dateNow.getUTCDate()}`
    : dateNow.getUTCDate();

const DateNumInput = `${year}${month}${date}`;

function CreateId() {
  return uuidv1();
}

function GetData(props, hook, callback) {
  hook
    .select()
    .from(props.table)
    .where(props.id, props.value)
    .then(function (data) {
      callback({
        data,
      });
    });
}

module.exports = {
  HandelNewProducts(props, sendCallback) {
    var isMulity = false;
    var multi = [];

    switch (props.data._type) {
      case "set":
        var recipe =
          props.data.recipe === "" ? props.data.group : props.data.recipe;
        var productKey = uuidv1();
        if (props.data.portion.length !== 1) isMulity = true;

        var tatolCostPrice = 0;
        var tatolSellingPrice = 0;
        var tatolProductQty = 0;

        if (isMulity)
          props.data.portion.map((data) => {
            tatolCostPrice = parseInt(data.costPrice) + tatolCostPrice;
            tatolProductQty = parseInt(data.quantity) + tatolProductQty;
            tatolSellingPrice = parseInt(data.price) + tatolSellingPrice;
          });
        else {
          tatolCostPrice = parseInt(props.data.portion[0].costPrice);
          tatolProductQty = parseInt(props.data.portion[0].quantity);
          tatolSellingPrice = parseInt(props.data.portion[0].price);
        }

        GetData(
          { table: "Tabs", id: "tabname", value: props.data.group },
          knex,
          (Tabcallback) => {
            // console.log(Tabcallback.data[0].isTaxEnabled);
            if (Tabcallback.data.length === 0) {
              knex("Tabs")
                .insert({
                  id: uuidv1(),
                  tabname: props.data.group,
                  branch: props.data.branch,
                  background: props.data.group.colors.backgroundColor,
                  color: props.data.group.colors.textColor,
                  buttonType: "default",
                  isInstore: true,
                  isTaxEnabled: true,
                })
                .then(function () {
                  GetData(
                    {
                      table: "products",
                      id: "ItemName",
                      value: props.data.name,
                    },
                    knex,
                    async (callback) => {
                      if (callback.data.length === 0) {
                        knex("products")
                          .insert({
                            productKey: uuidv1(),
                            group: props.data.group.id,
                            category: recipe,
                            ItemName: props.data.name,
                            barcode1:
                              props.data.portion.length !== 1
                                ? ""
                                : props.data.portion[0].barcode1,
                            barcode2:
                              props.data.portion.length !== 1
                                ? ""
                                : props.data.portion[0].barcode2,
                            barcode3:
                              props.data.portion.length !== 1
                                ? ""
                                : props.data.portion[0].barcode3,
                            barcode4:
                              props.data.portion.length !== 1
                                ? ""
                                : props.data.portion[0].barcode4,
                            barcode5:
                              props.data.portion.length !== 1
                                ? ""
                                : props.data.portion[0].barcode5,
                            branches: props.data.branch,
                            supplier: props.data.ProductSupplier.supplierKey,
                            sallingprice: isMulity
                              ? tatolSellingPrice
                              : props.data.portion[0].price,
                            initalPrice: isMulity
                              ? tatolSellingPrice
                              : props.data.portion[0].price,
                            buyingPrice: tatolCostPrice,
                            qnt: 1,
                            multiplier: 0,
                            alertOut: isMulity
                              ? 0
                              : props.data.portion[0].alertOut,
                            amountInstore: tatolProductQty,
                            sync: true,
                            expiryDate:'',
                            isExpired: false,
                            isMaster: props.data.MasterState,
                            isInstore: true,
                            isTaxEnabled: true,
                            isMulity,
                          })
                          .then(function () {
                            const data = {
                              type: "new",
                              productName: props.data.name,
                              group: props.data.group.id,
                              sellingPrice: tatolSellingPrice,
                              sellingPriceOld: tatolSellingPrice,
                              buyingPrice: tatolCostPrice,
                              buyingPriceOld: tatolCostPrice,
                              supplier:
                                props.data.ProductSupplier.supplierKey,
                              quantity: tatolProductQty,
                              invoiceNumber: props.data.invoice,
                              EventDate: moment().format("MM/DD/YYYY"),
                              dateRange: parseInt(DateNumInput),
                              time: moment().format("LT"),
                            };
                            Purchases(knex, data, (callback) => {});

                            if (isMulity) {
                              props.data.portion.map((data) => {
                                knex("mulitProducts")
                                  .insert({
                                    id: uuidv1(),
                                    productName: props.data.name,
                                    sallingprice: parseInt(data.price),
                                    initalPrice: parseInt(data.price),
                                    buyingPrice: parseInt(data.costPrice),
                                    qnt: 1,
                                    barcode1: data.barcode1,
                                    barcode2: data.barcode2,
                                    barcode3: data.barcode3,
                                    barcode4: data.barcode4,
                                    barcode5: data.barcode5,
                                    alertOut: parseInt(data.alertOut),
                                    amountInstore: parseInt(data.quantity),
                                    isInstore: true,
                                    isTaxEnabled: true,
                                  })
                                  .then((result) => {
                                    // console.log(result);
                                  })
                                  .catch((err) => {
                                    // console.log(err);
                                  });
                              });

                              sendCallback({
                                isSet: true,
                                productKey,
                                type: "add",
                              });
                            } else {
                              sendCallback({
                                isSet: true,
                                productKey,
                                type: "add",
                              });
                            }
                          });
                      } else {
                        // alert("This Product already exist");
                      }
                    }
                  );
                });
            } else {
              GetData(
                { table: "products", id: "ItemName", value: props.data.name },
                knex,
                async (callback) => {
                  if (callback.data.length === 0) {
                    knex("products")
                      .insert({
                        productKey: uuidv1(), 
                        group: props.data.group.id,
                        category: recipe,
                        ItemName: props.data.name,
                        barcode1:
                          props.data.portion.length !== 1
                            ? ""
                            : props.data.portion[0].barcode1,
                        barcode2:
                          props.data.portion.length !== 1
                            ? ""
                            : props.data.portion[0].barcode2,
                        barcode3:
                          props.data.portion.length !== 1
                            ? ""
                            : props.data.portion[0].barcode3,
                        barcode4:
                          props.data.portion.length !== 1
                            ? ""
                            : props.data.portion[0].barcode4,
                        barcode5:
                          props.data.portion.length !== 1
                            ? ""
                            : props.data.portion[0].barcode5,
                        branches: props.data.branch,
                        supplier: props.data.ProductSupplier.supplierKey,
                        sallingprice: isMulity
                          ? tatolSellingPrice
                          : props.data.portion[0].price,
                        initalPrice: isMulity
                          ? tatolSellingPrice
                          : props.data.portion[0].price,
                        buyingPrice: tatolCostPrice,
                        qnt: 1,
                        multiplier: 0,
                        alertOut: isMulity ? 0 : props.data.portion[0].alertOut,
                        amountInstore: tatolProductQty,
                        sync: false,
                        expiryDate:'',
                        isExpired: false,
                        isMaster: props.data.MasterState,
                        isInstore: true,
                        isTaxEnabled: true,
                        // isTaxEnabled: Tabcallback.data[0].isTaxEnabled,
                        isMulity,
                      })
                      .then(function () {
                        const data = {
                          type: "new",
                          productName: props.data.name,
                          group: props.data.group.id,
                          sellingPrice: props.data.portion[0].price,
                          sellingPriceOld: props.data.portion[0].price,
                          buyingPrice: tatolCostPrice,
                          buyingPriceOld: tatolCostPrice,
                          supplier: props.data.ProductSupplier.supplierKey,
                          quantity: tatolProductQty,
                          invoiceNumber: props.data.invoice,
                          EventDate: moment().format("MM/DD/YYYY"),
                          dateRange: parseInt(DateNumInput),
                          time: moment().format("LT"),
                        };
                        Purchases(knex, data, (callback) => {});

                        if (isMulity) {
                          props.data.portion.map((data) => {
                            knex("mulitProducts")
                              .insert({
                                id: uuidv1(),
                                productName: props.data.name,
                                sallingprice: parseInt(data.price),
                                initalPrice: parseInt(data.price),
                                buyingPrice: parseInt(data.costPrice),
                                qnt: 1,
                                barcode1: data.barcode1,
                                barcode2: data.barcode2,
                                barcode3: data.barcode3,
                                barcode4: data.barcode4,
                                barcode5: data.barcode5,
                                alertOut: parseInt(data.alertOut),
                                amountInstore: parseInt(data.quantity),
                                isInstore: true,
                                isTaxEnabled: true,
                              })
                              .then((result) => {})
                              .catch((err) => {});
                          });
                          sendCallback({
                            isSet: true,
                            productKey,
                            type: "add",
                          });
                        } else {
                          sendCallback({
                            isSet: true,
                            productKey,
                            type: "add",
                          });
                        }
                      });
                  } else {
                    // alert("This Product already exist");
                  }
                }
              );
            }
          }
        );

        break;

      case "getPOSList":
        switch (props.data.layoutType) {
          case "tabs":
            knex
              .select()
              .from("Tabs")
              .then(function (data) {
                sendCallback({
                  data,
                });
              });
            break;

          case "ProductsList":
            knex
              .select()
              .from("products")
              .where({ group: props.category })
              .then(function (data) {
                sendCallback({
                  data,
                });
              });
            break;
          case "mulitList":
            knex
              .select()
              .from("mulitProducts")
              .where({ productName: props.name })
              .then(function (data) {
                sendCallback({
                  data,
                });
              });
            break;
          case "all_P":
            var tabs = [];
            var categorylist = [];
            var productsList = [];
            var mulitList = [];

            knex
              .select()
              .from("Tabs")
              .where({ department: props.data.dep })
              .then(function (data) {
                tabs = data;

                knex
                  .select()
                  .from("products")
                  .where({ department: props.data.dep })
                  .then(function (data) {
                    productsList = data;

                    knex
                      .select()
                      .from("mulitProducts")
                      .where({ department: props.data.dep })
                      .then(function (data) {
                        mulitList = data;

                        sendCallback({
                          tabs,
                          categorylist,
                          productsList,
                          mulitList,
                        });
                      });
                  });
              });

            break;
          case "all_Products_list":
            var alltabs = [];
            var allproductsList = [];
            var allmulitList = [];

            knex
              .select()
              .from("products")
              .then(function (Productdata) {
                knex
                  .select()
                  .from("mulitProducts")
                  .then(function (Mulitdata) {
                    allproductsList = Productdata;
                    allmulitList = Mulitdata;

                    sendCallback({
                      allproductsList,
                      allmulitList,
                    });
                  });
              });

            break;
          case "all_purcheased":
            knex
              .select()
              .where({ isInstore: true })
              .from("products")
              .then(function (data) {
                sendCallback(data);
              });

            break;
          default:
            break;
        }
        break;
      case "edit":
        // console.log(props);

        if (props.portion === 1) {
          knex("products")
            .where({ productKey: props.data.productKey })
            .update({
              ItemName: props.name,
              barcode1:
                props.portion.length === 1 ? "" : props.portion[0].barcode1,
              barcode2:
                props.portion.length === 1 ? "" : props.portion[0].barcode2,
              barcode3:
                props.portion.length === 1 ? "" : props.portion[0].barcode3,
              barcode4:
                props.portion.length === 1 ? "" : props.portion[0].barcode4,
              barcode5:
                props.portion.length === 1 ? "" : props.portion[0].barcode5,
            })
            .then(function (data) {
              return sendCallback({
                isSet: true,
                type: "update",
                data: { type: "product_update" },
              });
            });
        } else {
          knex("products")
            .where({ productKey: props.data.productKey })
            .update({
              ItemName: props.name,
            })
            .then(function (data) {
              knex
                .select()
                .from("mulitProducts")
                .where({ productName: props.name })
                .then(function (data) {
                  if (data.length === props.portion.length) {
                    // console.log(data);
                    var loopCon = false;
                    data.map((list) => {
                      props.portion.map((dataprops) => {
                        // console.log(data);
                        if (!loopCon)
                          knex("mulitProducts")
                            .where({ id: list.id })
                            .update({
                              productName: props.name,
                              barcode1: dataprops.barcode1,
                              barcode2: dataprops.barcode2,
                              barcode3: dataprops.barcode3,
                              barcode4: dataprops.barcode4,
                              barcode5: dataprops.barcode5,
                              sallingprice: dataprops.price,
                              initalPrice: dataprops.price,
                              alertOut: dataprops.alertOut,
                            })
                            .then(function () {
                              return sendCallback({
                                isSet: true,
                                type: "update",
                                data: { type: "product_update" },
                              });
                            });
                        loopCon = true;
                        return;
                      });
                      loopCon = false;
                    });
                  }
                  // sendCallback({
                  //   data,
                  // });
                });
            });
        }

        break;
      case "delete":
        knex("products")
          .where({ productKey: props.data.selected.productKey })
          .del()
          .then(function (data) {
            return sendCallback({
              isSet: true,
              data: {
                type: "delete",
                recipe: props.data.selected.category,
                group: props.data.selected.group,
                productKey: props.data.selected.ItemName,
              },
            });
          });

        break;

      case "Add_filter":
        props.data.taxMapping.map((list) => {
          knex("products")
            .where({ productKey: list.productKey })
            .andWhere({ department: props.dep })
            .update({
              isTaxEnabled: false,
            })
            .then(function (data) {
              sendCallback({
                isSet: true,
                type: "Add_filter",
              });
            });
        });

        break;

      case "remove_filter":
        props.data.taxMapping.map((list) => {
          knex("products")
            .where({ productKey: list.productKey })
            .andWhere({ department: props.dep })
            .update({
              isTaxEnabled: true,
            })
            .then(function (data) {
              sendCallback({
                isSet: true,
                type: "Add_filter",
              });
            });
        });
        break;

      case "add_to_store":
        props.data.purchaseSelected.map((nodes) => {
          knex("products")
            .where({ productKey: nodes.productKey })
            .andWhere({ department: props.dep })
            .update({
              amountInstore: nodes.quantity
                ? nodes.amountInstore + nodes.quantity
                : nodes.amountInstore + 1,
              isInstore: true,
            })
            .then(function (data) {
              knex("Tabs")
                .where({ tabname: nodes.group })
                .andWhere({ department: props.dep })
                .update({
                  isInstore: true,
                })
                .then(function (data) {});
            });
        });

        sendCallback({
          isSet: true,
        });

        break;

      case "reduce_store":
        props.data.map((list) => {
          // console.log(list);
          knex("products")
            .where({ productKey: list.productKey })
            .update({
              amountInstore: list.amountInstore,
            })
            .then(function (data) {});
        });
        break;

      case "tranfer":
        knex("inventory_transfer")
          .insert({
            name: props.data.selected.ItemName,
            quantity: props.data.value,
            date: moment().format("LLLL"),
            time: moment().format("LT"),
            from: props.data.from,
            to: props.data.to,
          })
          .then(function () {
            sendCallback({
              name: props.data.selected.ItemName,
              isSet: true,
            });
          });

        break;

      default:
        break;
    }
  },
};
