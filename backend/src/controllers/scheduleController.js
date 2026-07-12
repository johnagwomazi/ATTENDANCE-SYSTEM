import { asyncHandler } from '../utils/asyncHandler.js';
import { createNewSchedule, getAllSchedules, getSchedule, removeSchedule, updateSchedule } from '../services/scheduleService.js';

export const create = asyncHandler(async (req, res) => {
  const schedule = await createNewSchedule(req.body);
  return res.status(201).json({
    success: true,
    message: 'Schedule created successfully.',
    data: { schedule }
  });
});

export const list = asyncHandler(async (_req, res) => {
  const schedules = await getAllSchedules();
  return res.status(200).json({
    success: true,
    message: 'Schedules retrieved successfully.',
    data: { schedules }
  });
});

export const read = asyncHandler(async (req, res) => {
  const schedule = await getSchedule(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Schedule retrieved successfully.',
    data: { schedule }
  });
});

export const update = asyncHandler(async (req, res) => {
  const schedule = await updateSchedule(req.params.id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Schedule updated successfully.',
    data: { schedule }
  });
});

export const remove = asyncHandler(async (req, res) => {
  await removeSchedule(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Schedule deleted successfully.'
  });
});
