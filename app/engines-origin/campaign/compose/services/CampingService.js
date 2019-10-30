angular.module('callburnApp').factory('CampingService', function($sce, Restangular) {
  return {
    createAudioFromText: createAudioFromText,
    createFileFromBase: createFileFromBase,
    campaignsBatchSend: campaignsBatchSend,
    makeAudioTemplate: makeAudioTemplate,
    getAudioTemplates: getAudioTemplates,
    getContacts: getContacts,
    updateMainData: updateMainData,
    addPhoneNumbers: addPhoneNumbers,
    addNumbersAndCalculateCostManually: addNumbersAndCalculateCostManually,
    calculateCostForPreListening: calculateCostForPreListening
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

  /**
   * make audio templates
   * @param params
   * @returns {*}
   */
  function makeAudioTemplate(params) {
    return Restangular.all('audio-files/make-audio-template').post(params);
  }

  /**
   * get audio templates
   * @returns {*}
   */
  function getAudioTemplates() {
    return Restangular.one('audio-files/audio-templates').get();
  }

  /**
   * get contacts
   * @param data
   * @returns {*}
   */
  function getContacts(data) {
    return Restangular.one('address-book/index-contacts').get(data);
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
   * add phonenumbers from manually section
   * @param data
   * @returns {*}
   */
  function addPhoneNumbers(data) {
    return Restangular.all('phonenumbers/add-phonenumbers').post(data);
  }

  /**
   * add phonenumbers and calculate cost from manually section
   * @param data
   * @returns {*}
   */
  function addNumbersAndCalculateCostManually(abortRequest, data) {
    return Restangular.all('phonenumbers/add-numbers-and-calculate-cost-manually')
      .withHttpConfig({ timeout: abortRequest.promise })
      .post(data);
  }

  /**
   * requst a cost for pre-listening
   * @param data
   * @returns {*}
   */
  function calculateCostForPreListening(data) {
    return Restangular.one('/phonenumbers/calculate-cost-for-caller-id').get(data);
  }
});
