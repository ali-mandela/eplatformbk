const express = require('express'); 
const { createController,  myEventsController, getEventByIdController, getAllEventsController, deleteEventByIdController, getAttendController, eventsToAttendController } = require('../controllers/eventController');
const { verifyToken } = require('../config/util');
 const router = express.Router();

router.post('/create',verifyToken, createController);
router.get('/my-event',verifyToken, myEventsController);
router.get('/event/:id',getEventByIdController);
router.delete('/event/:id',verifyToken,deleteEventByIdController);
router.get('/all-events', getAllEventsController);
router.get('/attending',verifyToken , eventsToAttendController);
// // router.post('/signin', loginController);  

// Attend the event
router.get('/attend/:id',verifyToken,getAttendController);

module.exports = router
