const uuidv4 = require("uuid/v1");
const knex = require("../knex");

function CreateId() {
    return uuidv4();
}

const GetData = (props, callback) => {
    knex
    .select()
    .from(props.table)
    .where(props.id, props.value)
    .then(function (data) {
            callback({
                data,
            });
        });
};

module.exports = {

    SetGroups(props, sendCallback) {

        GetData(
            { table: "group", id: "group", value: props.data.group },
            (callback) => {
                
                if (callback.data.length === 0) {
                    knex("group")
                        .insert({
                            id: CreateId(),
                            group: props.data.group,
                            recipes: { data: [{ recipe: props.data.group }] },
                            colors: props.data.colors,
                        })
                        .then(function () {
                            sendCallback({ socketId: props.socketId, isSet: true, data: [] });
                        });
                } else {
                    sendCallback({ socketId: props.socketId, isSet: false, data: [] });
                }
            }
        );

    },

    GetGroups(props, sendCallback) {
        knex
            .select()
            .from("group")
            .then(function (data) {
                sendCallback({ socketId: props.socketId, isSet: true, data });
            });
    },

    DeleteGroups(props, sendCallback) {
        knex("group")
            .where({ group: props.data.group.group })
            .del()
            .then(function (data) {
                sendCallback({ socketId: props.socketId, isDeleted: true, data: [] });
            });
    }
}
