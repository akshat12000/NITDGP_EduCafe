const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const pollSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    teacherId: {
        type: String,
        required: true
    },
    teacherName: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    option1: {
        val: {
            type: String,
            required: true
        },
        response: [{ type: String }]
    },
    option2: {
        val: {
            type: String,
            required: true
        },
        response: [{ type: String }]
    }
});

pollSchema.plugin(findOrCreate);
const Poll = new mongoose.model("Poll", pollSchema);

module.exports = Poll;