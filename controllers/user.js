var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var qs = require('querystring');
var User = require('../models/User');
var fs = require('fs');
var Task = require('../models/Task');
var Admin = require('../models/Admin');

function generateToken(user) {
    var payload = {
        iss: 'my.domain.com',
        sub: user.id,
        iat: moment()
            .unix(),
        exp: moment()
            .add(7, 'days')
            .unix()
    };
    return jwt.sign(payload, process.env.TOKEN_SECRET);
}

function generateToken(admin) {
    var payload = {
        iss: 'my.domain.com',
        sub: admin.id,
        iat: moment()
            .unix(),
        exp: moment()
            .add(7, 'days')
            .unix()
    };
    return jwt.sign(payload, process.env.TOKEN_SECRET);
}

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {

        next();
    } else {

        res.status(401)
            .send({ msg: 'Unauthorized' });
    }
};

/**
 * POST /login
 * Sign in with email and password
 */
exports.loginPost = function(req, res, next) {
    req.assert('email', 'Email is not valid')
        .isEmail();
    req.assert('email', 'Email cannot be blank')
        .notEmpty();
    req.assert('password', 'Password cannot be blank')
        .notEmpty();
    req.sanitize('email')
        .normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
            return res.status(401)
                .send({
                    msg: 'The email address ' + req.body.email + ' is not associated with any account. ' +
                        'Double-check your email address and try again.'
                });
        }
        user.comparePassword(req.body.password, function(err, isMatch) {
            if (!isMatch) {
                return res.status(401)
                    .send({ msg: 'Invalid email or password' });
            }
            res.send({ token: generateToken(user), user: user.toJSON() });
        });
    });
};
//----------------------------------------------------------------
exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401)
            .send({ msg: 'Unauthorized' });
    }
};
/**
 * POST /login
 * Sign in with email and password
 */
