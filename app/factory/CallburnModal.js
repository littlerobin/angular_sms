module.exports=['$compile', '$rootScope', '$timeout', '$http',
    function ($compile, $rootScope, $timeout, $http) {
        return {
            open: function (ops, callback, video) {
                if(video === undefined) {
                    video = false;
                }
                var template;
                $http.get(ops.templateUrl).success(function (data) {
                    template = data;
                    $timeout(function () {
                        // angular.element("call-modal").remove();
                        $rootScope.showBlurEffect = true;
                        var scope = $rootScope.$new();
                        $rootScope.modalLg = ops.size;
                        ops.scope.isActive = true;
                        if (video) {
                            var modal_template = "<video-modal>" + template + "</video-modal>";
                        } else {
                            var modal_template = "<call-modal>" + template + "</call-modal>";
                        }
                        for (var k in ops.scope) {
                            scope[k] = ops.scope[k];
                        }
                        angular.element('body').append($compile(modal_template)(scope));
                        callback(scope);
                    })
                });
            },
            close: function () {
                $rootScope.showBlurEffect = false;
                $rootScope.modalLg=false;
                angular.element("call-modal").remove();
            }
        }
    }
];