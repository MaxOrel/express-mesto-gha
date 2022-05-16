const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const ValidationError = require('../errors/ValidationError');

module.exports.findCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      if (!card) {
        throw new ValidationError('Переданы некорректные данные'); // res.status(400).send
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные')); // res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};

module.exports.deleteCardById = (req, res, next) => {
  const anotherUser = req.user._id;
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена'); // res.status(404).send
      } else if (anotherUser !== String(card.owner)) {
        throw new ForbiddenError('Попытка удалить другого пользователя');
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при удалении')); // res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена'); // res.status(404).send
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные для установки лайка')); // res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена'); // res.status(404).send
      } else {
        res.send({ data: card });
      }
    })

    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при удалении лайка')); // res.status(400).send
      } else {
        next(err); // res.status(500).send({ message: 'Произошла ошибка' })
      }
    });
};
