const io = require("./index").io;
const {
  PRODUCT_ENTRY,
  DEVICE_DISCONNECTED,
  HANDEL_WORKPERIODS,
  USER_CONNECTED,
  GETDEPARTMENTS,
  SETDEPARTMENTS,
  GETDEPARTMENTCOFIG,
} = require("./events");
const _ = require("lodash");
const {
  _SalesReports,
  _GetDepartments,
  _SetDepartment,
  _EditDepartment,
  _UpdateUsersDepartment,
  _GetBackUp,
  _GetSalesReports,
  _getAllUsers,
  _GetAllSalesReports,
  _StartWorkPeroid,
  _EndWorkPeroid,
  _GetTicketsReports,
  _RunBackUp,
} = require("./db/queries");
const { HandelNewProducts } = require("./db/products");
require("custom-env").env();
const { SetGroups, GetGroups, DeleteGroups } = require("./db/group");

require("custom-env").env();

var isProcessing = false; 
// var count = 0;

// var $ipsConnected = [];

// io.on("connection", function (socket) {
//   var $ipAddress = socket.handshake.address;

//   if (!$ipsConnected.hasOwnProperty($ipAddress)) {
//     $ipsConnected.push(socket.id);

//     count++;
// console.log(io.engine.clients);

//     socket.emit("counter", { count: count });
//   }

//   console.log("client is connected");

//   /* Disconnect socket */

//   socket.on("disconnect", function () {
//     if ($ipsConnected.hasOwnProperty($ipAddress)) {
//       delete $ipsConnected[$ipAddress];

//       count--;

//       socket.emit("counter", { count: count });
//     }
//   });
// });

function sendDeliveryNote(data) {
  data.connectedUsers.map((list) => {
    if (data.props.from === list.data.dep_name) {
      io.to(list.socketId).emit("DELIVERY_NOTIFICATION", data.props);

      var datalist = {
        _type: "tranfer",
        value: data.props.value,
        selected: data.props.selected,
        isCleared: true,
        data: data.props,
      };

      HandelNewProducts(datalist, (callback) => {});
    }
  });
}

var connectedUsers = [];

