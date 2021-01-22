const moment = require("moment");

const fs = require("fs-extra");
const uuidv4 = require("uuid/v4");
const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");

const folderPath = "./db/store/departments/";
const ConfigPath = "./db/store/config.json";

const ConfigAdapter = new FileAsync(ConfigPath);

function CreateId() {
  return uuidv4();
}

module.exports = {
  CheckWorkPeriod(props, callback) {
    low(ConfigAdapter).then(function (tempdb) {
      const isWriten = tempdb.get("openPeriod").value();
      if (isWriten) {
        var isActive = isWriten.initalData.id;
        if (isActive) callback({ isOpen: true, data: isWriten });
        else callback({ isOpen: false });
      } else {
        callback({ isOpen: false });
      }
    });
  },

  StartWorkPeriod(props, callback) {
    const initalData = props.Userdata.data.initalData;
    var MainFolderPath = folderPath + initalData.departmentInfo.file;

    if (fs.existsSync(MainFolderPath)) {
      var destPath = MainFolderPath + "/WorkPeriod/";
      var WorkPeriodConfig = destPath + "config.json";
      const WorkPeriodConfigAdapter = new FileAsync(WorkPeriodConfig);

      var destFilePath =
        MainFolderPath +
        "/WorkPeriod/" +
        initalData.year +
        "/" +
        initalData.month +
        "/" +
        initalData.week +
        "/" +
        initalData.day +
        "/" +
        initalData.fileName +
        "/config.json";

      if (fs.existsSync(destFilePath)) {
      } else {
        fs.ensureFileSync(destFilePath);

        // Upate the config file for open work periods
        low(WorkPeriodConfigAdapter).then((tempdb) => {
          const isWriten = tempdb.get("openPeriod").value();
          if (isWriten) {
            tempdb
              .get("openPeriod")
              .chain()
              .assign({ initalData: initalData })
              .value();
            tempdb.write();
          } else {
            tempdb.defaults({ openPeriod: { initalData } }).write();
          }
        });
        // write to sub folder
        const adapter = new FileAsync(destFilePath);
        low(adapter).then((tempdb) => {
          tempdb
            .defaults({ data: [initalData] })
            .write()
            .then(() => {
              callback({ isDone: true, id: props.socketId });
            });
        });
      }
    } else {
      callback({ isDone: false, id: props.socketId });
    }
  },

  EndWorkPeriod(props, sendCallback) {
    const initalData = props.Userdata.data.data;
    var MainFolderPath = folderPath + initalData.departmentInfo.file;

    var destPath = MainFolderPath + "/WorkPeriod/";
    var WorkPeriodConfig = destPath + "config.json";
    const WorkPeriodConfigAdapter = new FileAsync(WorkPeriodConfig);

    var destFilePath =
    MainFolderPath +
    "/WorkPeriod/" +
    initalData.year +
    "/" +
    initalData.month +
    "/" +
    initalData.week +
    "/" +
    initalData.day +
    "/" +
    initalData.fileName +
    "/config.json";

    const adapter = new FileAsync(destFilePath);
    low(adapter).then((tempdb) => {
      tempdb
        .get("data")
        .chain()
        .find({ dateEnded: "" })
        .assign({ dateEnded: initalData.dateEnded })
        .value();

      tempdb
        .get("data")
        .chain()
        .find({ dateEndedString: "" })
        .assign({ dateEndedString: initalData.dateEndedString })
        .value();

      tempdb
        .get("data")
        .chain()
        .find({ timeEnded: "" })
        .assign({ timeEnded: initalData.timeEnded })
        .value();

      tempdb
        .get("data")
        .chain()
        .find({ workedFor: "" })
        .assign({ workedFor: initalData.workedFor })
        .value();
      tempdb.write().then((data) => {
        // write history list
        var configData = tempdb.get("data").value();

        low(WorkPeriodConfigAdapter).then((tempdb) => {
          const isWriten = tempdb.get("data").value();

          if (isWriten) {
            tempdb.get("data").push(configData[0]).write();
          } else {
            tempdb.defaults({ data: [configData[0]] }).write();
          }

          tempdb.get("openPeriod").chain().assign({ initalData: {} }).value();
          tempdb.write();
        });
      });
      sendCallback({ isDone: true });
    });
  },

  WorkPeriodList(sendCallback) {
    var tempData = [];

    low(ConfigAdapter).then((tempdb) => {
      const data = tempdb.get("data").value();
      const Started = tempdb.get("openPeriod.initalData").value();
  
      if (data) tempData = data;
      if (Started.id) tempData.push(Started);
  
      // console.log(tempData);
      sendCallback(tempData.reverse());
    });
  },
};