exports.adminloginPost = function(req, res, next) {
    req.assert('username', 'Username cannot be blank')
        .notEmpty();
    req.assert('password', 'Password cannot be blank')
        .notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    Admin.findOne({ username: req.body.username }, function(err, admin) {
        if (!admin) {
            return res.status(401)
                .send({
                    msg: 'The username ' + req.body.username + ' is not associated with any account. ' +
                        'Double-check your email address and try again.'
                });
        }
        admin.comparePassword(req.body.password, function(err, isMatch) {
            if (!isMatch) {
                return res.status(401)
                    .send({ msg: 'Invalid email or password' });
            }
            res.send({ token: generateToken(admin), admin: admin.toJSON() });
        });
    });
};
//-----------------------------------------------------------
exports.adminsignupPost = function(req, res, next) {
    req.assert('username', 'Username cannot be blank')
        .notEmpty();
    req.assert('email', 'Email is not valid')
        .isEmail();
    req.assert('email', 'Email cannot be blank')
        .notEmpty();
    req.assert('password', 'Password must be at least 4 characters long')
        .len(4);
    req.sanitize('email')
        .normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    Admin.findOne({ email: req.body.email }, function(err, admin) {
        if (admin) {
            return res.status(400)
                .send({ msg: 'The email address you have entered is already associated with another account.' });
        }
        admin = new Admin({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        admin.save(function(err) {
            res.send({ token: generateToken(admin), admin: admin });
        });
    });
};
//-----------------------------------------------------------
/**
 * POST /signup
 */
exports.signupPost = function(req, res, next) {
    req.assert('name', 'Name cannot be blank')
        .notEmpty();
    req.assert('email', 'Email is not valid')
        .isEmail();
    req.assert('email', 'Email cannot be blank')
        .notEmpty();
    req.assert('password', 'Password must be at least 4 characters long')
        .len(4);
    req.sanitize('email')
        .normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    User.findOne({ email: req.body.email }, function(err, user) {
        if (user) {
            return res.status(400)
                .send({ msg: 'The email address you have entered is already associated with another account.' });
        }
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        user.save(function(err) {
            res.send({ token: generateToken(user), user: user });
        });
    });
};




exports.useraccountDelete = function(req, res, next) {
    console.log('req body' + req.body._id);
    User.remove({ _id: req.body._id }, function(err) {
        res.send({ msg: 'Your account has been permanently deleted.' });
    });
};
exports.admintaskCreatePut = function(req, res, next) {
    console.log(req.body);
    req.assert('subject', 'subject cannot be blank')
        .notEmpty();
    req.assert('body', 'body cannot be blank')
        .notEmpty();
    req.assert('deadlineDate', 'please specify a deadline')
        .notEmpty();


    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    var task = new Task({
        subject: req.body.subject,
        body: req.body.body,
        deadlineDate: Date.now() + (req.body.deadlineDate * 24 * 60 * 60 * 1000),
        priority: req.body.priority,
        status: req.body.status,
        rating: req.body.rating,
        remarks: req.body.remarks,
        members: req.body.user._id,
        assignedDate: Date.now(),
        documentLink: req.body.documentLink
    });
    task.save(function(err) {
        if (err) {
            res.send({ msg: 'error ins saving task' });
        } else {
            res.send({ msg: 'task saved', task: task });
        }
    });
};
//------------------------------------------------------------------

/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function(req, res, next) {
    if ('password' in req.body) {
        req.assert('password', 'Password must be at least 4 characters long')
            .len(4);
        req.assert('confirm', 'Passwords must match')
            .equals(req.body.password);
    } else {
        req.assert('email', 'Email is not valid')
            .isEmail();
        req.assert('email', 'Email cannot be blank')
            .notEmpty();
        req.sanitize('email')
            .normalizeEmail({ remove_dots: false });
    }

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    User.findById(req.user.id, function(err, user) {
        if ('password' in req.body) {
            user.password = req.body.password;
        } else {
            user.email = req.body.email;
            user.name = req.body.name;
            user.gender = req.body.gender;
            user.location = req.body.location;
            user.website = req.body.website;
        }
        user.save(function(err) {
            if ('password' in req.body) {
                res.send({ msg: 'Your password has been changed.' });
            } else if (err && err.code === 11000) {
                res.status(409)
                    .send({ msg: 'The email address you have entered is already associated with another account.' });
            } else {
                res.send({ user: user, msg: 'Your profile information has been updated.' });
            }
        });
    });
};


/**
 * POST /account
 * Update change profile pic.
 */
exports.picturePost = function(req, res, next) {
    if (req.file) {
        // console.log('Upload Successful ', req.file);
        // console.log('BODY is: ', req.body);
        // console.log('USER is: ', req.user);
    } else {
        req.assert('req.file', 'No file selected')
            .len(1);
    }
    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }


    User.findById(req.user.id, function(err, user) {
        if (req.file) {
            user.picture.data = fs.readFileSync(req.file.path);
            user.picture.contentType = req.file.mimetype;

        } else {

        }
        user.save(function(err) {
            if (req.file) {
                res.send({ msg: 'Your profile picture has been changed.' });
            } else if (err && err.code === 11000) {
                res.status(409)
                    .send({ msg: 'No file selected' });
            }
        });
    });



};



/**
 * DELETE /account
 */
exports.accountDelete = function(req, res, next) {
    User.remove({ _id: req.user.id }, function(err) {
        res.send({ msg: 'Your account has been permanently deleted.' });
    });
};



/**
 * POST /task
 */
exports.taskGet = function(req, res, next) {
    Task.find({ members: { $elemMatch: { $eq: req.user.id } } }, function(err, task) {
        if (task) {
            return res.status(200)
                .send({ msg: 'tasks present', task: task, user: req.user });
        } else {
            return res.status(200)
                .send({ msg: 'No tasks currently assigned to you' });
        }
    });
};


/**
 * POST /task/getAdminChart
 */
exports.adminChartGet = function(req, res, next) {
    var totalUser;
    var pend;
    var work;
    var comp;
    User.find({}, function(err, users) {
        totalUsers = users.length;
        Task.find({}, function(err, task1) {
            if (task1) {
                var len = task1.length;
                Task.find({ status: 'pending' }, function(err, task2) {
                    if (task2) {
                        pend = task2.length;
                        Task.find({ status: 'working' }, function(err, task3) {
                            if (task3) {
                                var work = task3.length;
                                Task.find({ status: 'completed' }, function(err, task4) {
                                    if (task4) {
                                        var comp = task4.length;
                                        return res.status(200)
                                            .send({ users: users, all: len, pend: pend, work: work, comp: comp, totalUsers: totalUsers });

                                    } else {

                                    }
                                });
                            } else {

                            }
                        });
                    } else {
                        pend = 0;
                    }
                });

            } else {
                return res.status(200)
                    .send({ msg: 'No tasks currently assigned to you' });
            }
        });
    });


};





//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
/**
 * GET /tasks/individualstats
 */
exports.allIndividualtasksGet = function(req, res, next) {
    var set = new Set();
    Task.find({}, function(err, tasks) {
        tasks = JSON.stringify(tasks);
        tasks = JSON.parse(tasks);

        for (ts of tasks) {

            var members = ts.members;

            for (id of members) {

                set.add(id);
                for (x in set) {
                    Task.find({ members: { $elemMatch: { $eq: req.user.id } }, status: 'pending' }, function(err, task2) {
                        if (task2) {
                            pend = task2.length;
                            Task.find({ members: { $elemMatch: { $eq: x } }, status: 'working' }, function(err, task3) {
                                if (task3) {
                                    var work = task3.length;
                                    Task.find({ members: { $elemMatch: { $eq: x } }, status: 'completed' }, function(err, task4) {
                                        if (task4) {
                                            var comp = task4.length;
                                            console.log("data", x, pend, work, comp);
                                        } else {

                                        }
                                    });
                                } else {

                                }
                            });
                        } else {
                            pend = 0;
                        }
                    });
                }

            }
        }
        console.log(set);
    });
};


/**
 * GET /tasks/alltasks
 */
exports.allTasksGet = function(req, res, next) {
    Task.find({}, function(err, task) {
        if (task) {
            return res.status(200)
                .send({ msg: 'all tasks returned', task: task });
        } else {
            return res.status(200)
                .send({ msg: 'No tasks currently assigned to you' });
        }
    });
};



/**
 * GET /admin/completedTask
 */
exports.completedTasksGet = function(req, res, next) {
    Task.find({ status: 'completed' }, function(err, task) {
        if (task) {

            return res.status(200)
                .send({ msg: 'completed tasks', task: task });
        } else {

        }
    });
};




/**
 * GET /admin/userTaskDetail
 */
exports.userTaskDetailGet = function(req, res, next) {
    console.log("body ");
    console.log(req.body._id);
    Task.find({ members: { $elemMatch: { $eq: req.body._id } } }, function(err, task) {
        console.log('found', task);
        if (task) {

            return res.status(200)
                .send({ msg: 'completed tasks', task: task });
        } else {

        }
    });
};



/**
 * GET /admin/workingTask
 */
exports.workingTasksGet = function(req, res, next) {
    Task.find({ status: 'working' }, function(err, task) {
        if (task) {

            return res.status(200)
                .send({ msg: 'working tasks', task: task });
        } else {

        }
    });
};



/**
 * GET /admin/pendingTask
 */
exports.pendingTasksGet = function(req, res, next) {
    Task.find({ status: 'pending' }, function(err, task) {
        if (task) {

            return res.status(200)
                .send({ msg: 'pending tasks', task: task });
        } else {

        }
    });
};


//-----------------------------------------------
exports.addUser = function(req, res, next) {
    req.assert('name', 'Name cannot be blank')
        .notEmpty();
    req.assert('email', 'Email is not valid')
        .isEmail();
    req.assert('email', 'Email cannot be blank')
        .notEmpty();
    req.assert('password', 'Password must be at least 4 characters long')
        .len(4);
    req.sanitize('email')
        .normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    User.findOne({ email: req.body.email }, function(err, user) {
        if (user) {
            return res.status(400)
                .send({ msg: 'The email address you have entered is already associated with another account.' });
        }
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        user.save(function(err) {
            res.send({ token: generateToken(user), user: user });
        });
    });
};

exports.userGet = function(req, res, next) {
    User.find({}, function(err, users) {
        return res.status(200)
            .send({ users: users })
    })
}

/**
 * POST /stats
 */
exports.statsGet = function(req, res, next) {
    console.log(req.body);
    var pend;
    var work;
    var comp;


    Task.find({ members: { $elemMatch: { $eq: req.user.id } } }, function(err, task1) {
        if (task1) {
            var len = task1.length;
            Task.find({ members: { $elemMatch: { $eq: req.user.id } }, status: 'pending' }, function(err, task2) {
                if (task2) {
                    pend = task2.length;
                    Task.find({ members: { $elemMatch: { $eq: req.user.id } }, status: 'working' }, function(err, task3) {
                        if (task3) {
                            var work = task3.length;
                            Task.find({ members: { $elemMatch: { $eq: req.user.id } }, status: 'completed' }, function(err, task4) {
                                if (task4) {
                                    var comp = task4.length;
                                    return res.status(200)
                                        .send({ msg: 'stats', user: req.user, stats: { all: len, pend: pend, work: work, comp: comp } });
                                } else {

                                }
                            });
                        } else {

                        }
                    });
                } else {
                    pend = 0;
                }
            });

        } else {
            return res.status(200)
                .send({ msg: 'No tasks currently assigned to you' });
        }
    });
};



/**
 * GET /adminTasks
 */
exports.adminTasksGet = function(req, res, next) {
    console.log(req.body);
    var pend;
    var work;
    var comp;
    var memArr = [];
    User.find({}, function(err, users) {



        Task.find({}, function(err, task1) {
            if (task1) {
                var len = task1.length;
                Task.find({ status: 'pending' }, function(err, task2) {
                    if (task2) {
                        pend = task2.length;
                        Task.find({ status: 'working' }, function(err, task3) {
                            if (task3) {
                                var work = task3.length;
                                Task.find({ status: 'completed' }, function(err, task4) {
                                    if (task4) {
                                        var comp = task4.length;
                                        return res.status(200)
                                            .send({ msg: 'stats', user: req.user, stats: { all: len, pend: pend, work: work, comp: comp, users: users } });
                                    } else {
                                        comp = 0
                                    }
                                });
                            } else {
                                work = 0;
                            }
                        });
                    } else {
                        pend = 0;
                    }
                });

            } else {
                return res.status(200)
                    .send({ msg: 'No tasks currently assigned to you' });
            }
        });
    });


};







/**
 * POST /task
 */
exports.taskCreatePut = function(req, res, next) {
    console.log('req data', req.body);
    req.assert('subject', 'subject cannot be blank')
        .notEmpty();
    req.assert('body', 'body cannot be blank')
        .notEmpty();
    req.assert('deadlineDate', 'please specify a deadline')
        .notEmpty();


    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    var task = new Task({
        subject: req.body.subject,
        body: req.body.body,
        deadlineDate: Date.now() + (req.body.deadlineDate * 24 * 60 * 60 * 1000),
        priority: req.body.priority,
        status: req.body.status,
        rating: req.body.rating,
        remarks: req.body.remarks,
        members: req.user.id,
        assignedDate: Date.now(),
        documentLink: req.body.documentLink
    });
    task.save(function(err) {
        if (err) {
            res.send({ msg: 'error ins saving task' });
        } else {
            res.send({ msg: 'task saved', task: task });
        }
    });
};


/**
 * POST /task/createAdminTask
 */
exports.adminTaskCreatePost = function(req, res, next) {
    console.log('req data', req.body);
    req.assert('subject', 'subject cannot be blank')
        .notEmpty();
    req.assert('body', 'body cannot be blank')
        .notEmpty();
    req.assert('deadlineDate', 'please specify a deadline')
        .notEmpty();
    req.assert('priority', 'please specify priority')
        .notEmpty();
    req.assert('members', 'please assign atleast one user')
        .notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        return res.status(400)
            .send(errors);
    }

    var task = new Task({
        subject: req.body.subject,
        body: req.body.body,
        deadlineDate: Date.now() + (req.body.deadlineDate * 24 * 60 * 60 * 1000),
        priority: req.body.priority,
        status: req.body.status,
        rating: req.body.rating,
        remarks: req.body.remarks,
        members: req.body.members,
        assignedDate: Date.now(),
        documentLink: req.body.documentLink
    });
    task.save(function(err) {
        if (err) {
            res.send({ msg: 'error ins saving task' });
        } else {
            res.send({ msg: 'task saved', task: task });
        }
    });
};



