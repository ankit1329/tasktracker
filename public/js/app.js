var app = angular.module('MyApp', ['ngRoute', 'satellizer', 'mgcrea.ngStrap', 'ngAnimate', 'chart.js']);
app.config(function($routeProvider, $locationProvider, $authProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/contact', {
                templateUrl: 'partials/contact.html',
                controller: 'ContactCtrl'
            })
            .when('/adminlogin', {
                templateUrl: 'partials/adminlogin.html',
                controller: 'AdminCtrl',
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated,
                    checkWho: checkWho
                }
            })
            .when('/adminsignup', {
                templateUrl: 'partials/adminsignup.html',
                controller: 'AdminSignupCtrl',
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated,
                    checkWho: checkWho
                }
            })
            .when('/admin/user', {
                templateUrl: 'partials/adminuser.html',
                controller: 'AdminUserCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/admin/tasks', {
                templateUrl: 'partials/adminTask.html',
                controller: 'AdminTaskCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/admin/chart', {
                templateUrl: 'partials/chart.html',
                controller: 'AdminChartCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/admin/completedTasks', {
                templateUrl: 'partials/completedTasks.html',
                controller: 'completedTaskCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/admin/userTaskDetail', {
                templateUrl: 'partials/userTaskDetail.html',
                controller: 'userTaskDetailCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/admin/workingTasks', {
                templateUrl: 'partials/workingTasks.html',
                controller: 'workingTaskCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/admin/pendingTasks', {
                templateUrl: 'partials/pendingTasks.html',
                controller: 'pendingTaskCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/admin/allTasks', {
                templateUrl: 'partials/allTasks.html',
                controller: 'allTaskCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/', {
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated,
                    checkWho: checkWho
                }
            })
            .when('/signup', {
                templateUrl: 'partials/signup.html',
                controller: 'SignupCtrl',
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated,
                    checkWho: checkWho
                }
            })
            .when('/account', {
                templateUrl: 'partials/profile.html',
                controller: 'ProfileCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/forgot', {
                templateUrl: 'partials/forgot.html',
                controller: 'ForgotCtrl',
                resolve: { skipIfAuthenticated: skipIfAuthenticated }
            })
            .when('/reset/:token', {
                templateUrl: 'partials/reset.html',
                controller: 'ResetCtrl',
                resolve: { skipIfAuthenticated: skipIfAuthenticated }
            })
            .when('/task', {
                templateUrl: 'partials/task.html',
                controller: 'TaskCtrl',
                resolve: { loginRequired: loginRequired }
            })
            .when('/task/update', {
                templateUrl: 'partials/update.html',
                controller: 'TaskUpdateCtrl',
                resolve: { loginRequired: loginRequired }

            })
            .when('/stats', {
                templateUrl: 'partials/stats.html',
                controller: 'StatsCtrl',
                resolve: { loginRequired: loginRequired }

            })
            .otherwise({
                templateUrl: 'partials/404.html'
            });

        // $authProvider.loginUrl = '/login';
        // $authProvider.signupUrl = '/signup';

        function skipIfAuthenticated($location, $auth) {
            if ($auth.isAuthenticated()) {
                $location.path('/');
            }
        }

        function loginRequired($location, $auth) {
            if (!$auth.isAuthenticated()) {
                $location.path('/login');
            }
        }

        function checkWho($location) {
            if ($location.path() == '/') {
                $authProvider.loginUrl = '/login';
            } else if ($location.path() == '/signup') {
                $authProvider.signupUrl = '/signup';
            } else if ($location.path() == '/adminlogin') {
                $authProvider.loginUrl = '/adminlogin';
            } else {
                $authProvider.signupUrl = '/adminsignup';
            }
        }
    })
    .run(function($rootScope, $window) {
        if ($window.localStorage.user) {
            console.log($window.localStorage.user);
            $rootScope.currentUser = JSON.parse($window.localStorage.user);
        } else if ($window.localStorage.admin) {
            $rootScope.currentAdmin = JSON.parse($window.localStorage.admin);
        }
    });