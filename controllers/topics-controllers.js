const { selectTopics } = require("../models/topics-models");

exports.getTopics = (request, response, next) => {
  selectTopics().then((topics) => {
    response.status(200).send({ topics });
  });
};