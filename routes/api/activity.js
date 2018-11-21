const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateActivityInput = require('../../validation/activity');

// Load Activity Model
const Activity = require('../../models/Activity');

// Load User Model
const User = require('../../models/User');

// @route   GET api/activity/test
// @desc    Tests activity route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Activity Works' }));

// @route   GET api/activity/all
// @desc    Get all activities
// @access  Public
router.get('/all', (req, res) => {
  const errors = {};

  Activity.find()
    .populate('user', ['name', 'avatar'])
    .then(activities => {
      if (!activities) {
        errors.noactivity = 'There are no activities';
        return res.status(404).json(errors);
      }

      res.json(activities);
    })
    .catch(err =>
      res.status(404).json({ activity: 'There are no activities' })
    );
});

// @route   GET api/activity/user/:user_id
// @desc    Get activity by user ID
// @access  Public

router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Activity.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(activity => {
      if (!activity) {
        errors.noprofile = 'There is no activity for this user';
        res.status(404).json(errors);
      }

      res.json(activity);
    })
    .catch(err =>
      res.status(404).json({ activity: 'There is no activity for this user' })
    );
});

// @route   POST api/activity
// @desc    Create or edit user activity
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateActivityInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const activityFields = {};
    activityFields.user = req.user.id;
    if (req.body.name) activityFields.name = req.body.name;
    if (req.body.description) activityFields.description = req.body.description;
    if (req.body.website) activityFields.website = req.body.website;
    if (req.body.ageGroup) activityFields.ageGroup = req.body.ageGroup;
    if (req.body.intensity) activityFields.intensity = req.body.intensity;

    // Price
    activityFields.price = {};
    if (req.body.adult) activityFields.price.adult = req.body.adult;
    if (req.body.teen) activityFields.price.teen = req.body.teen;
    if (req.body.kid) activityFields.price.kid = req.body.kid;
    if (req.body.senior) activityFields.price.senior = req.body.senior;

    // Hours - Split into array
    if (typeof req.body.hours !== 'undefined') {
      activityFields.hours = req.body.hours.split(', ');
    }

    // Phone - Split into array
    if (typeof req.body.phone !== 'undefined') {
      activityFields.phone = req.body.phone.split(', ');
    }

    // Address
    activityFields.address = {};
    if (req.body.street) activityFields.address.street = req.body.street;
    if (req.body.city) activityFields.address.city = req.body.city;
    if (req.body.province) activityFields.address.province = req.body.province;
    if (req.body.postalCode)
      activityFields.address.postalCode = req.body.postalCode;

    // Social
    activityFields.social = {};
    if (req.body.youtube) activityFields.social.youtube = req.body.youtube;
    if (req.body.twitter) activityFields.social.twitter = req.body.twitter;
    if (req.body.facebook) activityFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) activityFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram)
      activityFields.social.instagram = req.body.instagram;

    Activity.findOne({ user: req.user.id }).then(activity => {
      if (activity) {
        // Update
        Activity.findOneAndUpdate(
          { user: req.user.id },
          { $set: activityFields },
          { new: true }
        ).then(activity => res.json(activity));
      } else {
        // Create

        // Check if identifier exists
        Activity.findOne({ name: activityFields.identifier }).then(activity => {
          if (activity) {
            errors.name = 'That identifier already exists';
            res.status(400).json(errors);
          }

          // Save Profile
          new Activity(activityFields)
            .save()
            .then(activity => res.json(activity));
        });
      }
    });
  }
);

// @route   DELETE api/activity/:id
// @desc    Delete activity
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('Attemping delete...');
    Activity.findOneAndDelete({ _id: req.params.id })
      .then(() => res.json({ success: true }))
      .catch(err => res.status(404).json({ activity: 'no activity found' }));
  }
);

// @route   POST api/activity/like/:id
// @desc    Like activity
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Activity.findById(req.params.id)
        .then(activity => {
          if (
            activity.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this activity' });
          }

          // Add user id to likes array
          activity.likes.unshift({ user: req.user.id });

          activity.save().then(activity => res.json(activity));
        })
        .catch(err =>
          res.status(404).json({ activitynotfound: 'No activity found' })
        );
    });
  }
);

// @route   POST api/activity/unlike/:id
// @desc    Unlike activity
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Activity.findById(req.params.id)
        .then(activity => {
          if (
            activity.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this activity' });
          }

          // Get remove index
          const removeIndex = activity.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          activity.likes.splice(removeIndex, 1);

          // Save
          activity.save().then(activity => res.json(activity));
        })
        .catch(err =>
          res.status(404).json({ activitynotfound: 'No activity found' })
        );
    });
  }
);

// @route   POST api/activity/comment/:id
// @desc    Add comment to activity
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    Activity.findById(req.params.id)
      .then(activity => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        activity.comments.unshift(newComment);

        // Save
        activity.save().then(activity => res.json(activity));
      })
      .catch(err =>
        res.status(404).json({ activitynotfound: 'No activity found' })
      );
  }
);

// @route   DELETE api/activity/comment/:id/:comment_id
// @desc    Remove comment from activity
// @access  Private
// @param   id is the activity id
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Activity.findById(req.params.id)
      .then(activity => {
        // Check to see if comment exists
        if (
          activity.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index
        const removeIndex = activity.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        activity.comments.splice(removeIndex, 1);

        activity.save().then(activity => res.json(activity));
      })
      .catch(err =>
        res.status(404).json({ postnotfound: 'No activity found' })
      );
  }
);
module.exports = router;
