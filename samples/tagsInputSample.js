/**
 * Sample that shows how tags-input directive work.
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name tagsInputSample
     */
    angular.module('tagsInputSample', ['tagsInput']);

    /**
     * @ngInject
     * @ngdoc controller
     * @name TagsInputSampleCtrl
     */
    angular.module('tagsInputSample').controller('TagsInputSampleCtrl', function ($scope) {

        /**
         * Callback called when model is changed.
         *
         * @param {*} tag
         */
        $scope.changed = function(tag) {
            console.log(tag);
            $scope.isChangedCalled = true;
        };

    });

})();