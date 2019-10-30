module.exports = function ($stateProvider, $rootScope) {
    $stateProvider
        .state('campaign', {
            url: '/campaign',
            templateUrl: '/app/engines/campaign/main.html',
            controller: function ($state, $rootScope) {
                /*if(! $rootScope.checkAccessBeta) {
                 $state.go('dashboard.dashboard');
                 }*/
                if ($state.current.name == 'campaign') {
                    $state.go('campaign.compose');
                }
            }
        })
        .state('campaign.compose', {
            url: '/compose',
            templateUrl: '/app/engines/campaign/compose/views/index.html',
            controller: 'ComposeController',
            params: {
                tab: 1,
                audioFile: null,
                reusing_source: null,
                contact_ids: null,
                group_ids: null,
                campaign_id: null,
                phonenumbers: null,
                file_id : null,
                hide_all_arrows: false
            },
            resolve: {
                ttsLanguages: function (Restangular) {
                    return Restangular.one('data/tts-languages').get();
                },
                audioFiles: function (Restangular) {
                    return Restangular.one('audio-files/audio-templates').get();
                },
                editingCampaign: function () {
                    return null;
                },
                reusingCampaign: function (Restangular, $stateParams) {
                    return $stateParams.campaign_id ? Restangular.one('campaigns/show-campaign', $stateParams.campaign_id).get() : null;
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/campaign/compose/services/CampaignComposeService.js',
                            '/app/engines/campaign/compose/services/CampingService.js',
                            '/app/engines/account/settings/services/SettingsService.js',
                            '/app/engines/campaign/compose/controllers/ComposeController.js',
                            '/app/engines/campaign/compose/controllers/ComposeStep1Controller.js',
                            '/app/engines/campaign/compose/controllers/ComposeStep2Controller.js',
                            '/app/engines/campaign/compose/controllers/ComposeStep3Controller.js',
                            '/app/engines/addressbook/contacts/services/ContactsService.js',
                            '/app/engines/addressbook/groups/services/GroupsService.js',
                        ]
                    });
                }]
            }
        })
        .state('campaign.edit', {
            url: '/edit/:campaign_id',
            templateUrl: '/app/engines/campaign/compose/views/index.html',
            controller: 'ComposeController',
            params: {
                tab: 3,
                disableArrowHelper: true,
                action: null,
            },
            resolve: {
                ttsLanguages: function (Restangular) {
                    return Restangular.one('data/tts-languages').get();
                },
                audioFiles: function (Restangular) {
                    return Restangular.one('audio-files/audio-templates').get();
                },
                editingCampaign: function (Restangular, $stateParams) {
                    return Restangular.one('campaigns/show-campaign', $stateParams.campaign_id).get();
                },
                reusingCampaign: function () {
                    return null;
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/campaign/compose/services/CampaignComposeService.js',
                            '/app/engines/campaign/compose/services/CampingService.js',
                            '/app/engines/account/settings/services/SettingsService.js',
                            '/app/engines/campaign/compose/controllers/ComposeStep1Controller.js',
                            '/app/engines/campaign/compose/controllers/ComposeStep2Controller.js',
                            '/app/engines/campaign/compose/controllers/ComposeStep3Controller.js',
                            '/app/engines/campaign/compose/controllers/ComposeController.js',
                            '/app/engines/addressbook/contacts/services/ContactsService.js',
                            '/app/engines/addressbook/groups/services/GroupsService.js',
                        ]
                    });
                }]
            }
        })
        // .state('campaign.batch', {
        //     url: '/batch',
        //     templateUrl: '/app/engines/campaign/batch/views/index.html',
        //     controller: 'BatchesController',
        //     resolve: {
        //         ttsLanguages: function (Restangular) {
        //             return Restangular.one('data/tts-languages').get();
        //         },
        //         audioFiles: function (Restangular) {
        //             return Restangular.one('audio-files/audio-templates').get();
        //         },
        //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'callburnApp',
        //                 files: [
        //                     '/app/engines/account/settings/services/SettingsService.js',
        //                     '/app/engines/campaign/batch/services/BatchesService.js',
        //                     '/app/engines/campaign/batch/controllers/BatchesController.js',
        //                     '/app/engines/campaign/compose/services/CampaignComposeService.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })
        .state('campaign.overview', {
            url: '/overview/:status?/:showTutorial?/:orderBy?',
            templateUrl: '/app/engines/campaign/overview/views/index.html',
            controller: 'MessagesOverviewController',
            params: {
                retainedBalance: false,
            },
            resolve: {
                campaigns: function (Restangular, $stateParams) {

                    if($stateParams.status){
                        // $stateParams.checkbox = {};
                        // $stateParams.checkbox[$stateParams.status] = true;

                        var data = {
                            checkbox : JSON.stringify(["dialing_completed", "start", "saved", "scheduled", "stop"])
                        }
                    } else if($stateParams.retainedBalance) {

                        $stateParams.checkbox = JSON.stringify(["scheduled"]);
                        var data = {
                            checkbox : JSON.stringify(["scheduled", "start"])
                        }

                    }
                    if ($stateParams.orderBy) {
                        data = {
                            order_field: $stateParams.orderBy,
                        }
                    }
                    return Restangular.one('campaigns/index-campaigns').get(data);
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/campaign/overview/controllers/MessagesOverviewController.js'
                        ]
                    });
                }]
            }
        })
        .state('campaign.statistics', {
            url: '/statistics/:campaign_batch?/:campaign_id?/:action?/:status?/:is_multiple?/:campaignId?/:serverTimeZone?',
            templateUrl: '/app/engines-origin/campaign/statistics/views/index.html',
            controller: 'MessagesStatisticsController',
            resolve: {
                phonenumbers: function (Restangular, $stateParams) {
                    $stateParams.statuses = JSON.stringify(["success", "failed", "sent", "IN_PROGRESS"]);
                    return Restangular.all('phonenumbers/campaign-phonenumbers').post($stateParams);
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines-origin/campaign/statistics/controllers/MessagesStatisticsController.js',
                        ]
                    });
                }]
            }
        })
        .state('campaign.templates', {
            url: '/templates',
            templateUrl: '/app/engines/campaign/template/views/index.html',
            controller: 'TemplatesController',
            resolve: {
                audioFiles: function (Restangular, $stateParams) {
                    $stateParams.checkbox = JSON.stringify(["UPLOADED","TTS"])
                    return Restangular.one('audio-files/audio-templates').get($stateParams);
                },
                ttsLanguages: function (Restangular) {
                    return Restangular.one('data/tts-languages').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/campaign/template/services/TemplateService.js',
                            '/app/engines/campaign/template/controllers/TemplatesController.js'
                        ]
                    });
                }]
            }
        })
        .state('campaign.addtemplate', {
            url: '/add-templates',
            templateUrl: '/app/engines/campaign/add-template/views/index.html',
            controller: 'AddAudioTemplateController',
            resolve: {
                ttsLanguages: function (Restangular) {
                    return Restangular.one('data/tts-languages').get();
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'callburnApp',
                        files: [
                            '/app/engines/campaign/add-template/controllers/AddAudioTemplateController.js',
                        ]
                    });
                }]
            }
        })
};