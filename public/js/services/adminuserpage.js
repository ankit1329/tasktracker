angular.module('MyApp')
    .service('adminuserService', function() {
        return {
            'user': {},
            'task':{},
            'selectedUser': null,
            'userData': [],
            'selectedUserTasks': []
        }
    });
angular.module('MyApp')
    .factory('usersFactory', function($http) {
        return {
            userGet: function(data) {
                return $http.post('/admin/user', data);
            },
            deleteuserAccount: function(data) {
                return $http.post('/user/remove',data);
            },
            createTask: function(data) {
            return $http.post('/admin/assign', data);
        },
            // updateTask: function(data) {
            //     return $http.put('/task/update', data);
            // }
        };
    });

angular.module('MyApp')
    .factory('usertaskFactory', function($http) {
        return {
            getuserTasks: function(data) {
                return $http.post('/admin/user/task', data);
            }
        };
    });