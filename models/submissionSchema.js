const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: String,
    },
    studentId: {
        type: String,
    },
    fileName: {
        type: String,
    }
});

submissionSchema.plugin(findOrCreate);
const Submission = new mongoose.model("Submission", submissionSchema);

module.exports = Submission;