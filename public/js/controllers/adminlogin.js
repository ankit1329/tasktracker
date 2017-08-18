app.controller('AdminCtrl', function($scope, $rootScope, $location, $window, $auth) {

    $scope.login = function() {
        $auth.login($scope.admin)
            .then(function(response) {
                $rootScope.currentAdmin = response.data.admin;
                $window.localStorage.admin = JSON.stringify(response.data.admin);
                $location.path('/admin/user');
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
                $rootScope.currentAdmin = response.data.admin;
                $window.localStorage.admin = JSON.stringify(response.data.admin);
                $location.path('/adminlogin');
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
});





// angular.module('MyApp').service('AdminService',function(){
//     return {
//         adminData :[
//             {
//                 username:'admin',
//                 password:'password'
//             }
//         ]
//     }
// })