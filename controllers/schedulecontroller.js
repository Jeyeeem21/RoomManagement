/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
import { Schedule, sequelize } from "../models/Schedule.js";
await sequelize.sync();

const schedulecontroller = {
  indexSchedule: async (req, res) => {
    const schedules = await Schedule.findAll();
    res.render("schedules", { schedules });
  },

  addSchedule: async (req, res) => {
    const {
      room_id,
      subject,
      faculty_name,
      course,
      date,
      day_of_week,
      start_time,
      end_time,
      is_recurring,
      color_code,
    } = req.body;

    await Schedule.create({
      room_id,
      subject,
      faculty_name,
      course,
      date,
      day_of_week,
      start_time,
      end_time,
      is_recurring,
      color_code,
    });

    res.send("✅ Schedule added successfully!");
  },

  deleteSchedule: async (req, res) => {
    const { id } = req.body;
    await Schedule.destroy({ where: { id } });
    res.send("🗑️ Schedule deleted!");
  },

  addNewSchedule: (req, res) => {
    res.render("add-new-schedule");
  },

  editSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findByPk(id);
      if (!schedule) return res.status(404).send("Schedule not found");
      res.render("edit-schedule", { schedule });
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        room_id,
        subject,
        faculty_name,
        course,
        date,
        day_of_week,
        start_time,
        end_time,
        is_recurring,
        color_code,
      } = req.body;

      const [updated] = await Schedule.update(
        {
          room_id,
          subject,
          faculty_name,
          course,
          date,
          day_of_week,
          start_time,
          end_time,
          is_recurring,
          color_code,
        },
        { where: { id } }
      );

      if (updated) res.send("✅ Schedule updated successfully");
      else res.status(404).send("❌ Schedule not found or no changes made");
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

export { schedulecontroller };
