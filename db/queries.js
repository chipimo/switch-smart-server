const knex = require("../knex"); // the connection!
const uuidv4 = require("uuid/v1");
const { HandelNewProducts } = require("./products");
const moment = require("moment");

function CreateId() {
  return uuidv4();
}

var check = moment(new Date());
var day = check.format("dddd"); // => ('Monday' , 'Tuesday' ----)
var month = check.format("MMMM"); // => ('January','February.....)
var year = check.format("YYYY");

const weekOfMonth = (date) => {
  let weekInYearInedx = date.week();
  if (date.year() != date.weekYear()) {
    weekInYearInedx = date.clone().subtract(1, "week").week() + 1;
  }
  const weekIndex = weekInYearInedx - moment(date).startOf("month").week() + 1;
  return weekIndex;
};

function _Getdata(table, type, sendCallback) {
  switch (type.state) {
    case "all":
      knex
        .select()
        .from(table)
        .then(function (data) {
          if (data.length !== 0) {
            callback({
              hasData: true,
              data,
            });
          } else {
            callback({
              hasData: false,
            });
          }
        });
      break;
    case "spec":
      knex
        .select()
        .from(table)
        .where(type.id, type.value)
        .then(function (data) {
          if (data.length !== 0) {
            sendCallback({
              hasData: true,
              data,
            });
          } else {
            sendCallback({
              hasData: false,
            });
          }
        });

    default:
      break;
  }
}

