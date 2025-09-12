/**
 * Helper script for the data entry of the treatment interruption instrument.
 *
 * @author Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 */

'use strict';

// Assoc for the medications from Med Use module indexed by CategoryID
let medicationsByCategories;

// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // Removes the info tables for the data entry pages
  adjustDefaultDisplayElementsForDataEntry();
  // Add selector listeners
  addSelectInputListeners();
  // Add button listeners
  addButtonListeners();
});

/**
 *
 * Function which removes default elements from the display to maximize
 * the space available for data entry.
 *
 */
function adjustDefaultDisplayElementsForDataEntry() {
  // Detach the current lorisworkspace div
  let currentSpace = $('#lorisworkspace').detach();
  // Remove the two information tables from their div and append the
  // saved structure to the proper element
  $('div.inset > div:nth-child(2)').empty().append(currentSpace);
}

/**
 *
 * Function to call the listener of the select elements.
 *
 */
function addSelectInputListeners() {
  _addMedicationCategorySelectListener();
  _addMedicationLogSelectListener();
}

/**
 *
 * Function to add a listener to the category selectors.
 *
 * @private
 */
function _addMedicationCategorySelectListener() {
  // For changes on a category selector
  $('select.medication-category-selector').on('change', function(e) {
    // Get the selector's ID and value
    let id = $(e.target).prop('id');
    let categoryID = $(e.target).val();
    // Get the ID for the matching medication selector
    let medications = $('#' + id[0] + '_proscribed_medication_' + id[id.length - 1]);
    // Empty the matching medication selector then add an empty option
    $(medications).empty().append(new Option('', ''));
    // If the categoryID is not empty, the medications selector is found and
    // the category exists in the reference object
    if (categoryID !== '' && medications.length !== 0 && medicationsByCategories.hasOwnProperty(categoryID)) {
      // For all medications of the category
      for (const [medicationID, medication] of Object.entries(medicationsByCategories[categoryID].Medications)) {
        // Add an entry in the medicationID select element
        $(medications).append(new Option(medication.Name + ' (' + medication.Brand_Name + ')', medicationID));
      }
    }
  });
}

/**
 *
 * Function to add a listener to the Medication Log lookup selector.
 *
 * @private
 */
function _addMedicationLogSelectListener() {
  // For changes to a medication log selector
  $('select.medication-log-selector').on('change', function() {
    // Get the selector's ID and the node of the option selected
    let id = $(this).prop('id');
    let medication = $('option:selected', this);
    // If the option selected is null
    if ($(medication).val() === '') {
      // Blank the matching category and trigger change to blank the associated medication
      $('#' + id[0] + '_proscribed_medication_category_' + id[id.length - 1]).val('').trigger('change');
      // If the option selected is not null
    } else {
      // Set the category to the value found in the option's attribute then
      // trigger change to update the matching medication select element
      $('#' + id[0] + '_proscribed_medication_category_' + id[id.length - 1]).val($(medication).attr('categoryid')).trigger('change');
      // Set the medication to the value found in the option's attribute
      $('#' + id[0] + '_proscribed_medication_' + id[id.length - 1]).val($(medication).attr('medicationid'));
    }
  });
}

/**
 *
 * Function to call the listener of the button elements.
 *
 */
function addButtonListeners() {
  _addEmptyTableButtonListener();
  _addHideEmptiesButtonListener();
  _addResetButtonListener();
  _addSubmitButtonListener();
}

/**
 *
 * Function to add a listener to the add empty table button.
 *
 * @private
 */
function _addEmptyTableButtonListener() {
  // For clicks on the add empty table button
  $('#add_empty_button').on('click', function() {
    // For each data entry div of the form
    $('#data_entry_form > div.data-entry-div').each(function(index, element) {
      // If the div is hidden
      if ($(element).hasClass('hidden')) {
        // set to visible
        $(element).removeClass('hidden');
        // break out
        return false;
      }
      // If the last available div has already been shown, prompt error
      if ((index + 1) === $('#data_entry_form > div.data-entry-div').length) {
        fancyErrorPrompt('Out of Empty Slots', 'You\'ve reached the maximum number of interruptions. Contact IT for support.');
      }
    });
  });
}

/**
 *
 * Function to add a listener to the toggle empties button.
 *
 * @private
 */
function _addHideEmptiesButtonListener() {
  // For clicks on the empties button
  $('#toggle_empties_button').on('click', function() {
    // For all data entry divs
    $('#data_entry_form > div.data-entry-div').each(function(index, element) {
      // If it's the first div
      if (index === 0) {
        // Set to visible
        $(element).removeClass('hidden');
        // For other divs with empty date for form completion
      } else if ($('table > tbody > tr:nth-child(3) > td:nth-child(2) > input[type="date"]', element).val() === '') {
        // Set to invisible
        $(element).addClass('hidden');
        // For all other divs with a non-null date for form completion
      } else {
        // Set to visible
        $(element).removeClass('hidden');
      }
    });
  });
}

/**
 *
 * Function to add a listener to the reset button.
 *
 * @private
 */
