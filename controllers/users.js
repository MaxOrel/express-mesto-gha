const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const ValidationError = require('../errors/ValidationError');
const UnauthorizedError = require('../errors/UnauthorizedError');
// const res = require('express/lib/response');

module.exports.findUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch((err) => next(err)); // res.status(500).send({ message: 'Произошла ошибка' })
};

module.exports.findUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError({ message: 'Пользователь с указанным _id не найден' }); // res.status(404).send
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Переданы некорректные данные при поиске')); // res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      return res.send({ data: user });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  const createUser = (hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  });
  bcrypt
    .hash(password, 10)
    .then((hash) => createUser(hash))
    .then((user) => User.findOne({ _id: user._id }))
    .then((user) => {
      res.send({ data: user });
      // .then((user) => {
      //   const { _id } = user;
      //   res.send({
      //     data: {
      //       _id,
      //       name,
      //       about,
      //       avatar,
      //       email,
      //     },
      //   });
      // })
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Данный email уже используется'));
      } else if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя.')); // res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};

module.exports.patchUser = (req, res, next) => {
  const { name, about } = req.body;
  if (!name || !about) {
    return res.status(400).send({ message: 'Поля должны быть заполнены' });
  }
  return User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден'); // res.status(404).send
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя.')); // res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};

module.exports.patchUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  if (!avatar) {
    return res.status(400).send({ message: 'Поле должно быть заполнено' });
  }

  return User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден'); // res.status(404).send
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя.')); //  res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });

      // вернём токен
      res.send({ token });
    })
    .catch(() => {
      // ошибка аутентификации
      next(new UnauthorizedError('невозможно авторизоваться'));
    });
};
