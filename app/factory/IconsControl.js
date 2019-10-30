
module.exports = [
    function () {
        return {

            hoverIn:hoverIn,
            hoverOut:hoverOut,

        };
        /**
         * get contacts
         */

        function hoverIn(index) {


            if(iconName === undefined) {
                iconName = null;
            }

            if(imageName === undefined) {
                imageName = null;
            }

            if(id === undefined) {
                id = null;
            }

            if(iconName == "deleteIcon") {
                var icon = angular.element("#delete-contact-icon-" + index);
                icon.attr('src',"/assets/callburn/images/images/icons-trash@3x-hover.svg");

            } else if (iconName == "campaign-template-icons") {

                angular.element("#campaign-template-icons-" + index).attr('src',"/assets/callburn/images/images/" + imageName);
            } else {

                angular.element('#' + id + "-" + index).attr('src', imageName);
            }

        }

        function hoverOut(index) {


            if(iconName === undefined) {
                iconName = null;
            }

            if(imageName === undefined) {
                imageName = null;
            }

            if(id === undefined) {
                id = null;
            }


            if(iconName == "deleteIcon") {
                var icon = angular.element("#delete-contact-icon-" + index);
                icon.attr('src',"/assets/callburn/images/images/icons-trash@3x.svg");

            } else if (iconName == "campaign-template-icons") {

                angular.element("#campaign-template-icons-" + index).attr('src',"/assets/callburn/images/images/" + imageName);
            } else {

                angular.element('#' + id + "-" + index).attr('src', imageName);
            }
        }
    }
];