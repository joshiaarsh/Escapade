const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateActivityInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.ageGroup = !isEmpty(data.ageGroup) ? data.ageGroup : '';
  data.intensity = !isEmpty(data.intensity) ? data.intensity : '';
  data.hours = !isEmpty(data.hours) ? data.hours : '';
  data.street = !isEmpty(data.street) ? data.street : '';
  data.city = !isEmpty(data.city) ? data.city : '';
  data.province = !isEmpty(data.province) ? data.province : '';
  data.country = !isEmpty(data.country) ? data.country : '';
  data.postalCode = !isEmpty(data.postalCode) ? data.postalCode : '';
  data.description = !isEmpty(data.description) ? data.description : '';

  if (!Validator.isLength(data.name, { min: 2 })) {
    errors.name = 'Activity name should be more than 2 characters';
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Activity Name field is required';
  }

  if (!Validator.isLength(data.description, { min: 10 })) {
    errors.description = 'Activity name should be more than 10 characters';
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = 'Activity description field is required';
  }

  if (!isEmpty(data.website)) {
    if (!Validator.isURL(data.website)) {
      errors.website = 'Not a valid URL';
    }
  }

  if (Validator.isEmpty(data.ageGroup)) {
    errors.ageGroup = 'Age group field is required';
  }

  if (Validator.isEmpty(data.intensity)) {
    errors.intensity = 'Intensity field is required';
  }

  if (Validator.isEmpty(data.hours)) {
    errors.hours = 'Business hours field is required';
  }

  if (Validator.isEmpty(data.street)) {
    errors.street = 'Street field is required';
  }

  if (Validator.isEmpty(data.city)) {
    errors.city = 'City field is required';
  }

  if (Validator.isEmpty(data.province)) {
    errors.province = 'Province field is required';
  }

  if (Validator.isEmpty(data.postalCode)) {
    errors.postalCode = 'Postal code field is required';
  }

  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(data.youtube)) {
      errors.youtube = 'Not a valid URL';
    }
  }

  if (!isEmpty(data.twitter)) {
    if (!Validator.isURL(data.twitter)) {
      errors.twitter = 'Not a valid URL';
    }
  }

  if (!isEmpty(data.facebook)) {
    if (!Validator.isURL(data.facebook)) {
      errors.facebook = 'Not a valid URL';
    }
  }

  if (!isEmpty(data.linkedin)) {
    if (!Validator.isURL(data.linkedin)) {
      errors.linkedin = 'Not a valid URL';
    }
  }

  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(data.instagram)) {
      errors.instagram = 'Not a valid URL';
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
