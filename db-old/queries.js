const uuidv4 = require("uuid/v4");
const db = require("./connection");
const fs = require("fs-extra");
const zipper = require("zip-local");
const moment = require("moment");
//  Asyc db

const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");

function CreateId() {
  return uuidv4();
}
// Moment date
var check = moment(new Date());
var day = check.format("dddd"); // => ('Monday' , 'Tuesday' ----)
var month = check.format("MMMM"); // => ('January','February.....)
var year = check.format("YYYY");
var time = check.format("LT");

function RestData(porp, sendCallback) {
  const adapter = new FileAsync("db.json");
  low(adapter).then((tempdb) => {
    tempdb
      .get("departments")
      .push(initalValues)
      .last()
      .write()
      .then((deps) => sendCallback({ isSet, set: true, deps: deps }));
  });
}

function GetData(prop, sendCallback) {
  const dep = db.get(prop.doc).value();
  if (dep) {
    sendCallback({ exist: true, deps: dep });
  } else {
    sendCallback({ exist: false, deps: dep });
  }
}

module.exports = {
  // Get Department
  _GetDepartments(props, sendCallback) {
    const dep = db.get("departments").value();

    if (dep) {
      sendCallback({ exist: true, set: true, deps: dep, id: props.socketId });
    } else {
      sendCallback({ exist: false, set: false, deps: dep, id: props.socketId });
    }
  },

  // Send deparment config
  _SendDepartmentConfig(props, sendCallback) {
    const id = db.get("departments").find({ id: props.Userdata.id }).value();
    var adapter_file = `./db/store/departments/${props.Userdata.file}/config.json`;
    var dir = `./db/store/departments/${props.Userdata.file}`;

    if (id) {
      // const directoryFiles = fs.readdirSync(dir);

      zipper.zip(dir, function (error, zipped) {
        if (!error) {
          zipped.compress(); // compress before exporting

          var buff = zipped.memory(); // get the zipped file as a Buffer

          // or save the zipped file to disk
          zipped.save("package.zip", function (error) {
            if (!error) {
              console.log("saved successfully !");
            }
          });
        }
      });
    } else {
    }
  },

  // Set Department
  _SetDepartment(props, sendCallback) {
    var depsResult = [];
    var isSet = false;
    var depFileName = props.Userdata.department.replace(/ .*/, "");
    var file = `./db/store/departments/${depFileName}/config.json`;

    // inistalaze all files
    var initalValues = {
      id: CreateId(),
      dep: props.Userdata.department,
      file: depFileName,
    };
    // initalDepValues
    var initalDepValues = {
      departments: {
        id: CreateId(),
        dep: props.Userdata.department,
        file: depFileName,
      },
      theme: "light",
      admin: { pass: "1234", user: "Administrator" },
      depInfo: {
        phone: "+260 975 30 30 30",
        shopNo: "",
        road: "",
        state: "",
        tpin: "",
        taxType: "",
        taxRat: 16,
        association: "",
      },
    };

    var files = [
      "Products",
      "Reports",
      "WorkPeriod",
      "Warehouse",
      "Tickets",
      "Pos",
      "Accounts",
      "Users",
    ];

    var admin = {
      id: CreateId(),
      pin: "1234",
      userName: "Adminstartor",
      prevarges: 1,
      notifications: [],
    };

    // Write config files
    fs.ensureFileSync(file);
    var userConfigFile = "";

    files.forEach((fileName) => {
      var filePath = `./db/store/departments/${depFileName}/${fileName}/config.json`;
      if (fileName === "Users") userConfigFile = filePath;
      fs.ensureFileSync(filePath);
    });

    // User Config...
    const adapter = new FileAsync(userConfigFile);
    low(adapter).then((tempdb) => {
      tempdb
        .defaults({
          users: [admin],
        })
        .write();
    });

    // Write file
    GetData({ doc: "departments" }, (reciveCallback) => {
      if (reciveCallback.exist) {
        depsResult = reciveCallback.deps;
      } else {
        db.defaults({ departments: [] }).write();
      }
    });

    depsResult.forEach((element) => {
      if (element.dep === props.Userdata.department) {
        isSet = true;
      }
    });

    // Create database instance and start server
    if (!isSet) {
      db.get("departments")
        .push(initalValues)
        .last()
        .assign({
          created: {
            day,
            month,
            year,
            time,
          },
        })
        .write();

      var adapter_file = `./db/store/departments/${depFileName}/config.json`;
      const adapter = new FileAsync(adapter_file);
      low(adapter).then((tempdb) => {
        isSet = true;
        // assign defaults
        tempdb.defaults(initalDepValues).write();

        tempdb
          .get("departments")
          .last()
          .assign({
            created: {
              day,
              month,
              year,
              time,
            },
          })
          .write()
          .then((deps) =>
            sendCallback({
              isSet,
              set: true,
              deps: deps,
              config: initalDepValues,
              files,
              id: props.socketId,
              admin,
            })
          );
      });
    } else {
      sendCallback({ isSet, set: true, deps: deps, id: props.socketId });
    }
  },



  _UserLoggedIn(props, sendCallback) {
    var UsersList = db.get("ActiveUsers").value();

    var user = {
      userName: props.data.config.userName,
      id: props.data.config.id,
      prevarges: props.data.config.prevarges,
      dep: props.data.dep.dep,
    };

    if (props._type === "LoggedIn") {
      if (UsersList) {
        db.get("ActiveUsers").push(user).write();
        sendCallback({
          userActive: true,
          users: db.get("ActiveUsers").value(),
        });
      } else {
        db.defaults({ users: [user] }).write();
        sendCallback({
          userActive: true,
          users: db.get("ActiveUsers").value(),
        });
      }
    } else {
      db.get("ActiveUsers").remove({ id: props.data.config.id }).write();
      sendCallback({ userActive: false, users: db.get("ActiveUsers").value() });
    }
  },

  _SetActiveDepartment(props, sendCallback) {
    const dep = db.get("activeDep").value();
    var initalData = {};
    if (props._type !== "remove") initalData = props.data.initalData.dep;

    if (props._type === "get") {
      if (dep) {
        sendCallback({ isSet: false, dep });
      } else {
        sendCallback({ isSet: false });
      }
    } else if (props._type === "set") {
      var depData = {
        initalData,
        id: initalData.config.departments.id,
        socketId: props.socketId,
      };
      if (dep) {
        var isActive = db
          .get("activeDep")
          .find({ id: initalData.config.departments.id })
          .value();
        if (!isActive) {
          db.get("activeDep").push(depData).write();
          sendCallback({ connected: true, depData });
        }
      } else {
        db.defaults({ activeDep: [depData] }).write();
        sendCallback({ connected: true, depData });
      }
    } else if (props._type === "remove") {
      db.get("activeDep").remove({ socketId: props.socketId }).write();
      sendCallback({ removed: true, socketId: props.socketId });
    }
  },

  // _UserLoggedIn(props, sendCallback) {
  //   var UsersList = db.get("users").value();

  //   if (props._type === "LoggedIn") {
  //     if (UsersList) {
  //     } else {
  //     }
  //   } else {
  //   }
  // },
};
