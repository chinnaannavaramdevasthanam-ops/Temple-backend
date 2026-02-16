const Joi = require("joi");

exports.createSevaSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().allow("", null),
  price: Joi.number().positive().required(),
  totalSlots: Joi.number().integer().positive().required(),
  date: Joi.date().allow(null),
  isDaily: Joi.boolean()
});