module.exports = {
  _getAllUsers(socketId, callback) {
    knex
      .select()
      .from("users")
      .then(function (user) {
        if (user.length === 0) {
          knex("users")
            .insert({
              user_id: CreateId(),
              Password: "1234",
              NotificationId: "",
            })
            .then(function () {});
        }
        callback({
          socketId: socketId,
          user,
        });
      })
      .catch((err) => {
        callback({ Error: true, msg: err });
      });
  },

  _getUser_ById(user_credentials, callback) {
    knex
      .select()
      .from("users")
      .where("user_id", user_credentials.user.id)
      .then(function (user) {
        if (user.length === 0) {
          callback({
            isSet: false,
            socketId: user_credentials.socketId,
            userData: { isRegistered: false, credentials: user },
          });
        } else {
          callback({
            isSet: true,
            socketId: user_credentials.socketId,
            userData: { isRegistered: true, credentials: user },
          });
        }
      });
  },

  _getUser_ByUserName(user_credentials, callback) {
    knex
      .select()
      .from("users")
      .where("email", user_credentials.user.email)
      .then(function (user) {
        if (user.length === 0) {
          callback({
            isSet: false,
            socketId: user_credentials.socketId,
            userData: { isRegistered: false, credentials: user },
          });
        } else {
          callback({
            isSet: true,
            socketId: user_credentials.socketId,
            userData: { isRegistered: true, credentials: user },
          });
        }
      });
  },

  _getAllProudcts(productData, callback) {
    knex
      .select()
      .from("products")
      .then(function (product) {
        callback({
          Error: true,
          socketId: productData.socketId,
          productData: { product },
        });
      })
      .catch((err) => {
        callback({ Error: true });
      });
  },

  _putNewProudct(data, callback) {
    // let
    knex(data.data.pdf_type)
      .insert({
        id: data.data.pdf_id,
        name: data.data.pdf_name,
        downloads: "0",
        state: "",
        link: data.data.pdfURL,
        overview: { about: data.data.pdf_about },
        comment_status: {},
        author: data.data.userId,
        featured_image: {},
        price: data.data.pdf_price,
        secure_url: "",
        is_active: true,
      })
      .then(function () {
        knex
          .select()
          .from(data.data.pdf_type)
          .where("author", data.data.userId)
          .then(function (product) {
            callback({
              socketId: data.socketId,
              productData: { product },
            });
          });
      });
  },

  _putNewUser(user_credentials, callback) {
    knex
      .select()
      .from("users")
      .then(function (user) {
        if (user.length === 0) {
          let userId = CreateId();

          knex("users")
            .insert({
              user_id: userId,
              Password: "1234",
              NotificationId: "",
            })
            .then(function () {});
        }
      });
  },

  _SalesReports(props, sendCallback) {
    knex("sales_reports_tikets")
      .insert({
        id: props.Userdata.data.id,
        Year: props.Userdata.data.year,
        Day: props.Userdata.data.day,
        Month: props.Userdata.data.month,
        InvoiceNumber: props.Userdata.data.invoiceNumber,
        TicketList: JSON.stringify({ list: props.Userdata.data.ticketList }),
        Customer: JSON.stringify(props.Userdata.data.Customer),
        GrandTotal: props.Userdata.data.GrandTotal,
        AmountPaid: props.Userdata.data.AmountPaid,
        ChangeDue: props.Userdata.data.ChangeDue,
        Balance: props.Userdata.data.Balance,
        RtxGrandTotal: props.isTaxInvoice
          ? props.Userdata.data.GrandTotal
          : props.paymentType === "Credit Card"
          ? props.Userdata.data.GrandTotal
          : props.Userdata.data.RtxGrandTotal,
        RtxAmountPaid: props.isTaxInvoice
          ? props.Userdata.data.AmountPaid
          : props.paymentType === "Credit Card"
          ? props.Userdata.data.AmountPaid
          : props.Userdata.data.RtxAmountPaid,
        RtxChangeDue: props.isTaxInvoice
          ? props.Userdata.data.ChangeDue
          : props.paymentType === "Credit Card"
          ? props.Userdata.data.ChangeDue
          : props.Userdata.data.RtxChangeDue,
        RtxBalance: props.isTaxInvoice
          ? props.Userdata.data.Balance
          : props.paymentType === "Credit Card"
          ? props.Userdata.data.Balance
          : props.Userdata.data.RtxBalance,
        Discount: props.Userdata.data.Discount,
        Date: props.Userdata.data.Date,
        Datetrack: props.Userdata.data.Datetrack,
        Department: props.Userdata.data.department,
        User: props.Userdata.data.user,
        PaymentType: props.Userdata.data.paymentType,
        isTaxInvoice: props.Userdata.data.isTaxInvoice,
        Note: props.Userdata.data.note,
        totalTaxFinal: props.Userdata.data.totalTaxFinal,
        totalTax: props.Userdata.data.totalTax,
        time: props.Userdata.data.time,
      })
      .then(function () {
        knex
          .select()
          .from("sales_reports_totals")
          .where("Department", props.Userdata.data.department)
          .then(function (MainData) {
            if (MainData.length === 0) {
              knex("sales_reports_totals")
                .insert({
                  id: props.Userdata.data.id,
                  Year: props.Userdata.data.year,
                  Day: props.Userdata.data.day,
                  Month: props.Userdata.data.month,
                  SrNo: 1,
                  GrandTotal: props.Userdata.data.GrandTotal,
                  AmountPaid: props.Userdata.data.AmountPaid,
                  ChangeDue: props.Userdata.data.ChangeDue,
                  Balance: props.Userdata.data.Balance,
                  RtxGrandTotal: props.isTaxInvoice
                    ? props.Userdata.data.GrandTotal
                    : props.paymentType === "Credit Card"
                    ? props.Userdata.data.GrandTotal
                    : props.Userdata.data.RtxGrandTotal,
                  RtxAmountPaid: props.isTaxInvoice
                    ? props.Userdata.data.AmountPaid
                    : props.paymentType === "Credit Card"
                    ? props.Userdata.data.AmountPaid
                    : props.Userdata.data.RtxAmountPaid,
                  RtxChangeDue: props.isTaxInvoice
                    ? props.Userdata.data.ChangeDue
                    : props.paymentType === "Credit Card"
                    ? props.Userdata.data.ChangeDue
                    : props.Userdata.data.RtxChangeDue,
                  RtxBalance: props.isTaxInvoice
                    ? props.Userdata.data.Balance
                    : props.paymentType === "Credit Card"
                    ? props.Userdata.data.Balance
                    : props.Userdata.data.RtxBalance,
                  Discount: props.Userdata.data.Discount,
                  Date: props.Userdata.data.Date,
                  Datetrack: props.Userdata.data.Datetrack,
                  Department: props.Userdata.data.department,
                  totalTaxFinal: props.Userdata.data.totalTaxFinal,
                  totalTax: props.Userdata.data.totalTax,
                  time: props.Userdata.data.time,
                })
                .then(function () {
                  knex
                    .select()
                    .from("sales_reports_totals")
                    .where({ Day: props.Userdata.data.day })
                    .then(function (data) {
                      sendCallback({
                        socketId: props.socketId,
                        data,
                      });
                    });
                });
            } else {
              knex
                .select()
                .from("sales_reports_totals")
                .where("Date", props.Userdata.data.Date)
                .then(function (data) {
                  if (data.length !== 0) {
                    // console.log(data);
                    // console.log( props.Userdata.data);

                    knex("sales_reports_totals")
                      .where("Date", props.Userdata.data.Date)
                      .update({
                        GrandTotal:
                          props.Userdata.data.GrandTotal + data[0].GrandTotal,
                        AmountPaid:
                          props.Userdata.data.AmountPaid + data[0].AmountPaid,
                        ChangeDue:
                          props.Userdata.data.ChangeDue + data[0].ChangeDue,
                        Balance: props.Userdata.data.Balance + data[0].Balance,
                        RtxGrandTotal: props.isTaxInvoice
                          ? props.Userdata.data.GrandTotal + data[0].GrandTotal
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.GrandTotal + data[0].GrandTotal
                          : props.Userdata.data.RtxGrandTotal +
                            data[0].RtxGrandTotal,
                        RtxAmountPaid: props.isTaxInvoice
                          ? props.Userdata.data.AmountPaid + data[0].AmountPaid
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.AmountPaid + data[0].AmountPaid
                          : props.Userdata.data.RtxAmountPaid +
                            data[0].RtxAmountPaid,
                        RtxChangeDue: props.isTaxInvoice
                          ? props.Userdata.data.ChangeDue + data[0].ChangeDue
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.ChangeDue + data[0].ChangeDue
                          : props.Userdata.data.RtxChangeDue +
                            data[0].RtxChangeDue,
                        RtxBalance: props.isTaxInvoice
                          ? props.Userdata.data.Balance + data[0].Balance
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.Balance + data[0].Balance
                          : props.Userdata.data.RtxBalance + data[0].RtxBalance,
                        Discount:
                          props.Userdata.data.Discount + data[0].Discount,
                        totalTaxFinal:
                          props.Userdata.data.totalTaxFinal +
                          Number(data[0].totalTaxFinal),
                        totalTax:
                          props.Userdata.data.totalTax +
                          Number(data[0].totalTax),
                      })
                      .then(function () {
                        knex
                          .select()
                          .from("sales_reports_totals")
                          .where({
                            Day: props.Userdata.data.day,
                          })
                          .then(function (data) {
                            sendCallback({
                              socketId: props.socketId,
                              data,
                            });
                          });
                      });
                  } else {
                    knex("sales_reports_totals")
                      .insert({
                        id: props.Userdata.data.id,
                        Year: props.Userdata.data.year,
                        Day: props.Userdata.data.day,
                        Month: props.Userdata.data.month,
                        SrNo: MainData.length + 1,
                        GrandTotal: props.Userdata.data.GrandTotal,
                        AmountPaid: props.Userdata.data.AmountPaid,
                        ChangeDue: props.Userdata.data.ChangeDue,
                        Balance: props.Userdata.data.Balance,
                        RtxGrandTotal: props.isTaxInvoice
                          ? props.Userdata.data.GrandTotal
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.GrandTotal
                          : props.Userdata.data.RtxGrandTotal,
                        RtxAmountPaid: props.isTaxInvoice
                          ? props.Userdata.data.AmountPaid
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.AmountPaid
                          : props.Userdata.data.RtxAmountPaid,
                        RtxChangeDue: props.isTaxInvoice
                          ? props.Userdata.data.ChangeDue
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.ChangeDue
                          : props.Userdata.data.RtxChangeDue,
                        RtxBalance: props.isTaxInvoice
                          ? props.Userdata.data.Balance
                          : props.paymentType === "Credit Card"
                          ? props.Userdata.data.Balance
                          : props.Userdata.data.RtxBalance,
                        Discount: props.Userdata.data.Discount,
                        Date: props.Userdata.data.Date,
                        Datetrack: props.Userdata.data.Datetrack,
                        Department: props.Userdata.data.department,
                        totalTaxFinal: props.Userdata.data.totalTaxFinal,
                        totalTax: props.Userdata.data.totalTax,
                        time: props.Userdata.data.time,
                      })
                      .then(function () {
                        knex
                          .select()
                          .from("sales_reports_totals")
                          .where({
                            Day: props.Userdata.data.day,
                          })
                          .then(function (data) {
                            sendCallback({
                              socketId: props.socketId,
                              data,
                            });
                          });
                      });
                  }
                });
            }
          });
      });
  },

  _GetSalesReports(props, sendCallback) {
    knex
      .select()
      .from("sales_reports_totals")
      .where({ [props.Userdata.dateType]: props.Userdata.date })
      .then(function (data) {
        sendCallback({
          socketId: props.socketId,
          data,
        });
      });
  },

  _SetTranferReports(props, sendCallback) {
    knex("inventory_transfer")
      .insert(trans)
      .then(function (data) {
        sendCallback({
          socketId: props.socketId,
          data,
        });
      });
  },

  _GetTranferReports(props, sendCallback) {
    knex
      .select()
      .from("inventory_transfer")
      .then(function (data) {
        sendCallback({
          socketId: props.socketId,
          data,
        });
      });
  },

  _GetAllSalesReports(props, sendCallback) {
    knex
      .select()
      .from("sales_reports_totals")
      .then(function (data) {
        sendCallback({
          socketId: props.socketId,
          data,
        });
      });
  },

  _GetTicketsReports(props, sendCallback) {
    knex
      .select()
      .from("sales_reports_tikets")
      .where({ Datetrack: props })
      .then(function (data) {
        sendCallback({
          data,
        });
      });
  },

  _GetDepartments(props, sendCallback) {
    knex
      .select()
      .from("departments_config")
      .then(function (departments) {
        if (departments.length !== 0)
          sendCallback({
            socketId: props.socketId,
            data: { exist: true, departments },
          });
        else sendCallback({ socketId: props.socketId, data: { exist: false } });
      });
  },

  _SetDepartment(props, sendCallback) {
    _Getdata(
      "departments_config",
      { state: "spec", id: "dep_name", value: props.Userdata.department },
      (callback) => {
        if (callback.hasData)
          return sendCallback({
            socketId: props.socketId,
            data: { alreadyExist: true },
          });
        else {
          knex("departments_config")
            .insert({
              id: CreateId(),
              dep_name: props.Userdata.department,
              theme: "dark",
              phone: props.Userdata.phone,
              shopNo: props.Userdata.shopNo,
              road: props.Userdata.road,
              state: props.Userdata.state,
              country: props.Userdata.country,
              tpin: props.Userdata.tpin,
              taxType: props.Userdata.taxType,
              taxRat: props.Userdata.taxRat,
              date: props.Userdata.date,
              user: props.Userdata.user,
              notifications: { notificationId: CreateId(), list: [] },
            })
            .then(function () {
              knex
                .select()
                .from("departments_config")
                .where("dep_name", props.Userdata.department)
                .then(function (departments) {
                  sendCallback({
                    socketId: props.socketId,
                    data: { alreadyExist: false, departments },
                  });
                });
            });
        }
      }
    );
  },

  _UpdateUsersDepartment(props, sendCallback) {
    knex
      .select()
      .from("departments_config")
      .where("dep_name", props.Userdata.department)
      .then(function (department) {
        // console.log(department[0].user.Users);
        var key = department[0].user.Users.length + 1;

        var temp = {
          id: props.Userdata.id,
          key: key,
          pin: props.Userdata.pin,
          userName: props.Userdata.userName,
          prevarges: props.Userdata.prevarges,
          department: props.Userdata.department,
          notifications: props.Userdata.notifications,
        };

        department[0].user.Users.push(temp);

        knex("departments_config")
          .where("dep_name", props.Userdata.department)
          .update({
            user: { Users: department[0].user.Users },
          })
          .then(function () {
            knex
              .select()
              .from("departments_config")
              .then(function (departments) {
                sendCallback({
                  socketId: props.socketId,
                  data: { exist: true, departments },
                });
              });
          });
      });
  },

  _EditDepartment(props, sendCallback) {
    knex("departments_config")
      .where("id", props.Userdata.id)
      .update({
        dep_name: props.Userdata.dep_name,
        phone: props.Userdata.phone,
        shopNo: props.Userdata.shopNo,
        road: props.Userdata.road,
        tpin: props.Userdata.tpin,
        taxType: props.Userdata.taxType,
        taxRat: props.Userdata.taxRat,
      })
      .then(function () {
        knex
          .select()
          .from("departments_config")
          .then(function (departments) {
            sendCallback({
              socketId: props.socketId,
              data: { exist: true, departments },
            });
          });
      });
  }, 

  _GetBackUp(props, sendCallback) {
    HandelNewProducts(props, (callback) => {
      sendCallback({
        socketId: props.socketId,
        data: callback,
      });
    });
  },

  _StartWorkPeroid(props, sendCallback) {
    var week = `week_` + weekOfMonth(moment(new Date()));
    var tempId = CreateId();
    knex("work_period")
      .insert({
        id: tempId,
        year,
        month,
        day,
        week,
        dateStarted: props.dateStarted,
        dateStartedString: props.dateStartedString,
        dateEnded: "",
        dateEndedString: "",
        time: props.time,
        timeEnded: "",
        date: props.date,
        note: props.note,
        department: props.department,
        workedFor: "",
        ticket_count: 0,
        sales_total: 0,
        isOpen: true,
      })
      .then(function () {
        knex
          .select()
          .from("work_period")
          .where({ id: tempId })
          .then(function (data) {
            sendCallback({ isDone: true, data });
          });
      });
  },

  _EndWorkPeroid(props, sendCallback) {
    // console.log(props);

    knex("work_period")
      .where("id", props.id)
      .update({
        dateEnded: props.dateEnded,
        dateEndedString: props.dateEndedString,
        timeEnded: props.timeEnded,
        workedFor: props.workedFor,
        isOpen: false,
      })
      .then(function () {
        knex
          .select()
          .from("work_period")
          .then(function (data) {
            sendCallback({ isDone: true, data });
          });
      });
  },

  _RunBackUp(props, sendCallback) {
    if (props.data.type === "tikets") {
      var loopLength = 0;

      props.data.data.map((list) => {
        loopLength++;

        _Getdata(
          "sales_reports_tikets",
          {
            state: "spec",
            id: "id",
            value: list.id,
          },
          (resultCallback) => {
            // console.log(resultCallback.hasData);
            if (!resultCallback.hasData) {
              knex("sales_reports_tikets")
                .insert({
                  id: list.id,
                  Year: list.Year,
                  Day: list.Day,
                  Month: list.Month,
                  InvoiceNumber: list.InvoiceNumber,
                  TicketList: list.TicketList,
                  Customer: list.Customer,
                  GrandTotal: list.GrandTotal,
                  AmountPaid: list.AmountPaid,
                  ChangeDue: list.ChangeDue,
                  Balance: list.Balance,
                  RtxGrandTotal: list.RtxGrandTotal,
                  RtxAmountPaid: list.RtxAmountPaid,
                  RtxChangeDue: list.RtxChangeDue,
                  RtxBalance: list.RtxBalance,
                  Discount: list.Discount,
                  Date: list.Date,
                  Datetrack: list.Datetrack,
                  Department: list.Department,
                  User: list.User,
                  PaymentType: list.PaymentType,
                  isTaxInvoice: list.isTaxInvoice,
                  Note: list.Note,
                  totalTaxFinal: list.totalTaxFinal,
                  totalTax: list.totalTax,
                  time: list.time,
                })
                .then(function () {
                  if (props.data.data.length === loopLength) {
                    sendCallback({
                      Done: true,
                      Datetrack: list.Datetrack,
                      isAverabel: false,
                      socketId: props.socketId,
                      id: list.id,
                      type: "tikets",
                    });
                  } else {
                    sendCallback({
                      Done: false,
                      Datetrack: list.Datetrack,
                      isAverabel: false,
                      socketId: props.socketId,
                      id: list.id,
                      type: "tikets",
                    });
                  }
                });
            } else
              sendCallback({
                Done: true,
                Datetrack: list.Datetrack,
                isAverabel: true,
                socketId: props.socketId,
                id: list.id,
                type: "tikets",
              });
          }
        );
      });
    } else if (props.type === "totals") {
      // console.log(props);
      
      var loopLength = 0;

      props.data.data.map((list) => {
        loopLength++;

        _Getdata(
          "sales_reports_totals",
          {
            state: "spec",
            id: "id",
            value: list.id,
          },
          (resultCallback) => {
            // console.log(resultCallback.hasData);
            if (!resultCallback.hasData) {
              knex("sales_reports_totals")
                .insert({
                  id: list.id,
                  Year: list.Year,
                  Day: list.Day,
                  Month: list.Month,
                  SrNo: list.SrNo,
                  GrandTotal: list.GrandTotal,
                  AmountPaid: list.AmountPaid,
                  ChangeDue: list.ChangeDue,
                  Balance: list.Balance,
                  RtxGrandTotal: list.RtxGrandTotal,
                  RtxAmountPaid: list.RtxAmountPaid,
                  RtxChangeDue: list.RtxChangeDue,
                  RtxBalance: list.RtxBalance,
                  Discount: list.Discount,
                  Date: list.Date,
                  Datetrack: list.Datetrack,
                  Department: list.Department,
                  totalTaxFinal: list.totalTaxFinal,
                  totalTax: list.totalTax,
                  time: list.time,
                })
                .then(function () {
                  if (props.data.data.length === loopLength) {
                    sendCallback({
                      Done: true,
                      Datetrack: list.Datetrack,
                      isAverabel: false,
                      socketId: props.socketId,
                      id: list.id,
                      type: "totals",
                    });
                  } else {
                    sendCallback({
                      Done: false,
                      Datetrack: list.Datetrack,
                      isAverabel: false,
                      socketId: props.socketId,
                      id: list.id,
                      type: "totals",
                    });
                  }
                });
            } else
              sendCallback({
                Done: true,
                Datetrack: list.Datetrack,
                isAverabel: true,
                socketId: props.socketId,
                id: list.id,
                type: "tikets",
              });
          }
        );
      });
    }
  },

  _GetWorkPeroid(props, sendCallback) {},
};
