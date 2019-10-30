angular.module('callburnApp').controller('BatchesController',
    ['$scope', '$rootScope', '$state', '$stateParams',
        'FileUploader', '$sce', '$timeout', 'BatchesService',
        'CallBournModal', 'ttsLanguages', "CallBournScrollTop", "$location", "growl", "Restangular", "SettingsService", "audioFiles", "CampaignComposeService",
        function ($scope, $rootScope, $state, $stateParams,
                  FileUploader, $sce, $timeout, BatchesService,
                  CallBournModal, ttsLanguages, CallBournScrollTop, $location, growl, Restangular, SettingsService, audioFiles, CampaignComposeService) {

            /////////////////////////////////Variables//////////////////////////////////////////////////////////////////
            $scope.availableTts = {
                'Alice-ML' : true,
                'Anna-ML' : true,
                'Daniel' : true,
                'Ellen' : true,
                'Empar' : true,
                'Joana' : true,
                'Jordi' : true,
                'Lekha' : true,
                'Milena' : true,
                'Monica' : true,
                'Paulina' : true,
                'Samantha' : true,
                'Satu' : true,
                'Tarik' : true,
                'Thomas' : true,
                'Zosia' : true,
            };
            $rootScope.tutorialSidePopup = false;
            $scope.CampaignComposeService = CampaignComposeService;
            $rootScope.currentActiveUrl = $state.current.name;
            $scope.finalStepData = {sendingTime: 3};
            $scope.isFileUploaded = 0;
            $scope.callbackAudioFiles = [];
            $scope.resipentsCount = 1;
            $scope.CampaignComposeService.ttsLanguages = ttsLanguages.resource.languages;
            $scope.chosedInteractions = [];
            $scope.interactionsForModal = [];


            // form data
            $scope.campaignData = {
                remaining_repeats: 0,
                repeat_days_interval: 0,
                caller_id: $rootScope.currentUser.numbers.length > 0 ? $rootScope.currentUser.numbers[0].phone_number : {},
                playback_count: 1
            };

            $scope.replayDigit = {onOff: false};
            $scope.transferDigit = {onOff: false};
            $scope.callbackDigit = {onOff: false};
            $scope.doNotCallDigit = {onOff: false};


            //languages
            $scope.CampaignComposeService.ttsLanguages.forEach(function (item) {
                item.selectView = item.languageName + '-' + item.ttsEngine;
            });
            //audio files
            $scope.CampaignComposeService.audioTemplates = audioFiles.resource;

            $scope.CampaignComposeService.audioTemplates.files.forEach(function (item) {
                item.selectView = item.orig_filename + ' - ' + item.length;
            });

            /**
             * get tts demo url
             * @returns {*}
             */
            $scope.getTTSUrl = function () {
                return $sce.trustAsResourceUrl('/assets/callburn/tts/' + $scope.campaignData.tts_language + '.wav');
            };

            /**
             * play tts demo audio
             */
            $scope.playTTSDemo = function () {
                document.getElementById('ttsDemoAudio').play();
            };

            //store data to send in backend
            $scope.storeFromData = {};

            $scope.reloadUsersData = function () {
                SettingsService.getShowUser().then(function (data) {
                    if (data.resource.user_data) {
                        $rootScope.currentUser = data.resource.user_data;
                    }
                })
            };

            $scope.hasEnoughBalanceToValidate = function(){
                var messageCost = $scope.finalStepData.maxCost;
                var freeBalance = $rootScope.currentUser.balance - $scope.finalStepData.maxGiftCost - $rootScope.currentUser.retainedBalance;
                return freeBalance > messageCost;
            }

            $scope.changePlaybackCount = function (count) {
                $scope.campaignData.playback_count = count;
            };
            $scope.getPlaybackCount = function (count) {
                return $scope.campaignData.playback_count == count;
            };
            $scope.changeRepeatsCount = function (action) {
                if (action == "-" && $scope.campaignData.remaining_repeats > 0) {
                    $scope.campaignData.remaining_repeats = Number($scope.campaignData.remaining_repeats) - 1;
                }
                if (action == '+') {
                    $scope.campaignData.remaining_repeats = Number($scope.campaignData.remaining_repeats) + 1;
                }
            };

            //$scope.campaignData.caller_id = $rootScope.currentUser.numbers[0] ? $rootScope.currentUser.numbers[0].phone_number : null;

            /////////////////////////////////Variables//////////////////////////////////////////////////////////////////


            /////////////////////////////////////////  FILE UPLOADER ///////////////////////////////////////////////////
            var campaignBatchFileUpload = $scope.campaignBatchFileUpload = new FileUploader({
                url: '/phonenumbers/validate-batch-file',
                alias: 'file',
                autoUpload: true,
                formData: [$scope.batchTtsData]
            });

            campaignBatchFileUpload.onAfterAddingFile = function (item) {
                $rootScope.disableButton();
                $scope.uploadingBatchName = item.file.name;
            }
            campaignBatchFileUpload.onSuccessItem = function (item, response) {
                $rootScope.enabledButton();
                if (response.resource && response.resource.error.no == 0) {
                    if (response.resource.phonenumbers.length == 0) {
                        growl.error($rootScope.trans("No__valid_phone_numbers"));
                    } else {
                        $scope.campaignData.phonenumbers_with_text = response.resource.phonenumbers_with_text;
                        $scope.finalStepData.maxCost = response.resource.max_cost;
                        $scope.finalStepData.maxGiftCost = response.resource.max_gift_cost;
                        $scope.finalStepData.numbersCount = response.resource.phonenumbers.length;
                        $scope.pagesCount = Math.ceil(response.resource.phonenumbers.length / 10);
                        $scope.isFileUploaded = 1;
                        setTimeout(function () {
                            window.scrollTo(0, document.body.scrollHeight);
                        }, 1000);
                    }

                } else {
                    growl.error($rootScope.trans('File_format_not_supported'));
                }
            };

            campaignBatchFileUpload.onErrorItem = function (item, response) {
                $rootScope.enabledButton();
                $scope.errors = response;
            };

            $scope.startBatchFileUpload = function () {
                campaignBatchFileUpload.uploadAll();
            };


            /**
             * open camping file select
             */
            $scope.openCampaignVoiceFileSelect = function () {
                $timeout(function () {
                    angular.element('#campaignDoNotCallFileInput').trigger('click');
                }, 100);
            };

            /////////////////////////////////  FILE UPLOADER ///////////////////////////////////////////////////////////
            $scope.hasInArray = function (array, item) {
                for (var j = 0; j < array.length; j++) {
                    if (array[j] === item) {
                        return true;
                    }
                }
                return false;
            };

            /***************************** INTERACTIONS ***********************/
            $scope.showReplayModal = function () {

                $scope.replayDigit.onOff = false;
                CallBournModal.open({
                    scope: {
                        $scope: $scope,
                        CampaignComposeService: CampaignComposeService

                    },
                    templateUrl: "/app/modals/camping-batch/activate-replay.html",
                }, function (scope) {
                    //unchecked by default
                    $scope.CampaignComposeService.replayDigit.checkboxChecked = false;

                    /**
                     * activated replay digit
                     */
                    scope.replyDigitActivated = function () {
                        if (!CampaignComposeService.replayDigit.checkboxChecked) {
                            return;
                        }
                        $scope.replayDigit.onOff = true;
                        CallBournModal.close();

                        CallBournModal.open({
                            scope: {
                                chosedInteractions: $scope.chosedInteractions,
                                hasInArray: $scope.hasInArray

                            },
                            templateUrl: "/app/modals/camping-batch/dijit-choosen.html",
                        }, function (scope) {

                            scope.selectInteraction = function (interaction) {
                                $scope.campaignData.replay_digit = interaction;
                                $scope.chosedInteractions[0] = interaction;
                                CallBournModal.close();
                            }

                        });
                    };

                });
            };

            $scope.showTransferModal = function () {
                $scope.transferDigit.onOff = false;
                $scope.transferDigit.checkboxChecked = false;
                CallBournModal.open({
                    scope: {
                        $scope: $scope,
                        currentUser: $rootScope.currentUser,
                        liveTransferNumbers: [],
                        transferStep: 1,
                        CampaignComposeService: $scope.CampaignComposeService,
                        campaignData: $scope.campaignData
                    },
                    templateUrl: "/app/modals/camping-batch/activate-transfer.html",
                    size: "modal-md"
                }, function (scope) {
                    scope.transferLimit = {
                        1: {value: 1},
                        2: {value: 2},
                        3: {value: 3},
                        4: {value: 4},
                        5: {value: 5},
                        6: {value: 6},
                        7: {value: 7},
                        8: {value: 8},
                        9: {value: 9},
                        10: {value: 10}
                    }
                    $scope.liveTransferNumbers = [];
                    /**
                     * activate transfer
                     */
                    scope.activateTransferDigit = function () {
                        if (!CampaignComposeService.transferDigit.checkboxChecked) {
                            return;
                        }
                        $scope.transferDigit.onOff = true;
                        $scope.campaignData.transfer_options = scope.liveTransferNumbers.join();

                        CallBournModal.close();
                        CallBournModal.open({
                            scope: {
                                chosedInteractions: $scope.chosedInteractions,
                                hasInArray: $scope.hasInArray

                            },
                            templateUrl: "/app/modals/camping-batch/dijit-choosen.html",
                        }, function (scope) {

                            scope.selectInteraction = function (interaction) {
                                $scope.campaignData.transfer_digit = interaction;
                                $scope.chosedInteractions[1] = interaction;
                                CallBournModal.close();
                            }


                        });

                    };
                    /**
                     * add remove transsef number
                     * @param number
                     * @param tariffId
                     */
                    scope.addRemoveTransfer = function (number, tariffId) {
                        var index = scope.liveTransferNumbers.indexOf(number);
                        if (index > -1) {
                            scope.liveTransferNumbers.splice(index, 1);
                        } else {
                            scope.liveTransferNumbers.push(number);
                        }
                    };

                    scope.chnageTransferStep = function (step) {
                        scope.transferStep = step;
                    }
                });
            };

            $scope.showCallbackModal = function () {
                $scope.callbackDigit.onOff = false;
                $scope.callbackDigit.checkboxChecked = false;
                CallBournModal.open({
                    scope: {
                        availableTts: $scope.availableTts,
                        ttsLanguages: $scope.ttsLanguage,
                        callbackTtsData: {},
                        uploadingCallbackAudioName: '',
                        tempAudioTemplateModel: {},
                        callbackAudioFiles: [],
                        callbackStep: 1,
                        checkedAll: false,
                        CampaignComposeService: CampaignComposeService,


                    },
                    templateUrl: "/app/modals/camping-batch/activate-callback.html",
                    size: "modal-md"
                }, function (scope) {
                    /**
                     * activate callback digit
                     */
                    scope.activateCallbackDigit = function () {
                        $scope.callbackDigit.onOff = true;
                        CallBournModal.close();
                        CallBournModal.open({
                            scope: {
                                chosedInteractions: $scope.chosedInteractions,
                                hasInArray: $scope.hasInArray

                            },
                            templateUrl: "/app/modals/camping-batch/dijit-choosen.html",
                        }, function (scope) {

                            scope.selectInteraction = function (interaction) {
                                $scope.campaignData.callback_digit = interaction;
                                $scope.chosedInteractions[2] = interaction;
                                CallBournModal.close();
                            }


                        });
                    };
                    /**
                     * chnage stap modal
                     * @param step
                     */
                    scope.changeCallbackStep = function (step) {
                        scope.callbackStep = step;
                    }
                    /**
                     * open file select by tirger click
                     */
                    scope.openBatchFileSelect = function () {
                        $timeout(function () {
                            angular.element('#campaignBatchFileInput').trigger('click');
                        }, 100);
                    }
                    scope.checkAll = function () {
                        return !$scope.callbackDigit.checkboxChecked;
                    }

                    scope.callbackAudioTemplateSelected = function (file) {
                        scope.selectedCallbackAudioTemplateFile = file;
                    }


                    scope.selectCallbackNewCreatedAudioFile = function (file) {
                        scope.newCallbackSelectedAudioFile = file.file;
                        $scope.campaignData.callback_voice_file_id = file.file._id;
                    }

                    scope.playPauseCallbackTemplateAudio = function (action) {
                        if (!scope.selectedCallbackAudioTemplateFile._id) {
                            return;
                        }
                        var audio = document.getElementById('callbackAudioFileTemplate');
                        if (action == 'play') {
                            audio.play();
                            scope.isCallbackTemplateFilePlaying = true;
                            audio.addEventListener('ended', function () {
                                scope.isCallbackTemplateFilePlaying = false;
                                scope.$apply();
                            }, false);
                        } else {
                            audio.pause();
                            scope.isCallbackTemplateFilePlaying = false;
                        }
                    }

                    scope.playPauseCallbackNewCreatedAudio = function (action) {
                        if (!scope.newCallbackSelectedAudioFile._id) {
                            return;
                        }
                        var templateId = scope.newCallbackSelectedAudioFile._id;
                        var audio = document.getElementById('callbackCreatedAudioFile');
                        if (action == 'play') {
                            audio.play();
                            scope.isCallbackNewCreatedFilePlaying = true;
                            audio.addEventListener('ended', function () {
                                scope.isCallbackNewCreatedFilePlaying = false;
                                scope.$apply();
                            }, false);
                        } else {
                            audio.pause();
                            scope.isCallbackNewCreatedFilePlaying = false;
                        }
                    }

                    scope.saveTemplateAsCallback = function () {
                        scope.callbackAudioFiles.push({
                            file: scope.selectedCallbackAudioTemplateFile,
                            name: scope.selectedCallbackAudioTemplateFile.map_filename + ' - ' + scope.selectedCallbackAudioTemplateFile.length
                        });
                    }

                    scope.isCallbackAlreadyAdded = function () {
                        if (!scope.selectedCallbackAudioTemplateFile) {
                            return false;
                        }
                        for (index in scope.callbackAudioFiles) {
                            if (scope.callbackAudioFiles[index].file._id == scope.selectedCallbackAudioTemplateFile._id) {
                                return true;
                            }
                            return false;
                        }
                    }


                    /**
                     * file uloader instance
                     */
                    scope.callbackDigitFileUpload = new FileUploader({
                        url: '/campaigns/upload-audio-file',
                        alias: 'file',
                        autoUpload: true
                    });

                    scope.callbackDigitFileUpload.onAfterAddingFile = function (item) {
                        $rootScope.startModalLoader();
                        scope.uploadingAudioName = item.file.name;
                    };
                    /**
                     * return success data
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.callbackDigitFileUpload.onSuccessItem = function (item, response, status, headers) {
                        $rootScope.stopModalLoader();
                        if (response.resource.error.no == 0) {
                            scope.uploadingCallbackAudioName = false;
                            var file = response.resource.file;
                            var audioData = {
                                source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                                file: file,
                                name: file.orig_filename + ' - ' + file.length
                            };
                            scope.callbackAudioFiles.push(audioData);
                            growl.success(trans(response.resource.error.message));
                        } else {
                            growl.error(trans(response.resource.error.text));
                        }
                    };
                    /**
                     * file uploading error action
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.callbackDigitFileUpload.onErrorItem = function (item, response, status, headers) {
                        $rootScope.stopModalLoader();
                        $scope.errors = response;
                    };

                    /**
                     * start callback upload
                     */
                    scope.startCallbackUpload = function () {
                        $rootScope.startLoader();
                        $scope.callbackDigitFileUpload.uploadAll();
                    };

                    /**
                     * open file select
                     */
                    scope.openCallbackFileSelect = function () {
                        $timeout(function () {
                            angular.element('#campaignCallbackFileInput').trigger('click');
                        }, 100);
                    };

                    scope.createAudioFromTextForCallback = function () {
                        $rootScope.startModalLoader();
                        Restangular.all('campaigns/create-audio-from-text').post(scope.callbackTtsData).then(function (data) {
                            $rootScope.stopModalLoader();

                            if (data.resource.error.no == 0) {
                                scope.callbackTtsData = {language: null};
                                var file = data.resource.file;
                                var audioData = {
                                    source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                                    file: file,
                                    name: file.orig_filename + ' - ' + file.length
                                };
                                scope.callbackAudioFiles.push(audioData);
                                $scope.CampaignComposeService.audioTemplates.files.push(data.resource.file);
                                $scope.campaignData.callback_voice_file_id = file._id;
                                $scope.CampaignComposeService.audioTemplates.files.forEach(function (item) {
                                    item.selectView = item.orig_filename + ' - ' + item.length;
                                });
                            } else {
                                growl.error(trans(data.resource.error.text));
                            }
                        });
                    }

                    scope.getTTSUrl = function () {
                        return $sce.trustAsResourceUrl('/assets/callburn/tts/' + $scope.campaignData.tts_language + '.wav');
                    };

                    scope.playTTSDemo = function () {
                        document.getElementById('ttsDemoAudio').play();
                    };
                });
            };

            $scope.showDoNotCallModal = function () {

                $scope.doNotCallDigit.onOff = false;
                $scope.doNotCallDigit.checkboxChecked = false;
                CallBournModal.open({
                    scope: {
                        $scope: $scope,
                        availableTts: $scope.availableTts,
                        doNotCallTtsData: {},
                        uploadingDoNotCallAudioName: '',
                        tempAudioTemplateModel: {},
                        doNotCallAudioFiles: [],
                        doNotCallStep: 1,
                        checkedAll: false,
                        CampaignComposeService: $scope.CampaignComposeService

                    },
                    templateUrl: "/app/modals/camping-batch/activate-do-not-call.html",
                    size: "modal-md"
                }, function (scope) {
                    /**
                     * activate doNotCall digit
                     */
                    scope.activateDoNotCallDigit = function () {
                        $scope.doNotCallDigit.onOff = true;
                        CallBournModal.close();
                        CallBournModal.open({
                            scope: {
                                chosedInteractions: $scope.chosedInteractions,
                                hasInArray: $scope.hasInArray

                            },
                            templateUrl: "/app/modals/camping-batch/dijit-choosen.html",
                        }, function (scope) {

                            scope.selectInteraction = function (interaction) {
                                $scope.campaignData.do_not_call_digit = interaction;
                                $scope.chosedInteractions[3] = interaction;
                                CallBournModal.close();
                            }


                        });
                    };
                    /**
                     * chnage stap modal
                     * @param step
                     */
                    scope.changeDoNotCallStep = function (step) {
                        scope.doNotCallStep = step;
                    }
                    /**
                     * open file select by tirger click
                     */
                    scope.openBatchFileSelect = function () {
                        alert("ok");
                        $timeout(function () {
                            angular.element('#campaignBatchFileInput').trigger('click');
                        }, 100);
                    }
                    scope.checkAll = function () {
                        return !CampaignComposeService.callbackDigit.checkboxChecked;
                    }

                    scope.doNotCallAudioTemplateSelected = function (file) {
                        scope.selectedDoNotCallAudioTemplateFile = file;
                    }


                    scope.selectDoNotCallNewCreatedAudioFile = function (file) {
                        scope.newDoNotCallSelectedAudioFile = file.file;
                        $scope.campaignData.do_not_call_voice_file_id = file.file._id;
                    }

                    scope.playPauseDoNotCallTemplateAudio = function (action) {
                        if (!scope.selectedDoNotCallAudioTemplateFile._id) {
                            return;
                        }
                        var audio = document.getElementById('doNotCallAudioFileTemplate');
                        if (action == 'play') {
                            audio.play();
                            scope.isDoNotCallTemplateFilePlaying = true;
                            audio.addEventListener('ended', function () {
                                scope.isDoNotCallTemplateFilePlaying = false;
                                scope.$apply();
                            }, false);
                        } else {
                            audio.pause();
                            scope.isDoNotCallTemplateFilePlaying = false;
                        }
                    }

                    scope.playPauseDoNotCallNewCreatedAudio = function (action) {
                        if (!scope.newDoNotCallSelectedAudioFile._id) {
                            return;
                        }
                        var templateId = scope.newDoNotCallSelectedAudioFile._id;
                        var audio = document.getElementById('doNotCallCreatedAudioFile');
                        if (action == 'play') {
                            audio.play();
                            scope.isDoNotCallNewCreatedFilePlaying = true;
                            audio.addEventListener('ended', function () {
                                scope.isDoNotCallNewCreatedFilePlaying = false;
                                scope.$apply();
                            }, false);
                        } else {
                            audio.pause();
                            scope.isDoNotCallNewCreatedFilePlaying = false;
                        }
                    }

                    scope.saveTemplateAsDoNotCall = function () {
                        scope.doNotCallAudioFiles.push({
                            file: scope.selectedDoNotCallAudioTemplateFile,
                            name: scope.selectedDoNotCallAudioTemplateFile.map_filename + ' - ' + scope.selectedDoNotCallAudioTemplateFile.length
                        });
                    }

                    scope.isDoNotCallAlreadyAdded = function () {
                        if (!scope.selectedDoNotCallAudioTemplateFile) {
                            return false;
                        }
                        for (index in scope.doNotCallAudioFiles) {
                            if (scope.doNotCallAudioFiles[index].file._id == scope.selectedDoNotCallAudioTemplateFile._id) {
                                return true;
                            }
                            return false;
                        }
                    }


                    /**
                     * file uloader instance
                     */
                    scope.doNotCallDigitFileUpload = new FileUploader({
                        url: '/campaigns/upload-audio-file',
                        alias: 'file',
                        autoUpload: true
                    });

                    scope.doNotCallDigitFileUpload.onAfterAddingFile = function (item) {
                        $rootScope.startModalLoader();
                        scope.uploadingAudioName = item.file.name;
                    };
                    /**
                     * return success data
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.doNotCallDigitFileUpload.onSuccessItem = function (item, response, status, headers) {
                        $rootScope.stopModalLoader();
                        if (response.resource.error.no == 0) {
                            scope.uploadingDoNotCallAudioName = false;
                            var file = response.resource.file;
                            var audioData = {
                                source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                                file: file,
                                name: file.orig_filename + ' - ' + file.length
                            };
                            //console.log(response.resource.file);
                            scope.doNotCallAudioFiles.push(audioData);
                            /*scope.doNotCallAudioFiles.forEach(function (item) {
                             item.viewSelect = item.file.orig_filename + ' - ' + item.file.length
                             });*/
                            growl.success(trans(response.resource.error.message));
                        } else {
                            growl.error(trans(response.resource.error.text));
                        }
                    };
                    /**
                     * file uploading error action
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.doNotCallDigitFileUpload.onErrorItem = function (item, response, status, headers) {
                        $scope.errors = response;
                        $rootScope.stopModalLoader();
                    };
                    /**
                     * start doNotCall upload
                     */
                    scope.startDoNotCallUpload = function () {
                        alert("ok");
                        scope.doNotCallDigitFileUpload.uploadAll();
                    };
                    /**
                     * open file select
                     */
                    scope.openDoNotCallFileSelect = function () {

                        $timeout(function () {
                            angular.element('#campaignDoNotCallFileInput').trigger('click');
                        }, 100);
                    };


                    scope.createAudioFromTextForDoNotCall = function () {
                        $rootScope.startModalLoader();
                        BatchesService.createAudioFromText(scope.doNotCallTtsData).then(function (data) {
                            $rootScope.stopModalLoader();
                            if (data.resource.error.no == 0) {
                                scope.doNotCallTtsData = {};
                                file = data.resource.file;
                                var audioData = {
                                    source: $sce.trustAsResourceUrl(file.amazon_s3_url),
                                    file: file,
                                    name: file.orig_filename + ' - ' + file.length
                                };
                                scope.doNotCallAudioFiles.push(audioData);
                                scope.seletedTemplateId = file._id;
                                $scope.CampaignComposeService.audioTemplates.files.push(data.resource.file);
                                $scope.CampaignComposeService.audioTemplates.files.forEach(function (item) {
                                    item.selectView = item.orig_filename + ' - ' + item.length;
                                });
                            }
                        });
                    };

                    scope.getTTSUrl = function () {
                        return $sce.trustAsResourceUrl('/assets/callburn/tts/' + $scope.campaignData.tts_language + '.wav');
                    };

                    scope.playTTSDemo = function () {
                        document.getElementById('ttsDemoAudio').play();
                    };

                });
            };
            /************************** END INTERACTIONS **********************/


            /*********************** MODALS ***************************/
            $scope.showChangeDeliverySpeedModal = function () {
                CallBournModal.open({
                    scope: {campaignData: $scope.campaignData},
                    templateUrl: "/app/modals/camping-batch/change-message-delivery-speed.html",
                }, function (scope) {
                    /**
                     * select sending time
                     * @param data
                     */
                    scope.maxSpeedSelect = {
                        0: {value: "", text: $rootScope.trans('message_delivery_speed_modal_max_speed')},
                        1: {value: 30, text:  $rootScope.trans('message_delivery_speed_modal_Inside') + " 30  " + $rootScope.trans('message_delivery_speed_modal_minutes')},
                        2: {value: 60, text:  $rootScope.trans('message_delivery_speed_modal_Inside') + " 60  " + $rootScope.trans('message_delivery_speed_modal_minutes')},
                        3: {value: 90, text:  $rootScope.trans('message_delivery_speed_modal_Inside') + " 90  " + $rootScope.trans('message_delivery_speed_modal_minutes')},
                        4: {value: 120, text: $rootScope.trans('message_delivery_speed_modal_Inside') + " 120 " + $rootScope.trans('message_delivery_speed_modal_minutes')}
                    }
                    scope.selectSendingTime = function (data) {
                        if (data.sending_time == "") {
                            $scope.finalStepData.sendingTime = 3;
                        } else {
                            $scope.finalStepData.sendingTime = data.sending_time;
                        }

                    }
                });
            }

            $scope.changeCallerIdModal = function () {
                CallBournModal.open({
                    scope: {
                        currentUser: $rootScope.currentUser,
                        selectedCallerId: $scope.campaignData.caller_id
                    },
                    templateUrl: "/app/modals/camping-batch/change-caller-id.html"
                }, function (scope) {
                    console.log(scope.currentUser);
                    scope.callerIdSelected = function (number) {
                        scope.selectedCallerId = number;
                    };
                    scope.changeCallerId = function () {
                        $scope.campaignData.caller_id = scope.selectedCallerId;
                        $scope.campaignData.caller_id = scope.selectedCallerId;
                        CallBournModal.close();
                    }
                });
            };
            /*********************** MODALS ***************************/




            ////////////////////////////////////////////////////////////MODALS//////////////////////////////////////////

            ///////////////////////////////////////////////////////////FUNCTIONS////////////////////////////////////////


            $scope.removeOneBatch = function (index) {
                if ($scope.campaignData.phonenumbers_with_text.length == 1) {
                    growl.info($rootScope.trans('You_need_to_have_at_least_1_receipent'));
                    return;
                }
                $scope.campaignData.phonenumbers_with_text.splice(index, 1);
                $scope.finalStepData.numbersCount = $scope.finalStepData.numbersCount - 1;
            };

            $scope.inlineDataChanged = function (whichOne, index, event) {
                var text = $(event.target).text();
                $scope.campaignData.phonenumbers_with_text[index][whichOne] = text;
            };

            $scope.page = 0;
            $scope.pagesCount = 0;
            $scope.listingSkip = 0;

            $scope.changePage = function (pageNumber) {
                if (pageNumber < 0 || pageNumber > $scope.pagesCount - 1) {
                    return;
                }
                $scope.page = pageNumber;
                $scope.listingSkip = $scope.page * 10;
            }


            $scope.saveCampaign = function () {
                $rootScope.disableButton();
                var campaignData = $scope.campaignData;
                var isValid = true;
                var errorMessage = '';
                var isInteraction = false;
                if ($scope.callbackDigit.onOff) {
                    if (!campaignData.callback_digit || !campaignData.callback_voice_file_id) {
                        isValid = false;
                        errorMessage = 'callback_voice_file_required_with_callback_digit';
                    } else {
                        isInteraction = true;
                        var callbackDigitObject = {
                            action: $rootScope.trans('campaign_compose_compose_step_3_call_me_back'),
                            keypress: campaignData.callback_digit
                        };
                        $scope.interactionsForModal.push(callbackDigitObject);

                    }
                }
                if ($scope.doNotCallDigit.onOff) {
                    if (!campaignData.do_not_call_digit || !campaignData.do_not_call_voice_file_id) {
                        isValid = false;
                        errorMessage = 'donotcall_voice_file_required_with_donotcall_digit';
                    } else {
                        isInteraction = true;
                        var doNotCallDigitObject = {
                            action: $rootScope.trans('campaign_compose_compose_step_3_blacklist_me'),
                            keypress: campaignData.do_not_call_digit};
                        $scope.interactionsForModal.push(doNotCallDigitObject);
                    }
                }
                if ($scope.transferDigit.onOff) {
                    if (!campaignData.transfer_digit || !campaignData.transfer_options) {
                        isValid = false;
                        errorMessage = 'transfer_options_required_with_transfer_digit';
                    } else {
                        isInteraction = true;
                        var transferDigitObject = {
                            action: $rootScope.trans('campaign_compose_compose_step_3_call_live'),
                            keypress: campaignData.transfer_digit
                        };
                        $scope.interactionsForModal.push(transferDigitObject);
                    }
                }

                if ($scope.replayDigit.onOff) {
                    if (!campaignData.replay_digit) {
                        isValid = false;
                        errorMessage = 'replay_digit_is_activated_but_not_selected';
                    } else {
                        isInteraction = true;
                        var replayDigitObject = {
                            action: $rootScope.trans('campaign_compose_compose_step_3_replay_voice_message'),
                            keypress: campaignData.replay_digit
                        };
                        $scope.interactionsForModal.push(replayDigitObject);

                    }
                }
                if (!isValid) {
                    $rootScope.enabledButton();
                    growl.error(trans(errorMessage));
                    return;
                }
                if (isInteraction) {
                    CallBournModal.open({
                        scope: {
                            interactionsForModal: $scope.interactionsForModal,
                            saveWithInteractionsCheckbox: false
                        },
                        templateUrl: "/app/modals/camping-batch/confirm-interactions.html",
                    }, function (scope) {
                        scope.dismissModal = function () {
                            CallBournModal.close();
                        }

                        scope.proceedToSaveWithInteraction = function () {
                            proceedSaveCampaign();
                        }

                    });
                } else {
                    proceedSaveCampaign();
                }
                $rootScope.enabledButton();
            }

            var proceedSaveCampaign = function () {
                var postData = $scope.campaignData;
                console.log(postData);
                postData.schedulations = null;
                postData.status = 'start';

                postData.is_replay_active = $scope.replayDigit.onOff;
                postData.is_transfer_active = $scope.transferDigit.onOff;
                postData.is_callback_active = $scope.callbackDigit.onOff;
                postData.is_donotcall_active = $scope.doNotCallDigit.onOff;

                //$rootScope.startLoader();
                BatchesService.campaignsBatchSend(postData).then(function (data) {
                    $rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        $scope.batchSendSuccess();
                    }
                    else {
                        growl.error(trans(data.resource.error.text));
                    }
                })
            };

            $scope.batchSendSuccess = function () {
                CallBournModal.open({
                    scope: {},
                    templateUrl: "/app/modals/camping-batch/voice-message-sent.html",
                }, function (scope) {
                    scope.goToOverview = function () {
                        CallBournModal.close();
                        $state.go('campaign.overview');
                    };

                    scope.dismissModal = function () {
                        CallBournModal.close();
                    }

                });
            };

            $scope.showRepitationConfirmModal = function () {
                CallBournModal.open({
                    scope: {
                        CampaignComposeService: CampaignComposeService
                    },
                    templateUrl: "/app/modals/camping-batch/show-repiteation-count-confirm.html"
                }, function (scope) {
                    scope.dates = [];
                    for (var i = 0; i < CampaignComposeService.campaignData.remaining_repeats; i++) {
                        scope.dates.push(moment().add(i * CampaignComposeService.campaignData.repeat_days_interval, 'days').format("LLLL"))
                    }
                });
            }


            ///////////////////////////////////////////////////////////FUNCTIONS////////////////////////////////////////
        }

    ]);