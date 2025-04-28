// addTimeline.js

/**
 * Adds an event to the timeline.
 * 
 * This function records an event in the `TimelineEventos` model. It logs details such as the user who triggered the event, the type of event, a description of the event, an optional task ID, and the current date and time when the event occurred.
 * 
 * @param {number} user_id - The ID of the user performing the event.
 * @param {string} typeEvent - The type of the event (e.g., "task created", "task updated").
 * @param {string} descripcion - A description of the event that provides more details.
 * @param {number|null} [task_id=null] - An optional task ID associated with the event. If no task ID is provided, it defaults to null.
 * 
 * @throws {Error} - If any required parameter is missing or if an error occurs when recording the event, an error message is logged to the console.
 * 
 * @example
 * // Example usage of the addTimeline function:
 * addTimeline(1, 'task created', 'A new task was created with the title "Develop new feature"', 101);
 * 
 * This will add an event to the timeline with the provided user ID, event type, description, and task ID.
 */

const TimelineEventos = require("../models/timelineEventos");

async function addTimeline(user_id, typeEvent, descripcion, task_id) {
  try {
    if (!user_id || !typeEvent || !descripcion ) {
      console.error("Faltan datos para registrar el evento");
      return;
    }

    await TimelineEventos.create({
      user_id,
      typeEvent,
      descripcion,
      task_id: task_id || null,
      date: new Date(), 
    });

  } catch (err) {
    console.error("Error al registrar en la línea de tiempo:", err.message || err);
  }
}

module.exports = { addTimeline };
