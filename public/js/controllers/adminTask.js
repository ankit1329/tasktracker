app.controller('AdminTaskCtrl', function($scope, $location, statsService, taskFactory, $window, $rootScope, $auth, $modal, taskService) {


    taskFactory.getAdminTasks()
        .then(function(response) {
            $scope.stats = statsService;
            statsService.statsData = response.data.stats;
            $scope.messages = {
                success: [response.data.msg]
            };

            console.log($scope.messages.success);
            console.log($scope.stats.statsData);
        });
    $scope.task = taskService;


    $scope.showCreateAdminTaskModal = function() {
        $scope.task.selectedTask = {};
        $scope.createAdminTaskModal = $modal({
            scope: $scope,
            templateUrl: 'partials/modal.create.admin.tpl.html',
            show: true
        })
    };

    $scope.createAdminTask = function() {
        console.log("createAdminTask");
        taskFactory.createAdminTask($scope.task.selectedTask)
            .then(function() {
                $scope.createAdminTaskModal.hide();
                taskFactory.getAdminTasks()
                    .then(function(response) {
                        $scope.stats = statsService;
                        statsService.statsData = response.data.stats;
                        $scope.messages = {
                            success: [response.data.msg]
                        };
                    });
            })


    };
});