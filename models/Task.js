var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var taskSchema = new mongoose.Schema({
    subject: String,
    body: String,
    assignedDate: Date,
    deadlineDate: Date,
    documentLink: String,
    status: String,
    rating: Number,
    priority: Number,
    remarks: String,
    members: Array
}, schemaOptions);


var Task = mongoose.model('Task', taskSchema);

module.exports = Task;