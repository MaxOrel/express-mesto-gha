const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const {
  findUsers, findUserById, patchUser, patchUserAvatar, getCurrentUser,
} = require('../controllers/users');

router.get('/users', findUsers);

// router.post('/users', login);

router.get('/users/me', getCurrentUser);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), findUserById);

// router.post('/users', createUser);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), patchUser);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(/^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w.-]*)*\/?$/),
  }),
}), patchUserAvatar);

module.exports = router;
