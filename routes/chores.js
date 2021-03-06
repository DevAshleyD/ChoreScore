const {
  express,
  check,
  validationResult,
  db,
  Chore,
  List,
  ChoreType,
  asyncHandler,
} = require("../utils.js");

const router = express.Router();

const choreNotFoundError = (id) => {
  const err = Error("Chore not found");
  err.errors = [`Chore with id of ${id} could not be found.`];
  err.title = "Chore not found.";
  err.status = 404;
  return err;
};

const validateChore = [
  check("choreName")
    .exists({ checkFalsy: true })
    .withMessage("Chore Name cannot be empty.")
    .isLength({ max: 50 })
    .withMessage("Chore Name cannot be longer than 50 characters."),
  check("value")
    .exists({ checkFalsy: true })
    .withMessage("Chore value cannot be empty.")
    .isInt({ min: 0 })
    .withMessage("Value must be an integer."),
  check("note")
    .isLength({ max: 255 })
    .withMessage("Note cannot be longer than 255 characters."),
];

// Find all chores according to user ID
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const chores = await Chore.findAll({
      where: {
        userId: req.session.auth.id,
      },
    });
    if (chores) {
      res.json({ chores });
    } else {
      const err = new Error("Chore not found");
      err.status = 404;
      err.title = "Chore not found.";
      throw err;
    }
  })
);

// Find one chore with chore ID
router.get(
  "/:id(\\d+)",
  asyncHandler(async (req, res, next) => {
    const chore = await Chore.findOne({
      where: {
        id: req.params.id,
      },
      include: [List, ChoreType]
    });
    if (chore) {
        res.json({
          choreId: chore.id,
          choreName: chore.choreName,
          dueDate: chore.dueDate,
          list: chore.List.listName,
          type: chore.ChoreType.choreType,
          note: chore.note,
          point: chore.value,
          choreTypeId: chore.choreTypeId,
          listId: chore.listId,
        });
    } else {
      next(choreNotFoundError(req.params.id));
    }
  })
);

// Create a new chore
// **Edited for Error Handling
// ADDITIONAL NOTES: For some reason this still requires the date to
// be filled out, for no clear reason that we can find.
// We also have to keep defining blank error arrays and passing them in
// in order to avoid errors when loading pages that have error
// handling. This is something we need to look into.
router.post(
  "/create",
  validateChore,
  asyncHandler(async (req, res, next) => {
    let errors = [];
    const { choreName, value, note, dueDate, choreTypeId, listId } = req.body;
    const chore = db.Chore.build({
      userId: req.session.auth.userId,
      choreName,
      value,
      note,
      dueDate,
      choreTypeId,
      listId,
    });
    const user = await db.User.findByPk(req.session.auth.userId, {
      include: [List, Chore],
    });
    const validatorErrors = validationResult(req);
    if (validatorErrors.isEmpty()) {
      await chore.save();
      res.json({
        choreName,
        value,
        note,
        dueDate,
        choreTypeId,
        listId,
        errors,
      });
    } else {
      choreErrors = validatorErrors.array().map((error) => error.msg);
      res.render("dashboard", {
        title: "Dashboard",
        userName: user.userName,
        chores: user.Chores,
        lists: user.Lists,
        chore,
        errors,
      });
    }
  })
);

// Edit a chore + Complete a chore
router.put(
  "/:id(\\d+)/edit",
  validateChore,
  asyncHandler(async (req, res, next) => {
    const {
      choreName,
      value,
      note,
      dueDate,
      choreTypeId,
      isCompleted,
      listId,
    } = req.body;
    const chore = await Chore.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (req.session.auth.userId !== chore.userId) {
      const err = new Error("Unauthorized");
      err.status = 401;
      err.message = "You're not authorized to edit this chore.";
      err.title = "Unauthorized";
      throw err;
    }
    if (chore) {
      await chore.update({
        choreName,
        value,
        note,
        dueDate,
        choreTypeId,
        isCompleted,
        listId,
      });
      res.json({ chore });
    } else {
      next(choreNotFoundError(req.params.id));
    }
  })
);

// Delete a chore
router.delete(
  "/:id(\\d+)/delete",
  asyncHandler(async (req, res, next) => {
    const { choreName } = req.body;
    const destroyedChore = choreName;
    const chore = await Chore.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (req.session.auth.userId !== chore.userId) {
      const err = new Error("Unauthorized");
      err.status = 401;
      err.message = "You're not authorized to delete this chore.";
      err.title = "Unauthorized";
      throw err;
    }
    if (chore) {
      await chore.destroy();
      res.json({ message: `${destroyedChore} has been deleted.` });
    } else {
      next(choreNotFoundError(req.params.id));
    }
  })
);

module.exports = router;
