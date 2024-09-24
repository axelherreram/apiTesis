const {listTimeline} = require("../controllers/timelineController");
const express = require('express');
const router = express.Router();

router.get('/timeline/:user_id/:course_id', listTimeline);

module.exports = router;