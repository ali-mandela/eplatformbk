const { errorHandler } = require("../config/util");
const eventModel = require('../models/eventModel');
const userModel = require('../models/userModel');  

module.exports.createController = async (req, res) => {
 
    
    const {
        name,
        description,
        type,
        startDateTime,
        endDateTime,
        venue,
        contactEmail,
        isOnline,
    } = req.body;

    const plannedBy = req.user?.id;  
 
    if (!name || !description || !type || !startDateTime || !endDateTime || !contactEmail) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: name, description, type, startDateTime, endDateTime, and contactEmail.',
        });
    }

    try { 
        const user = await userModel.findById(plannedBy);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
 
        const newEvent = new eventModel({
            name,
            description,
            type,
            startDateTime,
            endDateTime,
            venue,
            contactEmail,
            isOnline,
            plannedBy: plannedBy,  
        });
 
        await newEvent.save();  
        return res.status(201).json({
            success: true,
            message: 'Event created successfully!',
            event: newEvent,
        });
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({
            success: false,
            message: errorHandler(error), 
        });
    }
};

module.exports.getAllEventsController = async (req, res) => {
    try { 
        const events = await eventModel.find()
            .populate('plannedBy', 'name email') 
            .populate('attendees', 'name email');  
 
        if (!events || events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No events found.',
            });
        }
 
        return res.status(200).json({
            success: true,
            message: 'Events retrieved successfully!',
            events: events,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: errorHandler(error),  
        });
    }
};


module.exports.myEventsController = async (req, res) => {
    const plannedBy = req.user?.id; 
    if (!plannedBy) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required.',
        });
    }

    try { 
        const user = await userModel.findById(plannedBy);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
 
        const events = await eventModel.find({ plannedBy: plannedBy })
            .populate('plannedBy', 'name email') 
            .populate('attendees', 'name email');
 
        if (!events || events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No events found for this user.',
            });
        }
 
        return res.status(200).json({
            success: true,
            message: 'Events retrieved successfully!',
            events: events,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: errorHandler(error),  
        });
    }
};

module.exports.getEventByIdController = async (req, res) => {
    try {
        const event = await eventModel.findById(req.params.id)
            .populate('plannedBy', 'name email')
            .populate('attendees', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Event retrieved successfully!',
            event,
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        return res.status(500).json({
            success: false,
            message: errorHandler(error),
        });
    }
};

module.exports.deleteEventByIdController = async (req, res) => {
    try {
        const plannedBy = req.user?.id; // Get user ID from request

        if (!plannedBy) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required.',
            });
        }

        const event = await eventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.',
            });
        }
 
        if (event.plannedBy.toString() !== plannedBy) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete events you created.',
            });
        }

        await eventModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully!',
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({
            success: false,
            message: errorHandler(error),
        });
    }
};

module.exports.getAttendController = async (req, res) => {
    const userId = req.user?.id;  
    if (!userId) {   
        return res.status(401).json({
            success: false,
            message: 'Login to attend the event.',
        });
    }

    try {
        const event = await eventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.',
            });
        }
 
        if (event.attendees.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already attending this event.',
            });
        }
 
        event.attendees.push(userId);
        await event.save();  

        return res.status(200).json({
            success: true,
            message: 'You have successfully registered for the event!',
            event,
        });
    } catch (error) {
        console.error('Error attending event:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};


module.exports.eventsToAttendController = async (req, res) => {
    const userId = req.user?.id; 

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required.",
        });
    }

    try { 
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Fetch events where the user is listed in the attendees array
        const events = await eventModel.find({ attendees: { $in: [userId] } })
            .populate("plannedBy", "name email") 
            .populate("attendees", "name email");

        if (!events.length) {
            return res.status(404).json({
                success: false,
                message: "No events found that you are attending.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Events retrieved successfully!",
            events,
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return res.status(500).json({
            success: false,
            message: errorHandler(error),  
        });
    }
};