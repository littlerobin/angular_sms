angular.module('callburnApp').controller('VideoTutorialController',
    ['$scope', '$rootScope', '$state', "$stateParams", 'Restangular','$sce','CallBournModal', '$timeout',
    function ($scope, $rootScope, $state, $stateParams, Restangular, $sce, CallBournModal, $timeout) {

        $rootScope.currentActiveRoute = 'video'

        window.document.title = $scope.notSeenNotificationsCount === 0 ? 'Support - ' + 'Callburn' : '(' + $scope.notSeenNotificationsCount + ') ' + 'Support - ' + 'Callburn';

        var applyTranslations = function() {
            $scope.isLoaded=false;
            setTimeout( function(){$scope.isLoaded=true}, 100);
            $scope.supportVideos = [
            {selectView: $rootScope.trans('dashboard_dashboard_tutorial'), selectValue: 'tutorial'},
            {selectView: $rootScope.trans('support_promotional'), selectValue: 'promotional'}
            ];
            $scope.videoSection = $scope.supportVideos[0].selectValue;
        }

        $rootScope.$watch('currentLanguage', applyTranslations);
        $rootScope.$watch('isLangLoaded', applyTranslations);

        $scope.playVideo = function (key) {
            var url = $scope.trustURL("https://www.youtube.com/embed/" + key + "?rel=0");
            CallBournModal.open({
                scope: {
                    url : url
                },
                templateUrl: "/app/modals/video/video.html"
            }, function (scope) {

            },true);
        };

        $scope.getThumbnail = function(key) {
            return $scope.trustURL("https://i.ytimg.com/vi/" + key + "/sddefault.jpg");
        }

        $scope.hideSlider = false;

        $rootScope.$watch('currentLanguage', function (newVal) {
            $scope.hideSlider = true;
            // Restangular.one('data/youtube-playlists').get({lang: $rootScope.currentLanguage}).then(function(data) {
            //     var youtubeVideos = data.resource.playlists;
            //     $scope.CTCVideos = youtubeVideos.ctc.promotionals.concat(youtubeVideos.ctc.tutorials);
            //     $scope.VMVideos = youtubeVideos.vm.promotionals.concat(youtubeVideos.vm.tutorials);
            //     setTimeout(function () {
            //         $scope.hideSlider = false;
            //     }, 1000)
            // });
        });

        $scope.locale = $rootScope.currentLanguage ? $rootScope.currentLanguage : 'en';
        if($scope.local == 'db') {
            $scope.local = 'en';
        }

        // $scope.youtubePlaylistObjects = youtubeVideos.resource.playlists;

        $scope.trustURL = function (url) {
            return  $sce.trustAsResourceUrl(url);
        }

        /*TRIGGER CHAT*/
        $scope.triggerChat = function() {
            angular.element(document).ready(function () {
                $crisp.push(["do", "chat:toggle"])
            });
        }

        // slick youtube Videos Config
        $scope.youtubeVideosConfig = {
            asNavFor: '.slider-nav',
            dots: false,
            draggable: false,
            mobileFirst: false,
            arrows: false,
            prevArrow: null,
            nextArrow: null,
            draggable: false,
        };
        $scope.youtubeVideosNavConfig = {
            asNavFor: '.slider-for',
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: false,
            infinite: false,
            mobileFirst: true,
            draggable: true,
            prevArrow: null,
            nextArrow: null,
            focusOnSelect: true,
            responsive: [
            {
                breakpoint: 767,
                settings: {
                    vertical: true,
                }
            },
            {
                breakpoint: 319,
                settings: {
                    vertical: false,
                }
            }
                
            ]
        };
        $scope.youtubeVideosConfigCTC = {
            asNavFor: '.slider-navCTC',
            dots: false,
            draggable: false,
            mobileFirst: false,
            arrows: false,
            prevArrow: null,
            nextArrow: null,
            draggable: false,
        };
        $scope.youtubeVideosNavConfigCTC = {
            asNavFor: '.slider-forCTC',
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: false,
            infinite: false,
            mobileFirst: true,
            draggable: true,
            prevArrow: null,
            nextArrow: null,
            focusOnSelect: true,
            responsive: [
            {
                breakpoint: 767,
                settings: {
                    vertical: true,
                }
            },
            {
                breakpoint: 319,
                settings: {
                    vertical: false,
                }
            }
                
            ]
        };

    }]);
