app.controller('StatsCtrl', function($scope, $location, statsService, taskFactory, $window, $rootScope, $auth) {
    $scope.profile = $rootScope.currentUser;

    taskFactory.getStats($scope.profile)
        .then(function(response) {
            $scope.stats = statsService;
            statsService.statsData = response.data.stats;
            $scope.messages = {
                success: [response.data.msg]
            };

            console.log($scope.messages.success);
            console.log($scope.stats.statsData);
        });


    // $location.path('/stats');
});