module.exports = function (socket) {
  socket.on("connected", () => {
    // console.log(socket.id);
  });

  socket.on("UserConnected", (props) => {
    let data = {
      data: props,
      socketId: socket.id,
    };
    var users = _.findIndex(connectedUsers, data);
    if (users === -1) {
      connectedUsers.push(data);
      io.emit("DEP_LOGGEDIN", {
        name: data.data.dep_name,
        users: connectedUsers,
      });
      // console.log(`${data.data.dep_name} has loggedIn`);
    }
  });

  socket.on("disconnect", () => {
    let data = {
      socketId: socket.id,
      _type: "remove",
    };
    connectedUsers = connectedUsers.filter((x) => x.socketId !== socket.id);
    // console.log(connectedUsers);

    // connectedUsers.map((id, index) => {
    //   if (id.socketId === socket.id) {
    //     console.log(`${id.data.dep_name} has loggedOut`);
    //     connectedUsers.slice(index, 1);
    //   }
    // });
  });

  socket.on("SEND_TRANSTION", (props) => {
    connectedUsers.map((list) => {
      if (props.to === list.data.dep_name) {
        io.to(list.socketId).emit("TRANSFER_NOTIFICATION", props);
        sendDeliveryNote({ connectedUsers, props });
      }
    });
  });

  socket.on("INVENTORY_TRANSFER", (props) => {});

  socket.on("GETPRODUCTES", (props) => {
    var data = {
      socketId: socket.id,
    };
    connectedUsers.map((list) => {
      if (props.to === list.data.dep_name) {
        io.to(list.socketId).emit("TRANSFER_NOTIFICATION", props);
      }
    });
  });

  socket.on("GETBACKUP", (props) => {
    var data = {
      data: { layoutType: "all_Products_list", _type: "getPOSList" },
      socketId: socket.id,
    };
    _GetBackUp(data, (callback) => {
      // console.log(callback);
      io.to(callback.socketId).emit("BACKUPFILES", callback.data);
    });
  });

  socket.on(USER_CONNECTED, (props) => {
    let data = {
      data: props,
      socketId: socket.id,
      _type: "LoggedIn",
    };
  });

  socket.on("UPDATEUSERS", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };
    _UpdateUsersDepartment(Data, (callback) => {});
  });

  socket.on(GETDEPARTMENTS, (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };
    _GetDepartments(Data, (callback) => {
      // console.log(callback);
      io.to(callback.socketId).emit("DEP_RESULT", callback.data);
    });
  });

  socket.on("USER", (data) => {
    let Data = {
      socketId: socket.id,
    };
    // console.log('test');

    _getAllUsers(socket.id, (callback) => {
      io.to(callback.socketId).emit("USER_RESULT", callback);
    });
  });

  socket.on(SETDEPARTMENTS, (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };
    _SetDepartment(Data, (callback) => {
      io.to(callback.socketId).emit("DEP_SET", callback.data);
    });
  });

  socket.on("EDITDEPARTMENTCOFIG", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };

    _EditDepartment(Data, (callback) => {
      io.to(callback.socketId).emit("DEP_SET", callback.data);
    });
  });

  socket.on("GETALLDEPARTMENTS", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };
  });

  socket.on("UPDATENEWPRODCT", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };
    // console.log(Data);
  });

  socket.on("InstData", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id, 
    };
    console.log(Data);
  });

  socket.on("UPDATEPRODCTS", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };
  });
 
  socket.on("SALESREPORT", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };

    if (!isProcessing) {
      isProcessing = true;
      _SalesReports(Data, (callback) => {
        io.emit("SALESREPORTLIST", callback);
      });
    }
    setTimeout(() => {
      isProcessing = false;
    }, 200);
  });

  socket.on("GETSALESREPORT", (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };

    _GetSalesReports(Data, (revicedCallback) => {
      // console.log(revicedCallback.data);
      io.to(revicedCallback.socketId).emit(
        "SALESREPORTSALET",
        revicedCallback.data
      );
    });
  });

  socket.on("GETALLSALESREPORT", (data) => {
    let Data = {
      socketId: socket.id,
    };

    _GetAllSalesReports(Data, (revicedCallback) => {
      io.to(revicedCallback.socketId).emit(
        "SALESREPORTSALETALL",
        revicedCallback.data
      );
    });
  });

  socket.on("GETSALESTICKETS", (data) => {
    _GetTicketsReports(data, (callback) => {
      // console.log(callback);
      io.emit("SALESTICKETRESULT", callback.data);
    });
  });
 
  socket.on("UPDATENEWPROUDCT", (data) => {
    // console.log(data);

    HandelNewProducts(data, (callback) => {
      io.emit("PRODUCTUPDATES", callback);
    }); 
  });

  // socket.on("UPDATENEWPROUDCT", (data) => {
  //   HandelNewProducts(data, (callback) => {
  //     io.emit("UPDATEPRODUSTS", callback);
  //   });
  // });

  socket.on("GETALLPRODUCTS", () => {
    var data = {
      data: { layoutType: "all_Products_list", _type: "getPOSList" },
      socketId: socket.id,
    };
    console.log(data);
    
    HandelNewProducts(data, (callback) => {
      console.log(callback);

      io.to(callback.socketId).emit("ALLPRODUCTSLIST", callback);
    });
  });

  socket.on("UPDATEINVENTORTY", (data) => {
    HandelNewProducts(data, (callback) => {
      // console.log(callback);
      // io.emit("UPDATEINVENTORTY", callback);
    });
  });

  socket.on("DELETEPRODUCT", (datalist) => {
    var data = {
      data: datalist,
      socketId: socket.id,
    };
    HandelNewProducts(data, (callback) => {
      io.emit("DELETEPRODUCTDONE", callback);
    });
  });

  socket.on("SETGROUP", (datalist) => {
    var data = {
      data: datalist,
      socketId: socket.id,
    };

    SetGroups(data, (callback) => {
      io.emit("GROUPSET", callback);
    });
  });

  socket.on("GETGROUPS", () => {
    GetGroups(socket.id, (callback) => {
      io.emit("GROUPSLIST", callback);
    });
  });

  socket.on("DELETEGROUP", (props) => {
    var data = {
      data: props,
      socketId: socket.id,
    };

    DeleteGroups(data, (callback) => {
      io.emit("GROUPSET", callback);
    });
  });

  socket.on(HANDEL_WORKPERIODS, (data) => {
    let Data = {
      Userdata: data,
      socketId: socket.id,
    };
  });

  socket.on("STARTWORKPEROID", (props) => {
    _StartWorkPeroid(props, (reciveCallback) => {
      io.emit("WORKPEROID", reciveCallback.data);
    });
  });

  socket.on("ENDWORKPEROID", (props) => {
    _EndWorkPeroid(props, (reciveCallback) => {
      io.emit("WORKPEROIDENDED", reciveCallback.data);
    });
  });

  socket.on("HANDEL_REPORTS_BACKUP", (props) => {
    const data = {
      data: props,
      socketId: socket.id,
    };
    _RunBackUp(data, (reciveCallback) => {
      // console.log(reciveCallback);
      io.to(reciveCallback.socketId).emit("HANDEL_REPORTS_BACKUP_ISDONE", reciveCallback);
    });
  });
};
