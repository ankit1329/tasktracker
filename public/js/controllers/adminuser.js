angular.module('MyApp')
    .controller('AdminUserCtrl', function($scope, $modal, userService, $location, adduserFactory, adminuserService, usersFactory, $window, $rootScope, $auth) {
        usersFactory.userGet()
            .then(function(response) {
                console.log(response.data);
                adminuserService.userData = response.data.users;
                $scope.messages = {
                    success: [response.data.msg]
                };
            });
        $scope.users = adminuserService;
        console.log($scope.users);
        $scope.search = '';
        $scope.sensitiveSearch = function(user) {
            if ($scope.search) {
                return user.name.indexOf($scope.search) == 0 ||
                    user.email.indexOf($scope.search) == 0;
            }
            return true;
        };




        // $scope.profile = $scope.users.selectedUser;
        //         console.log($scope.profile);
        //     usertaskFactory.getuserTasks($scope.profile)
        //     .then(function(response) {
        //         console.log(response.data.task);
        //         adminuserService.selectedUserTasks = response.data.task;
        //         $scope.messages = {
        //             success: [response.data.msg]
        //         };
        //     });
        // $scope.task = adminuserService;
        // $scope.search = '';
        // $location.path('admin/user/task');
        // $scope.sensitiveSearch = function(tas) {
        //     if ($scope.search) {
        //         return tas.subject.indexOf($scope.search) == 0 ||
        //             tas.status.indexOf($scope.search) == 0;
        //     }
        //     return true;
        // };
        $scope.showadduserModal = function() {
            $scope.newuser = userService;
            $scope.newuser.user = {};

            $scope.createModal = $modal({
                scope: $scope,
                templateUrl: 'partials/modal.adduser.tpl.html',
                show: true
            });
            $scope.addUser = function() {
                // console.log($scope.newuser.user);
                adduserFactory.addUser($scope.newuser.user)
                    .then(function() {
                        $scope.createModal.hide();
                        usersFactory.userGet()
                            .then(function(response) {
                                console.log('response', response);
                                console.log(response.data);
                                adminuserService.userData = response.data.users;
                                $scope.messages = {
                                    success: [response.data.msg]
                                };
                            });

                    })
                    .catch(function(response) {
                        $scope.messages = {
                            error: Array.isArray(response.data) ? response.data : [response.data]
                        };
                    });
            };
        };


        //-------------------------------------------------------------
        $scope.signup = function() {
            $auth.signup($scope.newuser.user)
                .then(function(response) {
                    $auth.setToken(response);
                    $rootScope.currentUser = response.data.user;
                    $window.localStorage.user = JSON.stringify(response.data.user);
                    $location.path('/');
                })
                .catch(function(response) {
                    $scope.messages = {
                        error: Array.isArray(response.data) ? response.data : [response.data]
                    };
                });
        };

        $scope.authenticate = function(provider) {
            $auth.authenticate(provider)
                .then(function(response) {
                    $rootScope.currentUser = response.data.user;
                    $window.localStorage.user = JSON.stringify(response.data.user);
                    $location.path('/');
                })
                .catch(function(response) {
                    if (response.error) {
                        $scope.messages = {
                            error: [{ msg: response.error }]
                        };
                    } else if (response.data) {
                        $scope.messages = {
                            error: [response.data]
                        };
                    }
                });
        };

        $scope.deleteuserAccount = function() {
            console.log($scope.users.selectedUser)
            usersFactory.deleteuserAccount($scope.users.selectedUser)
                .then(function() {
                    delete $window.localStorage.user;
                    // $location.path('/admin/user');
                    usersFactory.userGet()
                        .then(function(response) {
                            console.log(response.data);
                            adminuserService.userData = response.data.users;
                            $scope.messages = {
                                success: [response.data.msg]
                            };
                        });
                })
                .catch(function(response) {
                    $scope.messages = {
                        error: [response.data]
                    };
                });
        };




        $scope.showAssignModal = function() {
            $scope.users.task = { 'user': $scope.users.selectedUser };
            $scope.createModal = $modal({
                scope: $scope,
                templateUrl: 'partials/modal.assigntask.tpl.html',
                show: true
            })
        };

        $scope.createTask = function() {
            console.log($scope.users.task);
            usersFactory.createTask($scope.users.task)
                .then(function() {
                    $scope.createModal.hide();
                })


        };
    });