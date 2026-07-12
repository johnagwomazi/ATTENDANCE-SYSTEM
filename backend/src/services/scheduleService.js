import { ApiError } from '../utils/apiError.js';
import { createId } from '../utils/uuid.js';
import { query } from '../config/db.js';
import { findCourseById } from '../models/courseModel.js';
import {
  createSchedule,
  deleteScheduleById,
  findScheduleById,
  listSchedules
} from '../models/scheduleModel.js';

export const createNewSchedule = async ({ courseId, dayOfWeek, startTime, endTime }) => {
  const course = await findCourseById(courseId);
  if (!course) {
    throw new ApiError(400, 'Course not found.');
  }

  return createSchedule({
    id: createId(),
    courseId,
    dayOfWeek,
    startTime,
    endTime
  });
};

export const updateSchedule = async (scheduleId, updates) => {
  const existing = await findScheduleById(scheduleId);
  if (!existing) {
    throw new ApiError(404, 'Schedule not found.');
  }

  const nextCourseId = updates.courseId ?? existing.course_id;
  if (updates.courseId) {
    const course = await findCourseById(nextCourseId);
    if (!course) {
      throw new ApiError(400, 'Course not found.');
    }
  }

  await query(
    `UPDATE schedules
     SET course_id = ?, day_of_week = ?, start_time = ?, end_time = ?
     WHERE id = ?`,
    [
      nextCourseId,
      updates.dayOfWeek ?? existing.day_of_week,
      updates.startTime ?? existing.start_time,
      updates.endTime ?? existing.end_time,
      scheduleId
    ]
  );

  return findScheduleById(scheduleId);
};

export const removeSchedule = async (scheduleId) => {
  const removed = await deleteScheduleById(scheduleId);
  if (!removed) {
    throw new ApiError(404, 'Schedule not found.');
  }
};

export const getSchedule = async (scheduleId) => {
  const schedule = await findScheduleById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, 'Schedule not found.');
  }
  return schedule;
};

export const getAllSchedules = async () => listSchedules();
