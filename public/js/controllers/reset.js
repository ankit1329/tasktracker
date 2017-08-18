app.controller('ResetCtrl', function($scope, $location, Account) {
    var passedToken = $location.path()
        .split('/')
        .pop();
    $scope.resetPassword = function() {
        Account.resetPassword($scope.user, passedToken)
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
    }
});