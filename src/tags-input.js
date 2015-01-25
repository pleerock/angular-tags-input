/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name tagsInput
     * @description
     * A special angular directive that allows to add "tags" into input box.
     */
    angular.module('tagsInput').directive('tagsInput', tagsInput);

    /**
     * @ngInject
     */
    function tagsInput(SelectedTokensRegistry, ArrayNgModelHelper, SelectedTokensValidator) {
        return {
            scope: {
                ngModel: '=',
                caretPosition: '=?',
                minLength: '=?',
                maxLength: '=?',
                maxItems: '=?',
                uniqueNames: '=?',
                delimiters: '=?', // todo
                disabled: '=?',
                persist: '=?',// todo
                isRemoveButton: '=?',
                isRestoreOnBackspace: '=?',
                placeholder: '@',
                decorator: '=?',
                tokenInputValue: '=?',
                containerWidth: '=?'
            },
            replace: true,
            restrict: 'E',
            require: ['ngModel', 'selectOptions'],
            templateUrl: 'tags-input.html',
            link: function (scope, element, attrs, controllers) {

                // ---------------------------------------------------------------------
                // Local variables
                // ---------------------------------------------------------------------

                var ngModelCtrl             = controllers[0];
                var selectOptionsCtrl       = controllers[1];
                var selectedTokens          = new SelectedTokensRegistry();
                var ngModelHelper           = new ArrayNgModelHelper(ngModelCtrl);
                var selectedTokensValidator = new SelectedTokensValidator();
                var input                   = element[0].querySelector('input');

                // ---------------------------------------------------------------------
                // Scope variables
                // ---------------------------------------------------------------------

                scope.nameField             = selectOptionsCtrl.getItemNameWithoutPrefixes();
                scope.containerWidth        = scope.containerWidth ? scope.containerWidth : element[0].offsetWidth;
                scope.isRemoveButton        = angular.isDefined(scope.isRemoveButton) ? scope.isRemoveButton : true;

                // ---------------------------------------------------------------------
                // Configuration
                // ---------------------------------------------------------------------

                selectedTokensValidator.set({
                    minLength:      scope.minLength,
                    maxLength:      scope.maxLength,
                    maxItems:       scope.maxItems,
                    nameField:      scope.nameField,
                    checkUnique:    scope.uniqueNames
                });

                // ---------------------------------------------------------------------
                // Local functions
                // ---------------------------------------------------------------------

                /**
                 * Changes a caret position and moves input to a new position.
                 *
                 * @param {number} position
                 */
                var changeCaretPosition = function (position) {
                    scope.caretPosition = position;
                    moveInputToPosition(position);
                };

                /**
                 * Moves input to the given position in the tokens container.
                 *
                 * @param {int} caretPosition
                 */
                var moveInputToPosition = function(caretPosition) {
                    var containerElements = element[0].getElementsByClassName('token-item');
                    if (!containerElements[caretPosition]) return;
                    element[0].insertBefore(input, containerElements[caretPosition]);
                };

                /**
                 * Clears tags input value.
                 */
                var clearInputValue = function () {
                    scope.tokenInputValue = ''; // restore input value
                    input.value = '';
                    input.dispatchEvent(new CustomEvent('update'));
                    input.focus();
                    scope.$emit('select-tags-input.text_entered', '');
                };

                /**
                 * Adds a new item to the model at the current cursor position. New item's value
                 * got from the input. After adding a new item, input is cleared.
                 */
                var addNewValueFromInput = function() {
                    var itemToBeAdded = {};
                    itemToBeAdded[scope.nameField] = scope.tokenInputValue.trim();
                    if (selectedTokensValidator.canItemBeAdded(ngModelHelper.getAll(), itemToBeAdded) === false) return;

                    ngModelHelper.add(itemToBeAdded, scope.caretPosition);
                    changeCaretPosition(scope.caretPosition + 1);
                    clearInputValue();
                };

                /**
                 * Move input to the left in the tokens container.
                 */
                var moveInputToLeft = function() {
                    if (scope.tokenInputValue || scope.caretPosition <= 0) return;

                    changeCaretPosition(scope.caretPosition - 1);
                    input.focus();
                };

                /**
                 * Move input to the right in the tokens container.
                 */
                var moveInputToRight = function() {
                    if (scope.tokenInputValue || scope.caretPosition >= ngModelHelper.count()) return;

                    changeCaretPosition(scope.caretPosition + 1);
                    input.focus();
                };

                /**
                 * Removes all selected tokens from the model.
                 */
                var removeSelectedTokens = function() {
                    if (scope.tokenInputValue || ngModelHelper.count() === 0) return;

                    ngModelHelper.removeAll(selectedTokens.getAll());
                    input.dispatchEvent(new CustomEvent('update'));
                    changeCaretPosition(ngModelHelper.count());
                    selectedTokens.clear();
                    input.focus();
                };

                /**
                 * Removes previous to the current caret position token from the model.
                 */
                var removePreviousToken = function() {
                    if (scope.tokenInputValue || ngModelHelper.count() === 0 || scope.caretPosition <= 0) return;

                    changeCaretPosition(scope.caretPosition - 1);

                    if (scope.isRestoreOnBackspace) {
                        var removedToken = ngModelHelper.get(scope.caretPosition);
                        scope.tokenInputValue = removedToken[scope.nameField] + ' ';
                        input.value = scope.tokenInputValue;
                        scope.$emit('select-tags-input.text_entered', input.value);
                    }

                    ngModelHelper.removeAt(scope.caretPosition);
                    moveInputToPosition(scope.caretPosition);
                    input.dispatchEvent(new CustomEvent('update'));
                    input.focus();
                };

                /**
                 * Removes the next to the current caret position token from the model.
                 */
                var removeNextToken = function() {
                    if (scope.tokenInputValue || ngModelHelper.count() === 0) return;

                    ngModelHelper.removeAt(scope.caretPosition);
                    moveInputToPosition(scope.caretPosition);
                    input.dispatchEvent(new CustomEvent('update'));
                    scope.$emit('select-tags-input.text_entered', input.value);
                    input.focus();
                };

                // ---------------------------------------------------------------------
                // Scope functions
                // ---------------------------------------------------------------------

                /**
                 * Gets the items that will be displayed as tags.
                 *
                 * @returns {Object[]}
                 */
                scope.getTags = function() {
                    var tags = ngModelCtrl.$modelValue;
                    if (tags && !angular.isArray(tags))
                        return [tags];

                    return tags;
                };

                /**
                 * Gets the item name that will be used to display in the list.
                 *
                 * @param {Object} item
                 * @returns {string}
                 */
                scope.getItemName = function(item) {
                    var value = selectOptionsCtrl.parseItemName(item);
                    value = String(value).replace(/<[^>]+>/gm, ''); // strip html from the data here
                    return scope.decorator ? scope.decorator(item) : value;
                };

                /**
                 * Called when input value changes.
                 */
                scope.onInputValueChange = function(value) {
                    input.dispatchEvent(new CustomEvent('update'));
                    scope.$emit('select-tags-input.text_entered', value);
                    selectedTokens.clear(); // remove bulk selected elements if user started to type
                };

                /**
                 * Checks if given token is in the list of selected tokens.
                 *
                 * @param {object} token
                 * @returns {boolean} True if token is selected, false otherwise
                 */
                scope.isSelected = function(token) {
                    return selectedTokens.has(token);
                };

                /**
                 * When click is performed on a token - we "select" it, and remove
                 * select effect from all other tokens if shift key was not pressed.
                 *
                 * @param {MouseEvent} event
                 * @param {object} selectedToken
                 */
                scope.tagSelect = function(event, selectedToken) {
                    event.stopPropagation();

                    if (!event.altKey && !event.ctrlKey && !event.shiftKey) {
                        selectedTokens.clear();
                        selectedTokens.add(selectedToken);
                    } else {
                        selectedTokens.toggle(selectedToken);
                    }

                    changeCaretPosition(ngModelHelper.count());
                };

                /**
                 * Removes a tag from the ng-model by a given tag index.
                 *
                 * @param {MouseEvent} event
                 * @param {int} index
                 */
                scope.tagRemove = function(event, index) {
                    event.stopPropagation();
                    ngModelHelper.removeAt(index);
                    changeCaretPosition(ngModelHelper.count());
                    selectedTokens.clear();
                    input.blur();
                };

                // ---------------------------------------------------------------------
                // DOM manipulation
                // ---------------------------------------------------------------------

                // when user clicks on the container it must automatically activate its input
                element[0].addEventListener('click', function () {
                    input.focus();
                    changeCaretPosition(ngModelHelper.count());
                    selectedTokens.clear(); // remove bulk selected elements if user started to type
                    scope.$digest();
                });

                // listen to key downs on the container to make control operations
                element[0].addEventListener('keydown', function (e) {
                    switch (e.keyCode) {

                        case 65: // KEY "A"
                            if ((e.ctrlKey || e.metaKey) && !scope.tokenInputValue) { // select all tokens
                                selectedTokens.addAll(ngModelHelper.getAll());
                                scope.$digest();
                            }
                            return;

                        case 13: // KEY "ENTER"
                            addNewValueFromInput();
                            scope.$apply(); // note: don't use $digest here because it will cause a lag
                            return;

                        case 37: // KEY "LEFT"
                            moveInputToLeft();
                            scope.$apply(); // note: don't use $digest here because it will break proper caret position changing
                            return;

                        case 39: // KEY "RIGHT"
                            moveInputToRight();
                            scope.$apply(); // note: don't use $digest here because it will break proper caret position changing
                            return;

                        case 8: // KEY "BACKSPACE"
                            selectedTokens.hasAny() ? removeSelectedTokens() : removePreviousToken();
                            scope.$digest();
                            return;

                        case 46: // KEY "DELETE"
                            selectedTokens.hasAny() ? removeSelectedTokens() : removeNextToken();
                            scope.$digest();
                            return;
                    }
                });

                // close dropdown, reset caret and other things if use clicks outside of this directive
                document.addEventListener('mousedown', function() {
                    if (element[0].contains(event.target)) return;

                    selectedTokens.clear();
                    changeCaretPosition(ngModelHelper.count());
                    scope.$digest();
                });

                // ---------------------------------------------------------------------
                // Watchers
                // ---------------------------------------------------------------------

                // this is required to set carent position to the end when ng model firstly initialized
                scope.$watch('ngModel', function() {
                    changeCaretPosition(ngModelHelper.count());
                });

                // watch a caret position changes from outside
                scope.$watch('caretPosition', function(newPosition, oldPosition) {
                    if (newPosition === oldPosition)
                        return;
                    changeCaretPosition(newPosition);
                });

                // ---------------------------------------------------------------------
                // Event listeners
                // ---------------------------------------------------------------------

                // this event request tags input to clear itself
                scope.$on('select-tags-input.clear_input', function() {
                    clearInputValue();
                });

            }
        }
    }

})();