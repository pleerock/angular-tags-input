/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name ArrayNgModelHelper
     */
    angular.module('tagsInput').factory('ArrayNgModelHelper', ArrayNgModelHelper);

    /**
     * @constructor
     */
    function ArrayNgModelHelper() {
        return function(ngModelCtrl) {
            var self = this;

            self.onChange = function(scope, callback) {
                scope.$watch(function () {
                    return ngModelCtrl.$modelValue;
                }, callback);

            };

            self.getAll = function() {
                return ngModelCtrl.$modelValue || [];
            };

            self.get = function(index) {
                var model = self.getAll();
                return model[index];
            };

            self.has = function(item) {
                var model = self.getAll();
                return model.indexOf(item) !== -1;
            };

            self.set = function(model) {
                ngModelCtrl.$setViewValue(model);
            };

            self.add = function(item, index) {
                var model = self.getAll();
                model.splice(index, 0, item);
                ngModelCtrl.$setViewValue(model);
            };

            self.remove = function(item) {
                var model = self.getAll();
                var index = model.indexOf(item);
                if (index !== -1)
                    model.splice(index, 1);
                ngModelCtrl.$setViewValue(model);
            };

            self.removeAt = function(index) {
                var model = self.getAll();
                model.splice(index, 1);
                ngModelCtrl.$setViewValue(model);
            };

            self.removeAll = function(items) {
                var model = self.getAll();

                angular.forEach(items, function(item) {
                    var index = model.indexOf(item);
                    if (index !== -1)
                        model.splice(index, 1);
                });

                ngModelCtrl.$setViewValue(model);
            };

            self.count = function() {
                return self.getAll().length;
            };

        };
    }

})();