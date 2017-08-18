angular.module('MyApp')
    .factory('Account', function($http) {
        return {
            updateProfile: function(data) {
                return $http.put('/account', data);
            },
            changePassword: function(data) {
                return $http.put('/account', data);
            },
            deleteAccount: function() {
                return $http.delete('/account');
            },
            forgotPassword: function(data) {
                return $http.post('/forgot', data);
            },
            resetPassword: function(data, token) {
                return $http.post('/reset/' + token, data);
            }
        };
    });


angular.module('MyApp')
    .directive('fileModel', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);


angular.module('MyApp')
    .service('fileUpload', ['$http', function($http) {
        this.uploadFileToUrl = function(file, uploadUrl) {
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                })
                .success(function() {})
                .error(function() {});
        }
    }]);