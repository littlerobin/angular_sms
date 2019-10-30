angular.module('callburnApp').factory('SettingsService',
    function ($sce, Restangular, $httpParamSerializer) {
        return {
            updateEmail: updateEmail,
            updatePassword: updatePassword,
            sendVerificationCode: sendVerificationCode,
            addCallerId: addCallerId,
            removeNumber: removeNumber,
            getCites: getCites,
            updateMainData: updateMainData,
            getShowUser: getShowUser,
            removeById:removeById,
            updateCallerId:updateCallerId
        };
        /**
         * send request to update email
         * @param params
         * @returns {*}
         */
        function updateEmail(params) {
            return Restangular.all('users/update-email').post(params);
        }

        /**
         * send request to update password
         * @param params
         * @returns {*}
         */
        function updatePassword(params) {
            return Restangular.all('users/update-password').post(params)
        }

        /**
         *
         * @param params
         * @returns {*}
         */
        function sendVerificationCode(params) {
            console.log(params)
            return Restangular.all('verifications/send-verification-code').post(params)
        }

        /**
         * add caller id
         * @param params
         * @returns {*}
         */
        function addCallerId(params) {
            return Restangular.all('users/add-caller-id').post(params)
        }

        /**
         * remove number
         * @param params
         * @returns {*}
         */
        function removeNumber(params) {
            return Restangular.all('users/remove-number').post(params);
        }

        /**
         * get cities
         * @param params
         * @returns {*}
         */
        function getCites(params) {
            return Restangular.one('data/cities').get(params);
        }

        /**
         * update main data
         * @param params
         * @returns {*}
         */
        function updateMainData(params) {
            return Restangular.all('users/update-main-data').post(params);
        }

        /**
         * get show user
         * @returns {*}
         */
        function getShowUser() {
            return Restangular.one('users/show-user').get();
        }

        /**
         * remove by id
         * @param id
         * @returns {*}
         */
        function removeById(id) {
            return Restangular.one('api-keys/remove-api-token', id).remove();
        }

        /**
         * update caller by id
         * @param id
         * @param params
         * @returns {*}
         */
        function updateCallerId(data) {
             var params = $httpParamSerializer(data);
            return Restangular.one('users/update-caller-id?'+params).put();
        }

    });