/**
 * PUT /task/update
 */
exports.taskUpdatePut = function(req, res, next) {
    Task.findById(req.body.id, function(err, task) {

        task.rating = req.body.rating;
        task.status = req.body.status;
        task.remarks = req.body.remarks;
        task.documentLink = req.body.documentLink;

        task.save(function(err) {
            if (err) {
                res.status(409)
                    .send({ msg: 'MongoDB error' });
            } else {
                res.send({ task: task, msg: 'Your task details has been updated.' });
            }
        });
    });
};


/**
 * GET /unlink/:provider
 */
exports.unlink = function(req, res, next) {
    User.findById(req.user.id, function(err, user) {
        switch (req.params.provider) {
            case 'facebook':
                user.facebook = undefined;
                break;
            case 'google':
                user.google = undefined;
                break;
            case 'twitter':
                user.twitter = undefined;
                break;
            case 'vk':
                user.vk = undefined;
                break;
            case 'github':
                user.github = undefined;
                break;
            default:
                return res.status(400)
                    .send({ msg: 'Invalid OAuth Provider' });
        }
        user.save(function(err) {
            res.send({ msg: 'Your account has been unlinked.' });
        });
    });
};

/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
    req.assert('email', 'Email is not valid')
        .isEmail();
    req.assert('email', 'Email cannot be blank')
        .notEmpty();
    req.sanitize('email')
        .normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    async.waterfall([
        function(done) {
            crypto.randomBytes(16, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    return res.status(400)
                        .send({ msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
                console.log('forgot token: ', token, " and exp", Date.now());
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var transporter = nodemailer.createTransport({
                service: 'Mailgun',
                auth: {
                    user: process.env.MAILGUN_USERNAME,
                    pass: process.env.MAILGUN_PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'TASK Support <support@tasktracker.com>',
                subject: '✔ Reset your password',
                text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function(err) {
                res.send({ msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
                done(err);
            });
        }
    ]);
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {
    console.log("reset token: ", req.params.token);
    req.assert('password', 'Password must be at least 4 characters long')
        .len(4);
    req.assert('confirm', 'Passwords must match')
        .equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400)
            .send(errors);
    }

    async.waterfall([
        function(done) {
            User.findOne({ passwordResetToken: req.params.token })
                .where('passwordResetExpires')
                .gt(Date.now())
                .exec(function(err, user) {
                    if (!user) {
                        return res.status(400)
                            .send({ msg: 'Password reset token is invalid or has expired.' });
                    }
                    user.password = req.body.password;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;
                    user.save(function(err) {
                        done(err, user);
                    });
                });
        },
        function(user, done) {
            var transporter = nodemailer.createTransport({
                service: 'Mailgun',
                auth: {
                    user: process.env.MAILGUN_USERNAME,
                    pass: process.env.MAILGUN_PASSWORD
                }
            });
            var mailOptions = {
                from: 'TASK Support <support@tasktracker.com>',
                to: user.email,
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            transporter.sendMail(mailOptions, function(err) {
                res.send({ msg: 'Your password has been changed successfully.' });
            });
        }
    ]);
};