app.controller('AdminChartCtrl', function($scope, $location, statsService, taskFactory, $window, $rootScope, $auth) {
    $scope.profile = $rootScope.currentUser;
    taskFactory.getAdminChart()
        .then(function(response) {


            //pie chart
            var all = response.data.all;
            var comp = response.data.comp;
            var pend = response.data.pend;
            var work = response.data.work;
            var users = response.data.users;
            var usersno = response.data.totalUsers;
            $scope.labels = ["Completed Tasks", "Pending Tasks", "Ongoing Tasks"];
            $scope.data = [comp, pend, work];
            $scope.options = { legend: { display: true } };



            //bar chart
            $scope.users = response.data.users;
            $scope.barlabels = [];
            for (user of $scope.users) {
                $scope.barlabels.push(formatDate(user.createdAt));
            }
            $scope.baroptions = { legend: { display: true } };
            $scope.barseries = ['Series A', 'Series B', 'Series C'];
            $scope.bardata = [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90],
                [28, 48, 40, 19, 86, 27, 90]
            ];



        });
    taskFactory.getIndividualTasks()
        .then(function(response) {
            console.log(response);
        });



    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [day, month, year].join('-');
    }





});