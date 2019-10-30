module.exports = ['Restangular',
    function (Restangular) {

        return {
            GetLanguage : function (LocalStorageKey, LanguageList) {
                // var browserLanguage = (navigator.language || navigator.userLanguage) . split('-')[0];
                // var lang = {
                //     code : "en",
                //     name : "ENG"
                // }
                // Restangular.one('users/language').get().then(function (data) {
                //     if (data.resource.language) {
                //         lang.code = data.resource.language.code,
                //         lang.name = data.resource.language.name
                //     } else if (localStorage.getItem(LocalStorageKey)) {
                //         lang.code = localStorage.getItem("CurrentUserLanguageCode");
                //         lang.name = localStorage.getItem("CurrentUserLanguageName");
                //     }
                // });
                // return lang;
                var browserLanguage = ( navigator.language || navigator.userLanguage) . split('-')[0];
                var lang = {
                    code : "en",
                    name : "ENG"
                }

                if (localStorage.getItem(LocalStorageKey)) {
                    lang.code = localStorage.getItem("CurrentUserLanguageCode");
                    lang.name = localStorage.getItem("CurrentUserLanguageName");
                } else {
                    for (language in LanguageList) {
                        if(language.code == browserLanguage) {
                            lang.code = browserLanguage;
                            lang.name = language.name;
                        }
                    }
                }

                return lang;
            },

            GetLanguagesList: function (data) {
                return Restangular.one('data/languages').get(data);
            }

        };





    }];