app.service('taskService', function() {
    return {
        'selectedTask': null,
        'taskData': []
    }
});


app.service('statsService', function() {
    return {
        // 'selectedTask': null,
        'statsData': []
    }
});



app.factory('taskFactory', function($http) {
    return {
        getTasks: function(data) {
            return $http.post('/task', data);
        },
        updateTask: function(data) {
            return $http.put('/task/update', data);
        },
        createTask: function(data) {
            return $http.post('/task/create', data);
        },
        getStats: function(data) {
            return $http.post('/stats', data)
        },
        getAdminTasks: function() {
            return $http.get('/tasks')
        },
        getAllTasks: function() {
            return $http.post('/admin/allTasks')
        },
        getCompletedTasks: function() {
            return $http.post('/admin/completedTasks');
        },
        getPendingTasks: function() {
            return $http.post('/admin/pendingTasks');
        },
        getWorkingTasks: function() {
            return $http.post('/admin/workingTasks');
        },
        getUserTaskDetail: function(data) {
            return $http.post('/admin/userTaskDetail', data);
        },
        createAdminTask: function(data) {
            return $http.post('/task/createAdminTask', data);
        },
        getAdminChart: function(data) {
            return $http.post('/task/getAdminChart', data);
        },
        getIndividualTasks: function(data) {
            return $http.post('/task/getIndividualTasks', data);
        },

    };
});