function _addResetButtonListener() {
  // For a click on the reset button
  $('#reset_button').on('click', function(e) {
    // Prevent the propagation
    e.preventDefault();
    // Reset all the date inputs
    $('#data_entry_form input[type="date"]').val('');
    // Reset all the select
    $('#data_entry_form select').val('');
    // Reset all the textareas
    $('#data_entry_form textarea').val('');
    // Trigger a click on the empties button to adjust display
    $('#toggle_empties_button').trigger('click');
  });
}

/**
 *
 * Function to add a listener to the submit button of the form.
 *
 * @private
 */
function _addSubmitButtonListener() {
  // On a click of the submit button
  $('#fire_control').on('click', function(e) {
    // Initialize an empty errors object
    let errors = {};
    // For each data-entry div
    $('#data_entry_form > div.data-entry-div').each(function(index, element) {
      // Validate adverse events
      _validateAdverseEvents(element, errors);
      // Validate the medications
      _validateMedications(index, element, errors);
      // Validate the comments
      _validateTextareas(element, errors);
    });
    // If some errors were found
    if (Object.keys(errors).length !== 0) {
      // Stop the propagation
      e.preventDefault();
      // Prompt the errors found
      _submitErrorMessage(errors, 'The following errors were found:', 'Errors');
    }
  });
}

/**
 *
 * Function to validate that the adverse event selected don't repeat in the
 * same form.
 *
 * @param {string}  element     Data entry div
 * @param {Object}  errors      Errors object
 * @private
 */
function _validateAdverseEvents(element, errors) {
  let events = {};
  $('select.adverse-event-selector', element).each(function() {
    let eventID = $(this).val();
    if (eventID !== '') {
      if (events.hasOwnProperty(eventID)) {
        errors[$(this).prop('name')] = ['Repeated adverse event.'];
      } else {
        events[eventID] = $(this).prop('name');
      }
    }
  });
}

/**
 *
 * Function to validate the proscribed medications of a data entry div.
 *
 * @param {int}  index        Index of the medication in its div
 * @param {string}  div       Data entry div
 * @param {Object}  errors    Error object
 * @private
 */
function _validateMedications(index, div, errors) {
  // If the data entry div has a non-null date for completion
  if ($('table > tbody > tr:nth-child(3) > td:nth-child(2) > input[type="date"]', div).val() !== '') {
    // For each increment of proscribed medications available
    for (let i = 1; i < 5; i++) {
      // Get the category and medication IDs
      let categoryID = $('#' + (index + 1) + '_proscribed_medication_category_' + i).val();
      let medicationID = $('#' + (index + 1) + '_proscribed_medication_' + i).val();
      // If the category is defined
      if (categoryID !== '') {
        // If the category doesn't match a registered category
        if (!medicationsByCategories.hasOwnProperty(categoryID)) {
          errors[(index + 1) + '_proscribed_medication_category_' + i] = ['Category doesn\'t exist.'];
          // if the medication isn't defined with a defined category
        } else if (medicationID === '') {
          errors[(index + 1) + '_proscribed_medication_' + i] = ['A medication is mandatory when a category is selected.'];
          // if the medication is not registered for the category selected
        } else if (!medicationsByCategories[categoryID].Medications.hasOwnProperty(medicationID)) {
          errors[(index + 1) + '_proscribed_medication_' + i] = ['The medication selected isn\'t registered for the category selected.'];
        }
      }
    }
  }
}

/**
 *
 * Function to validate the content of textarea elements of a node.
 *
 * @param {string}  div         data entry div
 * @param {Object}  errors      Errors object
 * @private
 */
function _validateTextareas(div, errors) {
  // If the div has a non-null date of completion
  if ($('table > tbody > tr:nth-child(3) > td:nth-child(2) > input[type="date"]', div).val() !== '') {
    // For each textarea element in the context submitted
    $('textarea', div).each(function() {
      // Get unsupported characters matches
      let matches = $(this).val().match(/[^()?!%:0-9a-z,\.'\-\/àÀâÂçÇéÉèÈêÊëËîÎïÏôÔÖöûÛùÙüÜÿŸñæœ ]/gi);
      // If there were matches
      if (matches) {
        // Add errors to object
        errors[$(this).prop('name')] = matches.toString();
      }
    });
  }
}

/**
 * Wrapper function for validation prompt error messages on the data entry page.
 * @param {Object} errors       Object containing the errors to be listed in the
 *                              prompt
 * @param {string}  description Description to preface the listing of the errors
 * @param {string}  title       Title of the prompt
 * @private
 */
function _submitErrorMessage(errors, description, title) {
  // Initialize the error HTML string
  let message = `<p class="text-center">${description}</p><ul class="text-left">`;
  // Add each error as an item in the error list
  Object.keys(errors).forEach(function(element) {
    message += '<li>' + errors[element] + ' (' + element + ')</li>';
  });
  // Close the list
  message += '</ul>';
  // Prompt the message
  fancyErrorPrompt(title, message);
}

/**
 * Function which creates a SweetAlert error prompt.
 * @param {string} title    Title of the error prompt
 * @param {string} message  Message to be displayed in the error prompt
 */
function fancyErrorPrompt(title, message) {
  swal({
    title: title,
    type: 'error',
    text: message,
    html: true
  });
}
