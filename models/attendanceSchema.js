const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const attendanceSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    studentId: [{
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        roll: {
            type: String,
            required: true
        }
    }],
    meetlink: {
        type: String,
        required: true
    }
});

attendanceSchema.plugin(findOrCreate);
const Attendance = new mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;