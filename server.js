var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var multer = require('multer');

//Multer store and rename config
var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.originalname.replace(path.extname(file.originalname), "") + '-' + Date.now() + path.extname(file.originalname))
    }
});
var upload = multer({ storage: storage })

// Load environment variables from .env file
dotenv.load();

// Models
var User = require('./models/User');
var Admin = require('./models/Admin');

// Controllers
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');

var app = express();


mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    req.isAuthenticated = function() {
        var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
        try {
            return jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            return false;
        }
    };

    if (req.isAuthenticated()) {
        var payload = req.isAuthenticated();
        User.findById(payload.sub, function(err, user) {
            req.user = user;
            next();
        });
    } else {
        next();
    }
});
//-----------------------------------------------
app.use(function(req, res, next) {
    req.isAuthenticated = function() {
        var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
        try {
            return jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            return false;
        }
    };

    if (req.isAuthenticated()) {
        var payload = req.isAuthenticated();
        Admin.findById(payload.sub, function(err, admin) {
            req.admin = admin;
            next();
        });
    } else {
        next();
    }
});
//-----------------------------------------------
app.post('/contact', contactController.contactPost);
app.put('/account', userController.ensureAuthenticated, userController.accountPut);
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
app.post('/signup', userController.signupPost);
app.post('/login', userController.loginPost);
app.post('/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.post('/savedata', userController.ensureAuthenticated, upload.single('file'), userController.picturePost);
app.post('/task', userController.ensureAuthenticated, userController.taskGet);
app.put('/task/update', userController.ensureAuthenticated, userController.taskUpdatePut);
app.post('/adminlogin', userController.adminloginPost);
app.post('/adminsignup', userController.adminsignupPost);
app.post('/task/create', userController.ensureAuthenticated, userController.taskCreatePut);
app.post('/stats', userController.ensureAuthenticated, userController.statsGet);
app.post('/user/add', userController.ensureAuthenticated, userController.addUser);
app.post('/admin/user', userController.ensureAuthenticated, userController.userGet);
app.get('/tasks', userController.ensureAuthenticated, userController.adminTasksGet);
app.post('/admin/allTasks', userController.ensureAuthenticated, userController.allTasksGet);
app.post('/admin/completedTasks', userController.ensureAuthenticated, userController.completedTasksGet);
app.post('/admin/pendingTasks', userController.ensureAuthenticated, userController.pendingTasksGet);
app.post('/admin/workingTasks', userController.ensureAuthenticated, userController.workingTasksGet);
app.post('/admin/userTaskDetail', userController.ensureAuthenticated, userController.userTaskDetailGet);
app.post('/user/remove', userController.ensureAuthenticated, userController.useraccountDelete);
app.post('/admin/assign', userController.ensureAuthenticated, userController.admintaskCreatePut);
app.post('/task/createAdminTask', userController.ensureAuthenticated, userController.adminTaskCreatePost);
app.post('/task/getAdminChart', userController.ensureAuthenticated, userController.adminChartGet);
app.post('/task/getIndividualTasks', userController.ensureAuthenticated, userController.allIndividualtasksGet);


app.get('*', function(req, res) {
    res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.sendStatus(err.status || 500);
    });
}

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;