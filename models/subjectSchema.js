const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const subjectSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    year: {
        type: String,
        require: true
    },
    teacherId: {
        type: String,
        required: true
    },
    teacherName: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    meetlink: {
        type: String,
        required: true
    }
});

subjectSchema.plugin(findOrCreate);
const Subject = new mongoose.model("Subject", subjectSchema);

module.exports = Subject;