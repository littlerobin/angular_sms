angular.module('callburnApp').controller('BatchesController',
    ['$scope', '$rootScope', '$state', '$stateParams',
        'FileUploader', '$sce', '$timeout', 'BatchesService', 'CampaignComposeService', 'CallBournModal',
        function ($scope, $rootScope, $state, $stateParams,
                  FileUploader, $sce, $timeout, BatchesService, CampaignComposeService, CallBournModal) {
            /////////////////////////////////////////variables//////////////////////////////////
            $rootScope.currentActiveUrl=$state.current.name;
            $scope.CampaignComposeService=CampaignComposeService;
            //$scope.CampaignComposeService.ttsLanguages = ttsLanguages.resource.languages;
           // CampaignComposeService.audioTemplates = audioFiles.resource.files;
            /*$scope.CampaignComposeService.ttsLanguages.forEach(function (item) {
                item.selectView = item.languageName + '-' + item.ttsEngine;
            });
            CampaignComposeService.audioTemplates.forEach(function (item) {
                item.selectView = item.orig_filename + ' - ' + item.length;
            });*/
            $scope.ttsCallbackData = {};
            $scope.uploadingCallbackAudioName = '';
            $scope.tempAudioTemplateModel = {};
            $scope.tempNewCreatedModel = {};
            $scope.liveTransferNumbers = [];
            $scope.doNotCallAudioFiles = [];
            /////////////////////////////////////////variables//////////////////////////////////
            //demo data
            /*$rootScope.currentUser.numbers = {
                0: {phone_number: "0374658552215", name: "hello", tariff_id: 1},
                1: {phone_number: "0374658552220", name: "hello", tariff_id: 2},
                2: {phone_number: "0374658552260", name: "hello", tariff_id: 3},
                3: {phone_number: "0374658552285", name: "hello", tariff_id: 4},
                4: {phone_number: "0374658552265", name: "hello", tariff_id: 5}
            };*/

            /**
             * active replay modal
             */

            $scope.showInteractionModal = function () {
                CallBournModal.open({
                    scope: {
                        CampaignComposeService: CampaignComposeService
                    },
                    templateUrl: "/app/modals/camping-batch/activate-replay.html",
                }, function (scope) {
                    /**
                     * activated replay digit
                     */
                    scope.replyDigitActivated = function () {
                        if (!CampaignComposeService.replayDigit.checkboxChecked) {
                            return;
                        }
                        $scope.replayDigit.modalStep = -1;
                        $scope.replayDigit.onOff = 'on';
                        CallBournModal.close();
                    };

                });
            };
            /**
             *
             */
            $scope.showBatchesChangeMessageDeliverySpeedModal = function () {
                CallBournModal.open({
                    scope: {campaignData: $scope.campaignData},
                    templateUrl: "/app/modals/camping-batch/change-message-delivery-speed.html",
                }, function (scope) {
                    /**
                     * select sending time
                     * @param data
                     */
                    scope.maxSpeedSelect={
                        0:{value:"",text:"Max Speed"},
                        1:{value:30,text:"Inside 30 minutes"},
                        2:{value:60,text:"Inside 60 minutes"},
                        3:{value:90,text:"Inside 90 minutes"},
                        4:{value:120,text:"Inside 120 minutes"}
                    }
                    scope.selectSendingTime = function (data) {
                        if (data.sending_time == "") {
                            $scope.finalStepData.sendingTime = data.sending_time;
                        } else {
                            $scope.finalStepData.sendingTime = data.sending_time;
                        }

                    }
                });
            }
            /**
             * Voice message
             */
            $scope.showVoiceMessageModal = function () {
                CampaignComposeService.doValitation("start");
                /*CallBournModal.open({
                    scope: {CampaignComposeService: CampaignComposeService},
                    templateUrl: "/app/engines/campaign/batch/views/modals/voice-message-sent.html",
                }, function (scope) {
                    /!**
                     * close modal and  redirect to $state camping .overviw
                     *!/

                    scope.goToOverview = function () {
                        CallBournModal.close();
                        $state.go('campaign.overview');
                    };
                    /!**
                     * close modal
                     *!/

                    scope.dismissModal = function () {
                        CallBournModal.close();
                    }

                });*/
            }

            /**
             * show activate compose activate call back modal
             */
            $scope.showComposeActivateCallbackModal = function () {
                CallBournModal.open({
                    scope: {
                        CampaignComposeService: CampaignComposeService,
                        callbackTtsData: $scope.ttsCallbackData,
                        createAudioFromTextForCallback: $scope.createAudioFromTextForCallback,
                        uploadingCallbackAudioName: $scope.uploadingCallbackAudioName,
                        callbackAudioTemplateSelected: $scope.callbackAudioTemplateSelected,
                        tempAudioTemplateModel: $scope.tempAudioTemplateModel,
                        tempNewCreatedModel: $scope.tempNewCreatedModel,
                        callbackAudioFiles: $scope.callbackAudioFiles
                    },
                    templateUrl: "/app/modals/camping-batch/activate-callback.html",
                }, function (scope) {
                    /**
                     * activate callback digit
                     */
                    scope.activateCallbackDigit = function () {
                        $scope.callbackDigit.onOff = "on";
                        CallBournModal.close();
                    };
                    /**
                     * file uloader instance
                     */
                    scope.callbackDigitFileUpload = new FileUploader({
                        url: '/campaigns/upload-audio-file',
                        alias: 'file',
                        autoUpload: true
                    });

                    scope.callbackDigitFileUpload.onAfterAddingFile = function (item) {

                        scope.uploadingCallbackAudioName = item.file.name;
                    };
                    /**
                     * return success data
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.callbackDigitFileUpload.onSuccessItem = function (item, response, status, headers) {
                        $rootScope.stopLoader();
                        if (response.resource.error.no == 0) {
                            scope.uploadingCallbackAudioName = false;
                            var audioData = {
                                source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + response.resource.file._id),
                                file: response.resource.file
                            }
                            $scope.callbackAudioFiles.push(audioData);
                            $scope.callbackAudioFiles.forEach(function (item) {
                                item.viewSelect=item.file.orig_filename + ' - ' + item.file.length
                            });
                        } else {
                            alert(response.resource.error.text);
                        }
                    };
                    /**
                     * file uploaing error action
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.callbackDigitFileUpload.onErrorItem = function (item, response, status, headers) {
                        $scope.errors = response;
                        $rootScope.stopLoader();
                    }
                    /**
                     * start callback upload
                     */
                    scope.startCallbackUpload = function () {
                        $rootScope.startLoader();
                        $scope.callbackDigitFileUpload.uploadAll();
                    }
                    /**
                     * open file select
                     */
                    scope.openCallbackFileSelect = function () {
                        $timeout(function () {
                            angular.element('#campaignCallbackFileInput').trigger('click');
                        }, 100);
                    };
                    scope.selectCallbackNewCreatedAudioFile = function(file){
                        $scope.newCallbackSelectedAudioFile = file;
                        $scope.showNewCreatedCallbacksDropDown = false;
                        $scope.campaignData.callback_voice_file_id = $scope.newCallbackSelectedAudioFile._id;
                    }
                });
            };

            /**
             * Open modal for activating transfer interaction.
             */
            $scope.showTransferModal = function () {
                CallBournModal.open({
                    scope: {
                        CampaignComposeService: CampaignComposeService,
                        currentUser: $rootScope.currentUser,
                        liveTransferNumbers: []
                    },
                    templateUrl: "/app/modals/camping-batch/activate-transfer.html",
                }, function (scope) {
                    if (CampaignComposeService.editingCampaign && CampaignComposeService.editingCampaign.transfer_options) {
                        $scope.liveTransferNumbers = CampaignComposeService.editingCampaign.transfer_options.split();
                    } else {
                        $scope.liveTransferNumbers = [];
                    }
                    /**
                     * activate transfer
                     */
                    scope.activateTransferDigit = function () {
                        if (!CampaignComposeService.transferDigit.checkboxChecked) {
                            return;
                        }
                        $scope.transferDigit.onOff = "on";
                        CampaignComposeService.campaignData.transfer_options = scope.liveTransferNumbers.join();
                        CallBournModal.close();
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
                    }
                });
            }

            /**
             * Open modal for activating callback interaction.
             */
            $scope.showCallbackModal = function () {
                CallBournModal.open({
                    scope: {},
                    templateUrl: "/app/modals/camping-batch/activate-callback.html"
                }, function (scope) {
                    scope.testFunction = function () {
                        alert("ok");
                    }
                });
            }

            /**
             * Open modal for activating do not call interaction.
             */
            $scope.showDoNotCallModal = function () {
                CallBournModal.open({
                    scope: {
                        openCampaignVoiceFileSelect: $scope.openCampaignVoiceFileSelect,
                        CampaignComposeService: CampaignComposeService,
                        donotcallNewCreatedTemp: $scope.donotcallNewCreatedTemp,
                        doNotCallAudioFiles: $scope.doNotCallAudioFiles
                    },
                    templateUrl: "/app/modals/camping-batch/activate-do-not-call.html",
                }, function (scope) {
                    /**
                     * cretae audio from text
                     */
                    scope.createAudioFromTextForDoNotCall = function () {
                        $rootScope.startLoader();
                        BatchesService.createAudioFromText($scope.doNotCallTtsData).then(function (data) {
                            $rootScope.stopLoader();
                            if (data.resource.error.no == 0) {
                                $scope.doNotCallTtsData = {language: null};
                                var audioData = {
                                    source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + data.resource.file._id),
                                    file: data.resource.file
                                }
                                $scope.doNotCallAudioFiles.push(audioData);
                                $scope.doNotCallAudioFiles.forEach(function (item) {
                                    item.viewSelect=item.file.orig_filename + ' - ' + item.file.length
                                });
                            } else {
                                $scope.voiceTtsError = data.resource.error.text;
                            }
                        });
                    };
                    /**
                     * open camping file select
                     */
                    scope.openCampaignVoiceFileSelect = function () {
                        $timeout(function () {
                            angular.element('#campaignDoNotCallFileInput').trigger('click');
                        }, 100);
                    };
                    scope.newDoNotCallSelectedAudioFile = {};
                    scope.showNewCreatedDoNotCallsDropDown = false;
                    scope.isDoNotCallNewCreatedFilePlaying = false;
                    /**
                     * create new audio file
                     * @param file
                     */
                    scope.selectDoNotCallNewCreatedAudioFile = function (file) {
                        scope.newDoNotCallSelectedAudioFile = file;
                        scope.showNewCreatedDoNotCallsDropDown = false;
                    };
                    /**
                     * save new created file
                     */
                    scope.saveNewCreatedAsDoNotCall = function () {
                        scope.campaignData.do_not_call_voice_file_id = scope.newDoNotCallSelectedAudioFile._id;
                    };
                    /**
                     * pasue or play new created file
                     * @param action
                     */
                    scope.playPauseDoNotCallNewCreatedAudio = function (action) {

                        if (!scope.newDoNotCallSelectedAudioFile._id) {
                            return;
                        }
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
                    };
                    /**
                     * activate dontcall digit activate
                     */
                    scope.donotcallDigitActivated = function () {
                        if (!CampaignComposeService.doNotCallDigit.checkboxChecked) {
                            return;
                        }
                        $scope.doNotCallDigit.modalStep = -1;
                        $scope.doNotCallDigit.onOff = 'on';
                        CallBournModal.close();
                    }


                    /**
                     * return file upload instance
                     */
                    scope.doNotCallDigitFileUpload = new FileUploader({
                        url: '/campaigns/upload-audio-file',
                        alias: 'file',
                        autoUpload: true
                    });
                    /**
                     * uploading file
                     * @param item
                     */
                    scope.doNotCallDigitFileUpload.onAfterAddingFile = function (item) {
                        scope.uploadingDoNotCallAudioName = item.file.name;
                    }
                    /**
                     * file success uploading
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.doNotCallDigitFileUpload.onSuccessItem = function (item, response, status, headers) {
                        $rootScope.stopLoader();
                        if (response.resource.error.no == 0) {
                            scope.uploadingDoNotCallAudioName = false;
                            var audioData = {
                                source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + response.resource.file._id),
                                file: response.resource.file
                            }
                            $scope.doNotCallAudioFiles.push(audioData);
                            $scope.doNotCallAudioFiles.forEach(function (item) {
                                item.viewSelect=item.file.orig_filename + ' - ' + item.file.length
                            });
                        } else {
                            alert(response.resource.error.text);
                        }
                    };
                    /**
                     * on file uploading error
                     * @param item
                     * @param response
                     * @param status
                     * @param headers
                     */
                    scope.doNotCallDigitFileUpload.onErrorItem = function (item, response, status, headers) {
                        $scope.errors = response;
                        $rootScope.stopLoader();
                    }
                    /**
                     * start callback upload
                     */
                    scope.startCallbackUpload = function () {
                        $rootScope.startLoader();
                        scope.doNotCallDigitFileUpload.uploadAll();
                    }
                });
            }

            /**
             * Open modal for changing repeats count
             */
            $scope.showChangeRepeatsCountModal = function () {
                CallBournModal.open({
                    scope: {},
                    templateUrl: "/app/modals/camping-batch/change-repeat-count.html",
                }, function (scope) {
                    scope.testFunction = function () {
                        alert("ok");
                    }
                });
            }
            /**
             * caller id modal inject
             */
            $scope.showCallerIdModal = function () {
                CallBournModal.open({
                    scope: {
                        currentUser: $rootScope.currentUser,
                        selectedCallerId: $scope.campaignData.caller_id
                    },
                    templateUrl: "/app/modals/camping-batch/change-caller-id.html"
                }, function (scope) {
                    scope.callerIdSelected = function (number) {
                        scope.selectedCallerId = number;

                    };
                    scope.changeCallerId = function () {
                        $scope.campaignData.caller_id = scope.selectedCallerId;
                        CampaignComposeService.campaignData.caller_id = scope.selectedCallerId;
                        CallBournModal.close();
                    }
                });
            }


            
            
            
            
            
            
            $scope.goToNotification = $rootScope.goToNotification;
            $scope.todaysDate = moment();
            $rootScope.currentActiveRoute = 'campaign';
            if($rootScope.currentUser.numbers[0]){
                $scope.campaignData = {
                    caller_id: $rootScope.currentUser.numbers[0].phone_number,
                    get_email_notifications: true
                };

            }

            $scope.finalStepData = {};

            $scope.batchStep = 1;


            //$scope.ttsLanguages = ttsLanguages.resource.languages;

            /*$rootScope.footerData = {
                first: '<span>Step 1</span>' +
                '<span>Upload a batch file using given format</span>',
                second: '<span>Step 2</span>' +
                '<span>Review batch file data</span>',
                third: '<span>Step 3</span>' +
                '<span>Review batch file information, add functionalities and send</span>'
            }*/

            $rootScope.previousStep = function () {
                $scope.batchStep = 2;
            }
            $rootScope.nextStep = function () {
                $scope.batchStep = 3;
            }

            /*$scope.$watch('batchStep', function (newVal, oldVal) {
                if (newVal == 1) {
                    $rootScope.isFooter1Active = true;
                    $rootScope.isFooter2Active = false;
                    $rootScope.isFooter3Active = false;

                    $rootScope.showPreviousIcon = false;
                    $rootScope.showNextIcon = false;
                }
                if (newVal == 2) {
                    $rootScope.isFooter1Active = false;
                    $rootScope.isFooter2Active = true;
                    $rootScope.isFooter3Active = false;

                    $rootScope.showPreviousIcon = false;
                    $rootScope.showNextIcon = true;
                }
                if (newVal == 3) {
                    $rootScope.isFooter1Active = false;
                    $rootScope.isFooter2Active = false;
                    $rootScope.isFooter3Active = true;

                    $rootScope.showPreviousIcon = true;
                    $rootScope.showNextIcon = false;
                }
            });*/

            /***************** STEP 2 ********************/
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

            /*
             |---------------------------------------------------------
             | COMPOSE STEP 3 - FINAL STEP
             |---------------------------------------------------------
             | Final step for creating campaign.
             | Here use can choose callback, donotcall, replay and transfer digits,
             | change caller id, see max cost etc.
             |
             */

            $scope.replayDigit = {showNumbersSelect: false, onOff: 'off', modalStep: -1, checkboxChecked: false};
            $scope.transferDigit = {showNumbersSelect: false, onOff: 'off', modalStep: -1, checkboxChecked: false};
            $scope.callbackDigit = {showNumbersSelect: false, onOff: 'off', modalStep: -1, checkboxChecked: false};
            $scope.doNotCallDigit = {showNumbersSelect: false, onOff: 'off', modalStep: -1, checkboxChecked: false};


            $scope.currentAction = false;
            var checkIfActiveInteraction = function (callback, action) {
                $scope.interactionsForModal = [];
                var isAnyActive = false;
                if ($scope.replayDigit.onOff == 'on') {
                    isAnyActive = true;
                    var replayDigitObject = {
                        action: 'Replay Voice Message',
                        keypress: $scope.campaignData.replay_digit
                    };
                    $scope.interactionsForModal.push(replayDigitObject);
                }
                if ($scope.transferDigit.onOff == 'on') {
                    isAnyActive = true;
                    var transferDigitObject = {
                        action: 'Transfer Voice Message',
                        keypress: $scope.campaignData.transfer_digit
                    };
                    $scope.interactionsForModal.push(transferDigitObject);
                }
                if ($scope.callbackDigit.onOff == 'on') {
                    isAnyActive = true;
                    var callbackDigitObject = {action: 'Callback', keypress: $scope.campaignData.callback_digit};
                    $scope.interactionsForModal.push(callbackDigitObject);
                }
                if ($scope.doNotCallDigit.onOff == 'on') {
                    isAnyActive = true;
                    var doNotCallDigitObject = {action: 'Blacklist', keypress: $scope.campaignData.do_not_call_digit};
                    $scope.interactionsForModal.push(doNotCallDigitObject);
                }
                if (!isAnyActive) {
                    return callback();
                } else {
                    $scope.showSaveCampaignModalWithInteractions = true;
                    $scope.currentAction = action;
                }
            }


            $scope.proceedToSaveWithInteraction = function (action) {
                $scope.showSaveCampaignModalWithInteractions = false;
                switch (action) {
                    case 'save':
                        return proceedSaveCampaign();
                    case 'schedule':
                        return scheduleCampaignProceed();
                    case 'draft':
                        return saveAsDraftProceed();
                }
            }

            /*
             |---------------------------------------------------------
             | ENABLE CALLBACK DIGIT IN COMPOSE STEP 3
             |---------------------------------------------------------
             | Here will go all logic for selecting callback digit
             | and audio file for callback action . For audio user can
             | use the same ways as for audio voice file .
             |
             */

            $scope.callbackAudioFiles = [];
            $scope.isCallbackFilePlaying = [];
            $scope.callbackAudioFileId = null;

            $scope.callbackDigitActivated = function () {
                if (!$scope.callbackDigit.checkboxChecked) {
                    return;
                }
                $scope.callbackDigit.modalStep = -1;
                $scope.callbackDigit.onOff = 'on';
            }

            /*$scope.donotcallDigitActivated = function () {
             if (!$scope.doNotCallDigit.checkboxChecked) {
             return;
             }
             $scope.doNotCallDigit.modalStep = -1;
             $scope.doNotCallDigit.onOff = 'on';
             }*/


            $scope.transferDigitActivated = function () {
                if (!$scope.transferDigit.checkboxChecked) {
                    return;
                }
                $scope.transferDigit.modalStep = -1;
                $scope.transferDigit.onOff = 'on';
                $scope.campaignData.transfer_options = $scope.liveTransferNumbers.join();
            }


            /*
             |---------------------------------------------------------
             | CALLBACK DIGIT - METHOD 1 - TTS
             |---------------------------------------------------------
             | Use tts , for creating audio file from text
             | choosing language
             |
             */


            $scope.createAudioFromTextForCallback = function () {
                $scope.ttsCallbackData.user_id = $scope.campaignData.user_id;
                BatchesService.createAudioFromText($scope.ttsCallbackData).then(function (data) {
                    $scope.showTtsCallbackFile = true;
                    angular.element(document.getElementById('ttsFileCallback')).attr('src', '/uploads/audio/' + data.resource.map_filename)
                    $scope.campaignData.callback_digit_file_id = data.resource._id;
                })
            }

            /*
             |---------------------------------------------------------
             | CALLBACK DIGIT - METHOD 2 - UPLOAD
             |---------------------------------------------------------
             | Upload a file , can use dropdown too.
             |
             */


            /*$scope.callbackDigitFileUpload = new FileUploader({
             url: '/campaigns/upload-audio-file',
             alias: 'file',
             autoUpload: false
             });

             $scope.callbackDigitFileUpload.onAfterAddingFile = function (item) {

             $scope.uploadingCallbackAudioName = item.file.name;
             };

             $scope.callbackDigitFileUpload.onSuccessItem = function (item, response, status, headers) {
             $rootScope.stopLoader();
             if (response.resource.error.no == 0) {
             $scope.uploadingCallbackAudioName = false;
             var audioData = {
             source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + response.resource.file._id),
             file: response.resource.file
             }
             $scope.callbackAudioFiles.push(audioData);
             } else {
             alert(response.resource.error.text);
             }
             };

             $scope.callbackDigitFileUpload.onErrorItem = function (item, response, status, headers) {
             $scope.errors = response;
             $rootScope.stopLoader();
             }

             $scope.startCallbackUpload = function () {
             $rootScope.startLoader();
             $scope.callbackDigitFileUpload.uploadAll();
             }*/

            /*
             |---------------------------------------------------------
             | CALLBACK DIGIT - METHOD 3 - RECORD
             |---------------------------------------------------------
             | Record audio directly from browser .
             | FR audio record module used
             */
            $scope.isCallbackRecordedFilePlaying = false;
            $scope.isCallbackRecording = false;
            $scope.recordedCallbackAudio = new Audio();
            $scope.startBrowserAudioRecordingCallback = function () {
                $scope.isCallbackRecording = true;
                Fr.voice.record(true, function () {
                });
            }

            $scope.callbackMessageRecordFinish = function () {
                Fr.voice.export(function (url) {
                    Fr.voice.stop();
                    $scope.isCallbackRecording = false;
                    var base64 = url.split(',');
                    $scope.audioRecordedBase64Callback = base64[base64.length - 1];
                    $scope.recordedCallbackAudio = new Audio("data:audio/wav;base64," + $scope.audioRecordedBase64Callback);
                    $scope.$apply();
                }, 'base64');
            }

            $scope.playPauseCallbackRecordedAudio = function () {
                if ($scope.isCallbackRecordedFilePlaying) {
                    $scope.recordedCallbackAudio.pause();
                } else {
                    $scope.recordedCallbackAudio.play();
                    $scope.recordedCallbackAudio.addEventListener('ended', function () {
                        $scope.isCallbackRecordedFilePlaying = false;
                        $scope.$apply();
                    }, false);
                }
                $scope.isCallbackRecordedFilePlaying = !$scope.isCallbackRecordedFilePlaying;
            }

            $scope.saveCallbackRecordedFile = function () {
                BatchesService.createFileFromBase({base64_data: $scope.audioRecordedBase64Callback}).then(function (data) {
                    var audioData = {
                        source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + data.resource.file._id),
                        file: data.resource.file
                    }
                    $scope.callbackAudioFiles.push(audioData);
                })
            }

            /*
             |---------------------------------------------------------
             | CALLBACK DIGIT - METHOD 4 - TEMPLATE
             |---------------------------------------------------------
             | Use already created audio template file.
             |
             */
            $scope.selectedCallbackAudioTemplateFile = {};
            $scope.showCallbackTemplateSelectDropDown = false;
            $scope.isCallbackTemplateFilePlaying = false;


            $scope.callbackAudioTemplateSelected = function (file) {
                $scope.selectedCallbackAudioTemplateFile = file;
                $scope.showCallbackTemplateSelectDropDown = false;
            }

            $scope.isCallbackAlreadyAdded = function () {
                for (index in $scope.callbackAudioFiles) {
                    if ($scope.callbackAudioFiles[index].file._id == $scope.selectedCallbackAudioTemplateFile._id) {
                        return true;
                    }
                }
                return false;
            }

            $scope.saveTemplateAsCallback = function () {
                $scope.callbackAudioFiles.push({file: $scope.selectedCallbackAudioTemplateFile});
            }

            $scope.playPauseCallbackTemplateAudio = function (action) {
                if (!$scope.selectedCallbackAudioTemplateFile._id) {
                    return;
                }
                var audio = document.getElementById('callbackAudioFileTemplate');
                if (action == 'play') {
                    audio.play();
                    $scope.isCallbackTemplateFilePlaying = true;
                    audio.addEventListener('ended', function () {
                        $scope.isCallbackTemplateFilePlaying = false;
                        $scope.$apply();
                    }, false);
                } else {
                    audio.pause();
                    $scope.isCallbackTemplateFilePlaying = false;
                }
            }

            /*
             |---------------------------------------------------------
             | Caller id
             |---------------------------------------------------------
             | Verify caller id modal.
             */
            $scope.showSelectCallerIdModel = false;
            /*$scope.selectedCallerId = $rootScope.currentUser.numbers[0]._id;

             $scope.callerIdSelected = function(phonenumber){
             $scope.selectedCallerId = phonenumber;
             }

             $scope.changeCallerId = function(){
             /!*for(index in $rootScope.currentUser.numbers){
             if($rootScope.currentUser.numbers[index]._id == $scope.selectedCallerId){
             $scope.campaignData.caller_id = $rootScope.currentUser.numbers[index].phone_number;
             break;
             }
             }*!/
             $scope.campaignData.caller_id = $scope.selectedCallerId;
             $scope.showSelectCallerIdModel = false;
             }*/

            /*
             |---------------------------------------------------------
             | CALLBACK DIGIT - finalizing and closing modal
             |---------------------------------------------------------
             | Select audio file for callback digit , from the list
             | created by the 4 methods above
             */

            /*$scope.newCallbackSelectedAudioFile = {};
             $scope.showNewCreatedCallbacksDropDown = false;
             $scope.isCallbackNewCreatedFilePlaying = false;
             $scope.selectCallbackNewCreatedAudioFile = function (file) {
             file = JSON.parse(file);
             $scope.newCallbackSelectedAudioFile = file;
             $scope.showNewCreatedCallbacksDropDown = false;
             }

             $scope.saveNewCreatedAsCallback = function () {
             $scope.campaignData.callback_voice_file_id = $scope.newCallbackSelectedAudioFile._id;
             }

             $scope.playPauseCallbackNewCreatedAudio = function (action) {
             if (!$scope.newCallbackSelectedAudioFile._id) {
             return;
             }
             var templateId = $scope.newCallbackSelectedAudioFile._id;
             var audio = document.getElementById('callbackCreatedAudioFile');
             if (action == 'play') {
             audio.play();
             $scope.isCallbackNewCreatedFilePlaying = true;
             audio.addEventListener('ended', function () {
             $scope.isCallbackNewCreatedFilePlaying = false;
             $scope.$apply();
             }, false);
             } else {
             audio.pause();
             $scope.isCallbackNewCreatedFilePlaying = false;
             }
             }*/


            /*
             |---------------------------------------------------------
             | ENABLE DONOTCALL DIGIT IN COMPOSE STEP 3
             |---------------------------------------------------------
             | Here will go all logic for selecting doNotCall digit
             | and audio file for doNotCall action . For audio user can
             | use the same ways as for audio voice file .
             |
             */


            $scope.isDoNotCallFilePlaying = [];
            $scope.doNotCallAudioFileId = null;


            /*
             |---------------------------------------------------------
             | DONOTCALL DIGIT - METHOD 1 - TTS
             |---------------------------------------------------------
             | Use tts , for creating audio file from text
             | choosing language
             |
             */
            $scope.doNotCallTtsData = {language: null};

            /*$scope.createAudioFromTextForDoNotCall = function () {
             $rootScope.startLoader();
             BatchesService.createAudioFromText($scope.doNotCallTtsData).then(function (data) {
             $rootScope.stopLoader();
             if (data.resource.error.no == 0) {
             $scope.doNotCallTtsData = {language: null};
             var audioData = {
             source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + data.resource.file._id),
             file: data.resource.file
             }
             $scope.doNotCallAudioFiles.push(audioData);
             } else {
             $scope.voiceTtsError = data.resource.error.text;
             }
             });
             }*/

            /*
             |---------------------------------------------------------
             | DONOTCALL DIGIT - METHOD 2 - UPLOAD
             |---------------------------------------------------------
             | Upload a file , can use dropdown too.
             |
             */
            /*$scope.uploadingDoNotCallAudioName = '';
             $scope.openDoNotCallFileSelect = function () {
             $timeout(function () {
             angular.element('#campaignDoNotCallFileInput').trigger('click');
             }, 100);
             }*/

            /*var doNotCallDigitFileUpload = $scope.doNotCallDigitFileUpload = new FileUploader({
             url: '/campaigns/upload-audio-file',
             alias: 'file',
             autoUpload: false
             });

             doNotCallDigitFileUpload.onAfterAddingFile = function (item) {
             $scope.uploadingDoNotCallAudioName = item.file.name;
             }

             doNotCallDigitFileUpload.onSuccessItem = function (item, response, status, headers) {
             $rootScope.stopLoader();
             if (response.resource.error.no == 0) {
             $scope.uploadingDoNotCallAudioName = false;
             var audioData = {
             source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + response.resource.file._id),
             file: response.resource.file
             }
             $scope.doNotCallAudioFiles.push(audioData);
             } else {
             alert(response.resource.error.text);
             }
             };

             doNotCallDigitFileUpload.onErrorItem = function (item, response, status, headers) {
             $scope.errors = response;
             $rootScope.stopLoader();
             }

             $scope.startDoNotCallUpload = function () {
             $rootScope.startLoader();
             doNotCallDigitFileUpload.uploadAll();
             }*/

            /*
             |---------------------------------------------------------
             | DONOTCALL DIGIT - METHOD 3 - RECORD
             |---------------------------------------------------------
             | Record audio directly from browser .
             | FR audio record module used
             */
            /* $scope.isDoNotCallRecordedFilePlaying = false;
             $scope.isDoNotCallRecording = false;
             $scope.recordedDoNotCallAudio = new Audio();
             $scope.startBrowserAudioRecordingDoNotCall = function () {
             $scope.isDoNotCallRecording = true;
             Fr.voice.record(true, function () {
             });
             }

             $scope.doNotCallMessageRecordFinish = function () {
             Fr.voice.export(function (url) {
             Fr.voice.stop();
             $scope.isDoNotCallRecording = false;
             var base64 = url.split(',');
             $scope.audioRecordedBase64DoNotCall = base64[base64.length - 1];
             $scope.recordedDoNotCallAudio = new Audio("data:audio/wav;base64," + $scope.audioRecordedBase64DoNotCall);
             $scope.$apply();
             }, 'base64');
             }

             $scope.playPauseDoNotCallRecordedAudio = function () {
             if ($scope.isDoNotCallRecordedFilePlaying) {
             $scope.recordedDoNotCallAudio.pause();
             } else {
             $scope.recordedDoNotCallAudio.play();
             $scope.recordedDoNotCallAudio.addEventListener('ended', function () {
             $scope.isDoNotCallRecordedFilePlaying = false;
             $scope.$apply();
             }, false);
             }
             $scope.isDoNotCallRecordedFilePlaying = !$scope.isDoNotCallRecordedFilePlaying;
             }

             $scope.saveDoNotCallRecordedFile = function () {
             $rootScope.startLoader();
             BatchesService.createFileFromBase({base64_data: $scope.audioRecordedBase64DoNotCall}).then(function (data) {
             $rootScope.stopLoader();
             var audioData = {
             source: $sce.trustAsResourceUrl(apiUrl + '?key=' + $rootScope.currentUser.api_token + '&file_id=' + data.resource.file._id),
             file: data.resource.file
             }
             $scope.doNotCallAudioFiles.push(audioData);
             })
             }*/

            /*
             |---------------------------------------------------------
             | DONOTCALL DIGIT - METHOD 4 - TEMPLATE
             |---------------------------------------------------------
             | Use already created audio template file.
             |
             */
            /* $scope.selectedDoNotCallAudioTemplateFile = {};
             $scope.showDoNotCallTemplateSelectDropDown = false;
             $scope.isDoNotCallTemplateFilePlaying = false;

             $scope.doNotCallAudioTemplateSelected = function (file) {
             file = JSON.parse(file);
             $scope.selectedDoNotCallAudioTemplateFile = file;
             $scope.showDoNotCallTemplateSelectDropDown = false;
             }

             $scope.isDoNotCallAlreadyAdded = function () {
             for (index in $scope.doNotCallAudioFiles) {
             if ($scope.doNotCallAudioFiles[index].file._id == $scope.selectedDoNotCallAudioTemplateFile._id) {
             return true;
             }
             }
             return false;
             }

             $scope.saveTemplateAsDoNotCall = function () {
             $scope.doNotCallAudioFiles.push({file: $scope.selectedDoNotCallAudioTemplateFile})
             }

             $scope.playPauseDoNotCallTemplateAudio = function (action) {
             if (!$scope.selectedDoNotCallAudioTemplateFile._id) {
             return;
             }
             var audio = document.getElementById('doNotCallAudioFile');
             if (action == 'play') {
             audio.play();
             $scope.isDoNotCallTemplateFilePlaying = true;
             audio.addEventListener('ended', function () {
             $scope.isDoNotCallTemplateFilePlaying = false;
             $scope.$apply();
             }, false);
             } else {
             audio.pause();
             $scope.isDoNotCallTemplateFilePlaying = false;
             }
             }*/

            /*
             |---------------------------------------------------------
             | DONOTCALL DIGIT - finalizing and closing modal
             |---------------------------------------------------------
             | Select audio file for doNotCall digit , from the list
             | created by the 4 methods above
             */

            /*$scope.newDoNotCallSelectedAudioFile = {};
             $scope.showNewCreatedDoNotCallsDropDown = false;
             $scope.isDoNotCallNewCreatedFilePlaying = false;
             $scope.selectDoNotCallNewCreatedAudioFile = function (file) {
             file = JSON.parse(file);
             $scope.newDoNotCallSelectedAudioFile = file;
             $scope.showNewCreatedDoNotCallsDropDown = false;
             }

             $scope.saveNewCreatedAsDoNotCall = function () {
             $scope.campaignData.do_not_call_voice_file_id = $scope.newDoNotCallSelectedAudioFile._id;
             }

             $scope.playPauseDoNotCallNewCreatedAudio = function (action) {
             if (!$scope.newDoNotCallSelectedAudioFile._id) {
             return;
             }
             var audio = document.getElementById('doNotCallCreatedAudioFile');
             if (action == 'play') {
             audio.play();
             $scope.isDoNotCallNewCreatedFilePlaying = true;
             audio.addEventListener('ended', function () {
             $scope.isDoNotCallNewCreatedFilePlaying = false;
             $scope.$apply();
             }, false);
             } else {
             audio.pause();
             $scope.isDoNotCallNewCreatedFilePlaying = false;
             }
             }*/

            /*
             |---------------------------------------------------------
             | LIVE TRANSFER
             |---------------------------------------------------------
             | Select phone numbers for live transfer interactions
             */


            /*$scope.addRemoveTransfer = function (number, tariffId) {
             var indexOfNumber = $scope.liveTransferNumbers.indexOf(number);
             if (indexOfNumber == -1) {
             if (currentTariffId && currentTariffId != tariffId) {
             return;
             }
             currentTariffId = tariffId;
             $scope.liveTransferNumbers.push(number)
             } else {
             $scope.liveTransferNumbers.splice(indexOfNumber, 1);
             if ($scope.liveTransferNumbers.length == 0) {
             currentTariffId = null;
             }
             }
             }*/

            /*
             |---------------------------------------------------------
             | COMPOSE STEP 4 - Batch sending
             |---------------------------------------------------------
             | Upload a file for batch sending
             |
             */
            $scope.uploadingBatchName = '';
            $scope.batchTtsData = {'tts_language': null};
            $scope.openBatchFileSelect = function () {
                $timeout(function () {
                    angular.element('#campaignBatchFileInput').trigger('click');
                }, 100);
            }

            var campaignBatchFileUpload = $scope.campaignBatchFileUpload = new FileUploader({
                url: '/phonenumbers/validate-batch-file',
                alias: 'file',
                autoUpload: true,
                formData: [$scope.batchTtsData]
            });

            campaignBatchFileUpload.onAfterAddingFile = function (item) {
                $scope.uploadingBatchName = item.file.name;
            }

            $scope.showTtsPriceNotificationModal = false;
            campaignBatchFileUpload.onSuccessItem = function (item, response, status, headers) {
                $rootScope.stopLoader();

                if (response.resource && response.resource.error.no == 0) {
                    $scope.campaignData.phonenumbers_with_text = response.resource.phonenumbers_with_text;
                    $scope.campaignData.tts_language = response.resource.tts_language;
                    $scope.finalStepData.maxCost = response.resource.max_cost;
                    $scope.finalStepData.numbersCount = response.resource.phonenumbers.length;
                    $scope.uploadingBatchName = false;
                    $scope.pagesCount = Math.ceil(response.resource.phonenumbers.length / 10);
                    $scope.showTtsPriceNotificationModal = true;
                }
            };

            $scope.agreeToTtsPrice = function () {
                $scope.batchStep = 3;
                $scope.showTtsPriceNotificationModal = false;
            }

            campaignBatchFileUpload.onErrorItem = function (item, response, status, headers) {
                $scope.errors = response;
                $rootScope.stopLoader();
            }

            $scope.startBatchFileUpload = function () {
                $rootScope.startLoader();
                campaignBatchFileUpload.uploadAll();
            }

            $scope.inlineDataChanged = function (whichOne, index, event) {
                var text = $(event.target).text();
                $scope.campaignData.phonenumbers_with_text[index][whichOne] = text;
            }

            $scope.removeOneBatch = function (index) {
                if ($scope.campaignData.phonenumbers_with_text.length == 1) {
                    alert('You need to have at least 1 receipent');
                    return;
                }
                $scope.campaignData.phonenumbers_with_text.splice(index, 1);
                $scope.finalStepData.numbersCount = $scope.finalStepData.numbersCount - 1;
            }


            /*
             |---------------------------------------------------------
             | SCHEDULE CAMPAIGN
             |---------------------------------------------------------
             | Here user can schedule campaign, and split delivery
             |
             */
            $scope.currentMaximumAvailable = $scope.finalStepData.numbersCount;
            var rangeSliderTemplate = {min: 1, max: 1};

            $scope.schedulations = [{date: '', min: 1, max: 1}];

            $scope.canAddSchedule = function () {
                var schedCount = $scope.schedulations.length + 1;
                var phonenumbersCount = $scope.finalStepData.numbersCount;
                if (phonenumbersCount / schedCount >= 1) {
                    return true;
                }
                return false;
            }

            $scope.$watch('schedulations', function (newVal, oldVal) {
                for (index in newVal) {
                    if (newVal[index].date < new Date()) {
                        newVal[index].date = '';
                    }
                }
            }, true)

            $scope.addSchedule = function () {
                $scope.schedulations.push({date: '', min: 1, max: 1});
            }

            $scope.removeSchedule = function (ind) {
                $scope.schedulations.splice(ind, 1);
            }

            $scope.getMaximum = function (ind) {
                if (!$scope.finalStepData.numbersCount) {
                    return $scope.schedulations[ind].max;
                }
                var currentSum = 0;
                for (index in $scope.schedulations) {
                    currentSum += Number($scope.schedulations[index].max);
                }
                $scope.currentMaximumAvailable = $scope.finalStepData.numbersCount - Number(currentSum);
                var currentCount = $scope.schedulations[ind].max;
                var finalRes = Number(currentCount + $scope.currentMaximumAvailable);
                return finalRes ? finalRes : 1;
            }

            $scope.canScheduleCampaign = function () {
                var maxSums = 0;
                for (index in $scope.schedulations) {
                    if (!$scope.schedulations[index].date) {
                        return false;
                    }
                    maxSums += $scope.schedulations[index].max;
                }
                return maxSums == $scope.finalStepData.numbersCount;
            }


            $scope.composeStep1ErrorMessage = false;

            $scope.showSentMessageSuccessModal = false;
            var proceedSaveCampaign = function () {
                var postData = $scope.campaignData;
                postData.schedulations = null;
                postData.status = 'start';

                postData.is_replay_active = $scope.replayDigit.onOff == 'on' ? true : false;
                postData.is_transfer_active = $scope.transferDigit.onOff == 'on' ? true : false;
                postData.is_callback_active = $scope.callbackDigit.onOff == 'on' ? true : false;
                postData.is_donotcall_active = $scope.doNotCallDigit.onOff == 'on' ? true : false;

                $rootScope.startLoader();
                BatchesService.campaignsBatchSend(postData).then(function (data) {
                    $rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        $scope.showSentMessageSuccessModal = true;
                        $scope.showSaveCampaignModalWithInteractions = false;
                    }
                    else {
                        $scope.composeStep1ErrorMessage = data.resource.error.text;
                    }
                })
            }

            $scope.saveCampaign = function () {
                doValidation(proceedSaveCampaign, 'save');
            }

            /*var saveCampaignProceed = function(){
             var isAnyActive = checkIfActiveInteraction();
             if(!isAnyActive){
             $scope.proceedSaveCampaign();
             } else{
             $scope.showSaveCampaignModalWithInteractions = true;
             }
             }*/

            $scope.showSchedulationSuccessModal = false;

            $scope.scheduleCampaign = function () {
                doValidation(scheduleCampaignProceed, 'schedule');
            }

            var scheduleCampaignProceed = function () {
                var postData = $scope.campaignData;
                postData.schedulations = $scope.schedulations;

                for (index in postData.schedulations) {
                    postData.schedulations[index].date = moment(postData.schedulations[index].date).format('YYYY-MM-DD HH:mm:ss');
                }
                postData.status = 'scheduled';

                postData.is_replay_active = $scope.replayDigit.onOff == 'on' ? true : false;
                postData.is_transfer_active = $scope.transferDigit.onOff == 'on' ? true : false;
                postData.is_callback_active = $scope.callbackDigit.onOff == 'on' ? true : false;
                postData.is_donotcall_active = $scope.doNotCallDigit.onOff == 'on' ? true : false;

                $rootScope.startLoader();
                BatchesService.campaignsBatchSend(postData).then(function (data) {
                    $rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        $scope.showSchedulationSuccessModal = true;
                    }
                    else {
                        $scope.composeStep1ErrorMessage = data.resource.error.text;
                    }
                })
            }

            $scope.saveAsDraft = function () {
                doValidation(saveAsDraftProceed, 'draft');
            }

            var saveAsDraftProceed = function () {
                var postData = $scope.campaignData;
                postData.schedulations = null;
                postData.status = 'saved';
                postData.status = 'saved';

                postData.is_replay_active = $scope.replayDigit.onOff == 'on' ? true : false;
                postData.is_transfer_active = $scope.transferDigit.onOff == 'on' ? true : false;
                postData.is_callback_active = $scope.callbackDigit.onOff == 'on' ? true : false;
                postData.is_donotcall_active = $scope.doNotCallDigit.onOff == 'on' ? true : false;

                $rootScope.startLoader();
                BatchesService.campaignsBatchSend(postData).then(function (data) {
                    $rootScope.stopLoader();
                    if (data.resource.error.no == 0) {
                        $state.go('campaign.overview');
                    }
                    else {
                        $scope.composeStep1ErrorMessage = data.resource.error.text;
                    }
                })
            }

            var doValidation = function (cb) {
                var campaignData = $scope.campaignData;
                var isValid = true;
                var errorMessage = '';
                if ($scope.callbackDigit.onOff == 'on') {
                    if (!campaignData.callback_digit || !campaignData.callback_voice_file_id) {
                        isValid = false;
                        errorMessage = 'callback_voice_file_required_with_callback_digit';
                    }
                }
                if ($scope.doNotCallDigit.onOff == 'on') {
                    if (!campaignData.do_not_call_digit || !campaignData.do_not_call_voice_file_id) {
                        isValid = false;
                        errorMessage = 'donotcall_voice_file_required_with_donotcall_digit';
                    }
                }
                if ($scope.transferDigit.onOff == 'on') {
                    if (!campaignData.transfer_digit || !campaignData.transfer_options) {
                        isValid = false;
                        errorMessage = 'transfer_options_required_with_transfer_digit';
                    }
                }
                if ($scope.replayDigit.onOff == 'on') {
                    if (!campaignData.replay_digit) {
                        isValid = false;
                        errorMessage = 'replay_digit_is_activated_but_not_selected';
                    }
                }
                if (!isValid) {
                    notify({message: errorMessage, classes: ['notification-alert-danger']})
                } else {
                    checkIfActiveInteraction(cb, arguments[1]);
                }
            }

            var arrayOfModals = [
                'showSendPreviewCallModal', 'showSelectCallerIdModel',
                'showSchedulationModal', 'showSchedulationSuccessModal',
                'showSentMessageSuccessModal', 'showTtsNotificationModal',
                'showSaveCampaignModalWithInteractions', 'showEstimatedSendingTimeModal',
                'contactsModalShow'
            ];
            var arrayOfInteractionModals = [
                'callbackDigit.modalStep',
                'doNotCallDigit.modalStep',
                'replayDigit.modalStep',
                'transferDigit.modalStep'
            ];
            $scope.$watchGroup(arrayOfModals, function (newValues) {
                var needBlur = false;
                for (index in newValues) {
                    if (newValues[index]) {
                        needBlur = true;
                        break;
                    }
                }
                $rootScope.showBlurEffect = needBlur;
            });
            $scope.$watchGroup(arrayOfInteractionModals, function (newValues, oldValues, scope) {
                var needBlur = false;
                for (index in newValues) {
                    if (newValues[index] == 1 || newValues[index] == 2) {
                        needBlur = true;
                        break;
                    }
                }
                $rootScope.showBlurEffect = needBlur;
            });

        }]).directive('selectNumber', function () {
    return {
        restrict: 'E',
        templateUrl: '/app/templates/select-number.html',
        scope: {
            interactionName: '=interaction',
            origscope: '=origscope',
            camelInteraction: '=camelinteraction'
        },
        controller: ['$scope', function ($scope) {

            $scope.actionNumbersMatrix = [
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', '']
            ];

            /*$scope.getStatus = function (num) {
             var usedNumbers = [];
             var validInteractions = ['transfer_digit', 'replay_digit', 'callback_digit', 'do_not_call_digit'];
             if ($scope.origscope.campaignData[$scope.interactionName] == num) {
             return 'active';
             }
             for (index in validInteractions) {
             if (validInteractions[index] != $scope.interactionName) {
             usedNumbers.push($scope.origscope.campaignData[validInteractions[index]]);
             }
             }
             var isInList = usedNumbers.indexOf(num);
             return isInList == -1 ? 'free' : 'selected';
             }*/
        }],
    }

});