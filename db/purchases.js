const uuidv1 = require("uuid/v1");

module.exports = {
  Purchases(dbhook, props, sendCallback) {
    // console.log(props);
    if (props.type === "new")
      dbhook("purchases")
        .insert({
          purchasesKey: uuidv1(),
          productName: props.productName,
          group: props.group,
          sellingPrice: props.sellingPrice,
          sellingPriceOld: props.sellingPriceOld,
          buyingPrice: props.buyingPrice,
          buyingPriceOld: props.buyingPriceOld,
          supplier: props.supplier,
          quantity: props.quantity,
          invoiceNumber: props.invoiceNumber,
          EventDate: props.EventDate,
          dateRange: props.dateRange,
          time: props.time,
        })
        .then(() => {
          sendCallback(true);
        });
  },
};
