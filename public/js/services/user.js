angular.module('MyApp')
    .service('userService', function() {
        return {
            'user': null,
        }
    });
    angular.module('MyApp')
    .factory('adduserFactory', function($http) {
        return {
             getUsers: function(data) {
                 return $http.post('/admin/user', data);
             },
            // updateTask: function(data) {
            //     return $http.put('/task/update', data);
            // },
            addUser: function(data) {
                return $http.post('/user/add', data);
            }
        };
    });