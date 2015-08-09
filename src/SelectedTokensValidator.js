/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name SelectedTokensValidator
     */
    angular.module('tagsInput').factory('SelectedTokensValidator', SelectedTokensValidator);

    /**
     * @constructor
     */
    function SelectedTokensValidator() {
        return function() {

            /**
             * Validation options.
             *
             * @type {{ nameField: string, minLength: number, maxLength: number, maxItems: number }}
             */
            var options;

            var getRealItemName = function(item) {
                return options.nameField ? item[options.nameField] : item;
            };

            /**
             * Sets the options required to perform validation.
             *
             * @param {object} validationOptions
             */
            this.set = function(validationOptions) {
                options = validationOptions;
            };

            /**
             * Determines if value is not unique and cannot be added to
             * the model array.
             *
             * @param {Array.<object>} tokens
             * @param {object} item
             * @returns {boolean}
             */
            this.isUnique = function(tokens, item) {
                if (!options.checkUnique) return true;

                var found = false;
                angular.forEach(tokens, function(token) {
                    var tokenName = getRealItemName(token);
                    var itemName  = getRealItemName(item);
                    if (tokenName && itemName && tokenName.toLowerCase() === itemName.toLowerCase())
                        found = true;
                });

                return found === false;
            };

            /**
             * Checks if item value is not empty.
             *
             * @param {boolean} item
             * @returns {boolean}
             */
            this.isNotEmpty = function(item) {
                return getRealItemName(item).length > 0;
            };

            /**
             * Checks if item value is not too short.
             *
             * @param {boolean} item
             * @returns {boolean}
             */
            this.isNotShort = function(item) {
                return angular.isUndefined(options.minLength) || getRealItemName(item).length >= options.minLength;
            };

            /**
             * Checks if item value is not too long.
             *
             * @param {boolean} item
             * @returns {boolean}
             */
            this.isNotLong = function(item) {
                return angular.isUndefined(options.maxLength) || getRealItemName(item).length <= options.maxLength;
            };

            /**
             * Checks if user didn't reach a maximal number of items in the input.
             *
             * @param {number} numberOfTokens
             * @returns {boolean}
             */
            this.isNotMaxAllowed = function(numberOfTokens) {
                return angular.isUndefined(options.maxItems) || numberOfTokens < options.maxItems;
            };

            /**
             * Determines if value can be added to the model array or not.
             *
             * @param {Array.<object>} tokens
             * @param {object} item
             * @returns {boolean}
             */
            this.canItemBeAdded = function(tokens, item) {
                return  this.isNotEmpty(item) &&
                    this.isUnique(tokens, item) &&
                    this.isNotShort(item) &&
                    this.isNotLong(item) &&
                    this.isNotMaxAllowed(tokens.length);
            };

        };
    }

})();