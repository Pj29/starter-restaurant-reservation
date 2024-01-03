const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const { today } = require("../utils/date-time");

async function list(req, res) {
  const date = req.query.date || today();
  const mobileNumber = req.query.mobile_number;
  const data = mobileNumber
    ? await service.search(mobileNumber)
    : await service.list(date);
  res.json({ data });
}

const VALID_PROPERTIES = [
  "reservation_id",
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at",
];

const hasData = (req, res, next) =>
  req.body.data
    ? next()
    : next({ status: 400, message: "Body must have data property" });

const hasOnlyValidProperties = (req, res, next) => {
  const invalidProperties = Object.keys(req.body.data || {}).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );
  invalidProperties.length
    ? next({
        status: 400,
        message: `Invalid field(s): ${invalidProperties.join(", ")}`,
      })
    : next();
};

const hasProperties =
  (...properties) =>
  (req, res, next) => {
    const missingProperties = properties.filter(
      (property) => !req.body.data[property]
    );
    missingProperties.length
      ? next({
          status: 400,
          message: `Missing required field(s): ${missingProperties.join(", ")}`,
        })
      : next();
  };

const validateDateTime = (req, res, next) => {
  const { reservation_date, reservation_time } = req.body.data;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!dateRegex.test(reservation_date)) {
    return next({
      status: 400,
      message: "reservation_date must be a valid date",
    });
  }
  if (!timeRegex.test(reservation_time)) {
    return next({
      status: 400,
      message: "reservation_time must be a valid time",
    });
  }
  next();
};

const peopleIsNumber = (req, res, next) => {
  const { people } = req.body.data || {};
  if (!Number.isInteger(people)) {
    next({ status: 400, message: "people must be a number" });
  } else {
    next();
  }
};

const isNotTuesday = (req, res, next) => {
  const { reservation_date } = req.body.data || {};
  const dateString = reservation_date.split("-");
  const numDate = new Date(
    Number(dateString[0]),
    Number(dateString[1]) - 1,
    Number(dateString[2])
  );
  if (numDate.getDay() === 2) {
    next({ status: 400, message: "restaurant is closed on Tuesdays" });
  } else {
    next();
  }
};

const isNotPastDate = (req, res, next) => {
  const { reservation_date, reservation_time } = req.body.data || {};
  const [hour, minute] = reservation_time.split(":");
  let [year, month, day] = reservation_date.split("-");
  month -= 1;
  const reservationDate = new Date(year, month, day, hour, minute).getTime();
  const today = new Date().getTime();
  if (reservationDate > today) {
    next();
  } else {
    next({
      status: 400,
      message: "reservation date and time must be set in the future",
    });
  }
};

const isWithinBusinessHours = (req, res, next) => {
  const { reservation_time } = req.body.data || {};
  if (reservation_time >= "10:30" && reservation_time <= "21:30") {
    next();
  } else {
    next({
      status: 400,
      message: "Reservation time must be within appropriate business hours",
    });
  }
};

const hasDefaultBookedStatus = (req, res, next) => {
  const { status } = req.body.data || {};
  if (status && status !== "booked") {
    next({
      status: 400,
      message: `A new reservation cannot have a status of ${status}`,
    });
  } else {
    next();
  }
};

const hasValidStatus = (req, res, next) => {
  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  const { status } = req.body.data || {};
  if (status && !validStatuses.includes(status)) {
    next({
      status: 400,
      message: `Invalid status: '${status}'. Status must be either 'booked', 'seated', 'finished,' or 'cancelled.'`,
    });
  } else {
    next();
  }
};

const isFinished = (req, res, next) => {
  const currentStatus = res.locals.reservation.status;
  if (currentStatus === "finished") {
    next({ status: 400, message: "A finished reservation cannot be updated." });
  } else {
    next();
  }
};

const isValidMobileNumber = (req, res, next) => {
  const { mobile_number } = req.body.data || {};
  const mobileNumberRegex = /^\d+$/;
  if (!mobile_number || !mobile_number.match(mobileNumberRegex)) {
    next({ status: 400, message: "Mobile number must contain only numbers" });
  } else {
    next();
  }
};

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

function read(req, res) {
  const data = res.locals.reservation;
  res.json({ data });
}

async function update(req, res) {
  const updatedReservation = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };
  const data = await service.update(updatedReservation);
  res.json({ data });
}

async function reservationExists(req, res, next) {
  const reservation_id = req.params.reservation_id;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} does not exist`,
  });
}

module.exports = {
  create: [
    hasData,
    hasOnlyValidProperties,
    hasProperties(
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people"
    ),
    isValidMobileNumber,
    validateDateTime,
    peopleIsNumber,
    isNotTuesday,
    isNotPastDate,
    isWithinBusinessHours,
    hasDefaultBookedStatus,
    asyncErrorBoundary(create),
  ],
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    hasData,
    hasOnlyValidProperties,
    hasProperties(
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people"
    ),
    validateDateTime,
    peopleIsNumber,
    isNotTuesday,
    isNotPastDate,
    isWithinBusinessHours,
    hasDefaultBookedStatus,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    hasData,
    asyncErrorBoundary(reservationExists),
    hasValidStatus,
    isFinished,
    asyncErrorBoundary(update),
  ],
};
