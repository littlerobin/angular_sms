angular.module('callburnApp').factory('TemplateService',
    function ($sce, Restangular) {
        return {
            getAudioTemplates: getAudioTemplates,
            removeAudioTemplates: removeAudioTemplates,
            putUpdateFileName:putUpdateFileName
        };
        /**
         * get audio templates
         * @param data
         * @returns {*}
         */
        function getAudioTemplates(data) {
            data.section = 'templates_page';
            return Restangular.one('audio-files/audio-templates').get(data);
        }

        /**
         * remove audio templates
         * @param params
         * @returns {*}
         */
        function removeAudioTemplates(params) {
            return Restangular.all('audio-files/remove-audio-templates').post(params);
        }

        function putUpdateFileName(id,params) {
            return Restangular.one('audio-files/update-file-name',id).put(params);
        }

    });