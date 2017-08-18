app.controller('ProfileCtrl', function($scope, $rootScope, $location, $window, $auth, Account, fileUpload) {
    $scope.profile = $rootScope.currentUser;

    $scope.updateProfile = function() {
        console.log($scope.profile);
        Account.updateProfile($scope.profile)
            .then(function(response) {
                $rootScope.currentUser = response.data.user;
                $window.localStorage.user = JSON.stringify(response.data.user);
                $scope.messages = {
                    success: [response.data]
                };
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
    };


    $scope.uploadFile = function() {
        var file = $scope.myFile;
        var uploadUrl = "/savedata";
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };

    $scope.changePassword = function() {
        Account.changePassword($scope.profile)
            .then(function(response) {
                $scope.messages = {
                    success: [response.data]
                };
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
    };

    $scope.link = function(provider) {
        $auth.link(provider)
            .then(function(response) {
                $scope.messages = {
                    success: [response.data]
                };
            })
            .catch(function(response) {
                $window.scrollTo(0, 0);
                $scope.messages = {
                    error: [response.data]
                };
            });
    };
    $scope.unlink = function(provider) {
        $auth.unlink(provider)
            .then(function() {
                $scope.messages = {
                    success: [response.data]
                };
            })
            .catch(function(response) {
                $scope.messages = {
                    error: [response.data]
                };
            });
    };

    $scope.deleteAccount = function() {
        Account.deleteAccount()
            .then(function() {
                $auth.logout();
                delete $window.localStorage.user;
                $location.path('/');
            })
            .catch(function(response) {
                $scope.messages = {
                    error: [response.data]
                };
            });
    };
});