const Questionnaire = require("../models/Questionnaire");
const QuestionnaireAttempt = require("../models/QuestionnaireAttempt");

exports.createQuestionnaire = async (req, res) => {
  try {
    const { title, questions } = req.body;
    const questionnaire = new Questionnaire({
      title,
      creator: req.user._id,
      questions,
    });
    await questionnaire.save();
    res.status(201).json({
      message: "Questionnaire created successfully",
      questionnaire: {
        id: questionnaire._id,
        title: questionnaire.title,
        shareableLink: `${req.protocol}://${req.get("host")}/q/${
          questionnaire.shareableLink
        }`,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create questionnaire",
      error: error.message,
    });
  }
};

exports.listQuestionnaires = async (req, res) => {
  try {
    const questionnaires = await Questionnaire.find().populate(
      "creator",
      "firstName lastName position"
    );
    res.json(questionnaires);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch questionnaires",
      error: error.message,
    });
  }
};

exports.getQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id).populate(
      "creator",
      "firstName lastName position"
    );
    if (!questionnaire) {
      return res.status(404).json({ message: "Questionnaire not found" });
    }
    res.json(questionnaire);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch questionnaire", error: error.message });
  }
};

exports.submitQuestionnaire = async (req, res) => {
  try {
    const { answers } = req.body;
    const questionnaire = await Questionnaire.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ message: "Questionnaire not found" });
    }

    let score = 0;
    questionnaire.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        switch (question.weight) {
          case "Low":
            score += 1;
            break;
          case "Medium":
            score += 2;
            break;
          case "High":
            score += 3;
            break;
        }
      }
    });

    res.json({ message: "Questionnaire submitted successfully", score });
  } catch (error) {
    res.status(400).json({
      message: "Failed to submit questionnaire",
      error: error.message,
    });
  }
};

exports.getQuestionnaireAttempts = async (req, res) => {
  try {
    const questionnaireId = req.params.id;
    const attempts = await QuestionnaireAttempt.find({
      questionnaire: questionnaireId,
    })
      .select("score createdAt")
      .sort("-createdAt");
    res.json(attempts);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch questionnaire attempts",
      error: error.message,
    });
  }
};
