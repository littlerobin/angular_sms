angular.module('callburnApp').factory('BatchesService',
    function ($sce, Restangular) {
        return {
            createAudioFromText: createAudioFromText,
            createFileFromBase: createFileFromBase,
            campaignsBatchSend: campaignsBatchSend
        };
        /**
         * create audio from text
         */
        function createAudioFromText(data) {
            return Restangular.all('campaigns/create-audio-from-text').post(data);
        }

        /**
         * create file from base
         * @param params
         * @returns {*}
         */
        function createFileFromBase(params) {
            return Restangular.all('campaigns/create-file-from-base64').post(params);
        }

        /**
         * return camping data
         * @param params
         * @returns {*}
         */
        function campaignsBatchSend(params) {
            return Restangular.all('campaigns/batch-send').post(params);
        }
    });