/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { Schedule, sequelize } from "../models/Schedule.js";
import { User } from "../models/userModel.js"; // Added User import
await sequelize.sync();

const schedulecontroller = {
  indexSchedule: async (req, res) => {
    try {
      // Fetch user data
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();

      const schedules = await Schedule.findAll();
      res.render("schedules", {
        active: "schedules",
        title: "Schedules",
        schedules,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Schedule index error:", error);
      res.render("schedules", {
        active: "schedules",
        title: "Schedules",
        error: "Failed to load schedules",
        schedules: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  eventsJson: async (req, res) => {
    try {
      const { start, end } = req.query;
      const rangeStart = start ? new Date(start) : null;
      const rangeEnd = end ? new Date(end) : null;

      const records = await Schedule.findAll();

      const dayNameToIndex = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const events = [];

      const pushEvent = (rec, dateStr) => {
        const startDateTime = `${dateStr}T${rec.start_time}`;

        let endDateTime;
        if (rec.end_time === "00:00:00") {
          endDateTime = `${dateStr}T23:59:59`;
        } else if (rec.end_time < rec.start_time) {
          const nextDay = new Date(dateStr);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split("T")[0];
          endDateTime = `${nextDayStr}T${rec.end_time}`;
        } else {
          endDateTime = `${dateStr}T${rec.end_time}`;
        }

        let title = rec.course || "Schedule";
        if (rec.program) title += ` (${rec.program})`;
        if (rec.year || rec.section) title += ` - ${rec.year || ""}${rec.section ? " " + rec.section : ""}`;
        if (rec.room_id) title += ` • Room ${rec.room_id}`;
        if (rec.faculty_name) title += ` • ${rec.faculty_name}`;

        events.push({
          id: rec.id,
          title: title,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: rec.color_code || "#4FA9E2",
          borderColor: rec.color_code || "#4FA9E2",
        });
      };

      for (const rec of records) {
        const isRecurring = !!rec.is_recurring;

        if (!isRecurring) {
          if (!rec.start_date) continue;
          const d = new Date(rec.start_date);
          if ((!rangeStart || d >= rangeStart) && (!rangeEnd || d <= rangeEnd)) {
            pushEvent(rec, rec.start_date);
          }
          continue;
        }

        if (!rec.day_of_week || !rec.start_date || !rec.last_date || !rangeStart || !rangeEnd) continue;

        const targetDow = dayNameToIndex[rec.day_of_week];
        if (targetDow === undefined) continue;

        const scheduleStart = new Date(rec.start_date);
        const scheduleEnd = new Date(rec.last_date);
        const effectiveStart = scheduleStart > rangeStart ? scheduleStart : rangeStart;
        const effectiveEnd = scheduleEnd < rangeEnd ? scheduleEnd : rangeEnd;

        if (effectiveStart >= effectiveEnd) continue;

        const cursor = new Date(scheduleStart);
        const delta = (targetDow - cursor.getUTCDay() + 7) % 7;
        cursor.setUTCDate(cursor.getUTCDate() + delta);
        if (cursor < scheduleStart) cursor.setUTCDate(cursor.getUTCDate() + 7);

        while (cursor <= scheduleEnd && cursor < effectiveEnd) {
          const y = cursor.getUTCFullYear();
          const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
          const d = String(cursor.getUTCDate()).padStart(2, "0");
          const dateStr = `${y}-${m}-${d}`;
          pushEvent(rec, dateStr);
          cursor.setUTCDate(cursor.getUTCDate() + 7);
        }
      }

      res.json(events);
    } catch (err) {
      console.error("Error building schedule events:", err);
      res.status(500).json({ error: "Failed to load events" });
    }
  },

  addSchedule: async (req, res) => {
    try {
      const schedulesData = req.body.schedules || [req.body];
      if (!Array.isArray(schedulesData)) return res.status(400).send("Invalid request format");

      const results = [];
      const errors = [];

      for (const scheduleData of schedulesData) {
        const {
          room_id,
          faculty_name,
          course,
          program,
          year,
          section,
          unit,
          start_date,
          last_date,
          day_of_week,
          start_time,
          end_time,
          is_recurring,
          color_code,
        } = scheduleData;

        const isRecurring = is_recurring === "1" || is_recurring === true;

        const checkTimeConflict = async (roomId, date, startTime, endTime, excludeId = null) => {
          const existingSchedules = await Schedule.findAll({
            where: { room_id: Number.parseInt(roomId), start_date: date, day_of_week },
          });

          for (const schedule of existingSchedules) {
            if (excludeId && schedule.id === excludeId) continue;

            const existingStartTime =
              schedule.start_time.length === 5 ? schedule.start_time + ":00" : schedule.start_time;
            let existingEndTime = schedule.end_time.length === 5 ? schedule.end_time + ":00" : schedule.end_time;

            const newStart = startTime.length === 5 ? startTime + ":00" : startTime;
            let newEnd = endTime.length === 5 ? endTime + ":00" : endTime;

            if (existingEndTime === "00:00:00") existingEndTime = "23:59:59";
            if (newEnd === "00:00:00") newEnd = "23:59:59";

            if (
              (newStart >= existingStartTime && newStart < existingEndTime) ||
              (newEnd > existingStartTime && newEnd <= existingEndTime) ||
              (newStart <= existingStartTime && newEnd >= existingEndTime)
            ) {
              return {
                conflict: true,
                message: `❌ Room already scheduled from ${schedule.start_time} to ${schedule.end_time} on ${date}. Cannot schedule ${startTime} to ${endTime}.`,
              };
            }
          }
          return { conflict: false };
        };

        try {
          const conflictCheck = await checkTimeConflict(room_id, start_date, start_time, end_time);
          if (conflictCheck.conflict) {
            errors.push(conflictCheck.message);
            continue;
          }

          const newSchedule = await Schedule.create({
            room_id: Number.parseInt(room_id),
            faculty_name,
            course,
            program,
            year,
            section,
            unit,
            start_date,
            last_date,
            day_of_week,
            start_time,
            end_time,
            is_recurring: isRecurring,
            color_code: color_code || "#4FA9E2",
          });

          results.push(newSchedule);
        } catch (error) {
          console.error("Error creating schedule:", error);
          errors.push(`❌ Error creating schedule: ${error.message}`);
        }
      }

      if (results.length === 0) return res.status(400).send(`❌ No schedules created. Errors: ${errors.join(", ")}`);
      else if (errors.length > 0)
        return res.send(`✅ ${results.length} schedules created successfully! Warnings: ${errors.join(", ")}`);
      else return res.send(`✅ ${results.length} schedules created successfully!`);
    } catch (error) {
      console.error("Error adding schedule:", error);
      res.status(500).send("Error adding schedule");
    }
  },

  deleteSchedule: async (req, res) => {
    const { id } = req.body;
    await Schedule.destroy({ where: { id } });
    res.send("🗑️ Schedule deleted!");
  },

  addNewSchedule: async (req, res) => {
    try {
      // Fetch user data
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();

      res.render("add-new-schedule", {
        active: "schedules",
        title: "Add New Schedule",
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error rendering add schedule:", error);
      res.render("add-new-schedule", {
        active: "schedules",
        title: "Add New Schedule",
        error: "Failed to load add schedule form",
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  getSchedulesData: async (req, res) => {
    try {
      const schedules = await Schedule.findAll({ order: [["createdAt", "DESC"]] });
      const rooms = await sequelize.models.rooms.findAll();
      const roomMap = {};
      const roomTypeMap = {};
      rooms.forEach((room) => {
        roomMap[room.id] = room.name;
        roomTypeMap[room.id] = room.type;
      });

      const formattedData = schedules.map((schedule) => {
        const s = schedule.get({ plain: true });
        return {
          id: s.id,
          room_id: s.room_id,
          room_name: roomMap[s.room_id] || `Room ${s.room_id}`,
          room_type: roomTypeMap[s.room_id] || "Unknown",
          course: s.course || "",
          program: s.program || "",
          year: s.year || "",
          section: s.section || "",
          unit: s.unit || 0,
          faculty_name: s.faculty_name || "",
          start_date: s.start_date || "",
          last_date: s.last_date || "",
          day_of_week: s.day_of_week || "",
          start_time: s.start_time || "",
          end_time: s.end_time || "",
          is_recurring: s.is_recurring || false,
          color_code: s.color_code || "#10B981",
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        };
      });

      res.json({ data: formattedData, recordsTotal: formattedData.length, recordsFiltered: formattedData.length });
    } catch (error) {
      console.error("Error fetching schedules data:", error);
      res.status(500).json({ error: "Failed to load schedules data", details: error.message });
    }
  },

  editSchedule: async (req, res) => {
    try {
      // Fetch user data
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();

      const { id } = req.params;
      const schedule = await Schedule.findByPk(id);
      if (!schedule) return res.status(404).send("Schedule not found");

      res.render("edit-schedule", {
        active: "schedules",
        title: "Edit Schedule",
        schedule,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.render("edit-schedule", {
        active: "schedules",
        title: "Edit Schedule",
        error: "Failed to load schedule data",
        schedule: null,
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  getSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findByPk(id);
      if (!schedule) return res.status(404).json({ error: "Schedule not found" });
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        room_id,
        faculty_name,
        course,
        program,
        year,
        section,
        unit,
        start_date,
        last_date,
        day_of_week,
        start_time,
        end_time,
        is_recurring,
        color_code,
      } = req.body;

      const [updated] = await Schedule.update(
        {
          room_id,
          faculty_name,
          course,
          program,
          year,
          section,
          unit,
          start_date,
          last_date,
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

  generateWeeklyCalendarCSV: (schedules, roomMap, title) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const timeSlots = [];
    for (let hour = 7; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break;
        timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      }
    }

    const calendar = {};
    days.forEach((day) => {
      calendar[day] = {};
      timeSlots.forEach((time) => {
        calendar[day][time] = { text: "", color: "", course: "", rowspan: 1, skip: false };
      });
    });

    console.log("[v0] ========================================");
    console.log("[v0] DEBUGGING ALL SCHEDULES:");
    schedules.forEach((schedule, index) => {
      console.log(`[v0] Schedule ${index + 1}:`);
      console.log(`[v0]   Course: ${schedule.course}`);
      console.log(`[v0]   Day: ${schedule.day_of_week}`);
      console.log(`[v0]   Start Time (RAW from DB): "${schedule.start_time}"`);
      console.log(`[v0]   End Time (RAW from DB): "${schedule.end_time}"`);
      console.log(`[v0]   Faculty: ${schedule.faculty_name}`);
    });
    console.log("[v0] ========================================");

    schedules.forEach((schedule) => {
      const day = schedule.day_of_week;
      const startTime = schedule.start_time.substring(0, 5);
      const endTime = schedule.end_time.substring(0, 5);
      const roomName = roomMap[schedule.room_id] || `Room ${schedule.room_id}`;
      const course = schedule.course || "";
      const color = schedule.color_code || "#4FA9E2";

      console.log("[v0] ----------------------------------------");
      console.log("[v0] Processing:", course);
      console.log("[v0] Start Time:", startTime, "| End Time:", endTime);

      if (calendar[day] && calendar[day][startTime] !== undefined) {
        const startIndex = timeSlots.indexOf(startTime);

        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const durationMinutes = endMinutes - startMinutes;
        const slotsToSpan = Math.max(1, Math.ceil(durationMinutes / 30));

        console.log(`[v0] Duration: ${durationMinutes} min = ${slotsToSpan} slots`);
        console.log(`[v0] Will span from ${startTime} covering ${slotsToSpan} slots`);

        let displayText = "";
        if (course) displayText += course + "<br>";
        if (roomName) displayText += roomName + "<br>";
        if (schedule.faculty_name) displayText += schedule.faculty_name;

        calendar[day][startTime] = {
          text: displayText,
          color: color,
          course: course,
          rowspan: slotsToSpan,
          skip: false,
        };

        for (let i = 1; i < slotsToSpan; i++) {
          const nextSlotIndex = startIndex + i;
          if (nextSlotIndex < timeSlots.length) {
            const nextSlot = timeSlots[nextSlotIndex];
            console.log(`[v0]   Marking ${nextSlot} as skip`);
            calendar[day][nextSlot].skip = true;
          }
        }
      }
    });

    // Set a fixed row height (30px) so rowspan calculations match the number
    // of 30-minute slots. This ensures td rowspans produce cells tall enough
    // for their inner div backgrounds to fill the full area when exported
    // to Excel/HTML. Adjust the 30px value if you use a different visual row height.
    let htmlContent = `<html><head><meta charset="UTF-8"><style>
      table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
      tr { height: 30px; }
      th, td { vertical-align: top; }
      .time-cell { background-color: #f0f0f0; font-weight: bold; padding:8px; }
    </style></head><body>`;
    htmlContent += `<h3>${title || "Weekly Calendar"}</h3>`;
    htmlContent += `<table>`;
    htmlContent += `<tr><th class="time-cell" style="border: 1px solid #000; padding: 8px;">Time</th>${days
      .map((day) => `<th style="border: 1px solid #000; padding: 8px;">${day}</th>`)
      .join("")}</tr>`;

    timeSlots.forEach((time) => {
      htmlContent += `<tr>`;
      htmlContent += `<td class="time-cell" style="border: 1px solid #000; padding: 8px;">${time}</td>`;
      days.forEach((day) => {
        const cell = calendar[day][time];
        if (!cell.skip) {
          const bg = cell.color || "#fff";
          const rowspanAttr = cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : "";

          if (cell.rowspan > 1) {
            console.log(`[v0] HTML: Adding cell at ${day} ${time} with rowspan=${cell.rowspan}, color=${bg}`);
          }

          // Use an inner full-height div for the cell content so the background
          // fills the entire rowspan area even when the content contains <br>
          // Add td-level bgcolor and background-color style as a fallback
          // for spreadsheet viewers that may ignore inner div styles.
          // Compute explicit inner div height (rowspan * 30px) so the colored
          // box exactly matches the visual span when opened in Excel/HTML viewers.
          const divHeight = (cell.rowspan || 1) * 30;
          // Use valign="middle" for Excel compatibility and center text both
          // vertically and horizontally. Increase font-size and allow wrapping.
          htmlContent += `<td${rowspanAttr} bgcolor="${bg}" valign="middle" style="border: 1px solid #000; padding: 0; vertical-align: middle; background-color: ${bg} !important;"><div style="padding:8px; height:${divHeight}px; display:block; width:100%; box-sizing:border-box; background-color: ${bg} !important; font-family: Arial, sans-serif; font-size:15px; font-weight:600; text-align:center; line-height:1.15; word-break:break-word; white-space:normal;">${cell.text}</div></td>`;
        } else {
          console.log(`[v0] HTML: Skipping ${day} ${time} (part of rowspan)`);
        }
      });
      htmlContent += `</tr>`;
    });

    htmlContent += `</table></body></html>`;
    return htmlContent;
  },

  generateMultipleSectionCalendars: (groupedSchedules, roomMap, programName) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const timeSlots = [];
    for (let hour = 7; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break;
        timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      }
    }

    // Use a fixed row height matching the 30-minute slot granularity so
    // rowspan cells expand correctly in Excel/HTML viewers.
    let htmlContent = `<html><head><meta charset="UTF-8"><style>
      body { font-family: Arial, sans-serif; }
      tr { height: 30px; }
      .section-container { display: inline-block; vertical-align: top; margin: 20px; }
      table { border-collapse: collapse; font-family: Arial, sans-serif; margin-bottom: 20px; }
      th, td { vertical-align: top; }
      .time-cell { background-color: #333; color: white; font-weight: bold; padding:8px; }
      .day-header { background-color: #333; color: white; font-weight: bold; }
      .section-title { background-color: #FF1493; color: white; font-weight: bold; font-size: 14px; padding: 10px; text-align: center; }
  .legend-table { width: 100%; margin-top: 10px; }
  .legend-header { background-color: #800080; color: white; font-weight: bold; font-size:15px; }
  .legend-cell { text-align: left; padding: 5px; font-size: 15px; }
    </style></head><body>`;

    const sortedSections = Object.keys(groupedSchedules).sort((a, b) => {
      const [yearA, sectionA] = a.split("-");
      const [yearB, sectionB] = b.split("-");
      if (yearA !== yearB) return yearA - yearB;
      return sectionA.localeCompare(sectionB);
    });

    sortedSections.forEach((sectionKey) => {
      const schedules = groupedSchedules[sectionKey];
      const [year, section] = sectionKey.split("-");

      htmlContent += `<div class="section-container">`;
      htmlContent += `<div class="section-title">${programName} ${year}-${section}</div>`;

      const calendar = {};
      const courseInfo = {};

      days.forEach((day) => {
        calendar[day] = {};
        timeSlots.forEach((time) => {
          calendar[day][time] = { text: "", color: "", course: "", rowspan: 1, skip: false };
        });
      });

      console.log(`[v0] ======== SECTION: ${sectionKey} ========`);
      schedules.forEach((schedule, index) => {
        console.log(`[v0] Schedule ${index + 1}:`);
        console.log(`[v0]   Course: ${schedule.course}`);
        console.log(`[v0]   Day: ${schedule.day_of_week}`);
        console.log(`[v0]   Start Time (RAW): "${schedule.start_time}"`);
        console.log(`[v0]   End Time (RAW): "${schedule.end_time}"`);
      });

      schedules.forEach((schedule) => {
        const day = schedule.day_of_week;
        const startTime = schedule.start_time.substring(0, 5);
        const endTime = schedule.end_time.substring(0, 5);
        const roomName = roomMap[schedule.room_id] || `Room ${schedule.room_id}`;
        const course = schedule.course || "";
        const color = schedule.color_code || "#4FA9E2";

        console.log(`[v0] Processing: ${course} | ${startTime} to ${endTime}`);

        if (course && !courseInfo[course]) {
          courseInfo[course] = {
            description: schedule.course || "",
            units: schedule.unit || "",
            instructor: schedule.faculty_name || "",
            color: color,
          };
        }

        if (calendar[day] && calendar[day][startTime] !== undefined) {
          const startIndex = timeSlots.indexOf(startTime);

          const [startHour, startMin] = startTime.split(":").map(Number);
          const [endHour, endMin] = endTime.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          const durationMinutes = endMinutes - startMinutes;
          const slotsToSpan = Math.max(1, Math.ceil(durationMinutes / 30));

          console.log(`[v0] Duration: ${durationMinutes} min = ${slotsToSpan} slots`);

          let displayText = "";
          if (course) displayText += course ;
          if (roomName) displayText += roomName;
          if (schedule.faculty_name) displayText += schedule.faculty_name;

          calendar[day][startTime] = {
            text: displayText,
            color: color,
            course: course,
            rowspan: slotsToSpan,
            skip: false,
          };

          for (let i = 1; i < slotsToSpan; i++) {
            const nextSlotIndex = startIndex + i;
            if (nextSlotIndex < timeSlots.length) {
              const nextSlot = timeSlots[nextSlotIndex];
              console.log(`[v0]   Marking ${nextSlot} as skip`);
              calendar[day][nextSlot].skip = true;
            }
          }
        }
      });

      const totalColumns = days.length + 1;
      htmlContent += `<table>`;
      htmlContent += `<tr><th colspan="${totalColumns}" class="section-title" style="border: 1px solid #000; padding: 10px;">${programName} ${year}-${section}</th></tr>`;
      htmlContent += `<tr><th class="time-cell" style="border: 1px solid #000; padding: 8px;">TIME</th>${days
        .map((day) => `<th class="day-header" style="border: 1px solid #000; padding: 8px;">${day.toUpperCase()}</th>`)
        .join("")}</tr>`;

      timeSlots.forEach((time) => {
        htmlContent += `<tr>`;
        htmlContent += `<td class="time-cell" style="border: 1px solid #000; padding: 8px;">${time}</td>`;
        days.forEach((day) => {
          const cell = calendar[day][time];
          if (!cell.skip) {
            const bg = cell.color || "#fff";
            const rowspanAttr = cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : "";
            // Wrap content in a full-height div and remove td padding so the
            // background color fills the entire rowspan area without gaps.
            // Add td-level bgcolor and background-color style as a fallback
            // for spreadsheet viewers that may ignore inner div styles.
            const divHeight = (cell.rowspan || 1) * 30;
            htmlContent += `<td${rowspanAttr} bgcolor="${bg}" valign="middle" style="border: 1px solid #000; padding: 0; vertical-align: middle; background-color: ${bg} !important;"><div style="padding:8px; height:${divHeight}px; display:block; width:100%; box-sizing:border-box; background-color: ${bg} !important; font-family: Arial, sans-serif; font-size:15px; font-weight:600; text-align:center; line-height:1.15; word-break:break-word; white-space:normal;">${cell.text}</div></td>`;
          } else {
            console.log(`[v0] HTML: Skipping ${day} ${time} (part of rowspan)`);
          }
        });
        htmlContent += `</tr>`;
      });
      htmlContent += `</table>`;

      htmlContent += `<table class="legend-table">`;
      htmlContent += `<tr><th class="legend-header" style="border: 1px solid #000; padding: 5px;">COURSE CODE</th><th class="legend-header" style="border: 1px solid #000; padding: 5px;">COURSE DESCRIPTION</th><th class="legend-header" style="border: 1px solid #000; padding: 5px;">UNITS</th><th class="legend-header" style="border: 1px solid #000; padding: 5px;">INSTRUCTOR</th></tr>`;

      Object.keys(courseInfo).forEach((courseCode) => {
        const info = courseInfo[courseCode];
        htmlContent += `<tr>`;
        htmlContent += `<td class="legend-cell" style="border: 1px solid #000; padding: 5px; background-color: ${info.color} !important;">${courseCode}</td>`;
        htmlContent += `<td class="legend-cell" style="border: 1px solid #000; padding: 5px;">${info.description}</td>`;
        htmlContent += `<td class="legend-cell" style="border: 1px solid #000; padding: 5px;">${info.units}</td>`;
        htmlContent += `<td class="legend-cell" style="border: 1px solid #000; padding: 5px;">${info.instructor}</td>`;
        htmlContent += `</tr>`;
      });

      htmlContent += `</table>`;
      htmlContent += `</div>`;
    });

    htmlContent += `</body></html>`;
    return htmlContent;
  },

  exportProgramSchedules: async (req, res) => {
    try {
      const { program } = req.query;

      if (!program) {
        return res.status(400).json({ error: "Program parameter is required" });
      }

      const schedules = await Schedule.findAll({
        where: { program: program },
        order: [
          ["year", "ASC"],
          ["section", "ASC"],
          ["day_of_week", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      if (schedules.length === 0) {
        return res.status(404).json({ error: "No schedules found for this program" });
      }

      const rooms = await sequelize.models.rooms.findAll();
      const roomMap = {};
      rooms.forEach((room) => {
        roomMap[room.id] = room.name;
      });

      console.log("[v0] Room map:", roomMap);
      console.log("[v0] Sample schedule room_id:", schedules[0]?.room_id);

      const groupedSchedules = {};
      schedules.forEach((schedule) => {
        if (schedule.year && schedule.section) {
          const sectionKey = `${schedule.year}-${schedule.section}`;
          if (!groupedSchedules[sectionKey]) {
            groupedSchedules[sectionKey] = [];
          }
          groupedSchedules[sectionKey].push(schedule);
        }
      });

      const htmlContent = schedulecontroller.generateMultipleSectionCalendars(groupedSchedules, roomMap, program);

      const filename = `${program}_All_Sections_Schedule.xls`;

      res.setHeader("Content-Type", "application/vnd.ms-excel");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(htmlContent);
    } catch (error) {
      console.error("Error exporting program schedules:", error);
      res.status(500).json({ error: "Failed to export schedules" });
    }
  },

  exportProfessorSchedules: async (req, res) => {
    try {
      const { professor } = req.query;

      if (!professor) {
        return res.status(400).json({ error: "Professor parameter is required" });
      }

      const schedules = await Schedule.findAll({
        where: { faculty_name: professor },
        order: [
          ["day_of_week", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      const rooms = await sequelize.models.rooms.findAll();
      const roomMap = {};
      rooms.forEach((room) => {
        roomMap[room.id] = room.name;
      });

      const csvContent = schedulecontroller.generateWeeklyCalendarCSV(schedules, roomMap, `Professor: ${professor}`);

      res.setHeader("Content-Type", "application/vnd.ms-excel");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${professor.replace(/\s+/g, "_")}_weekly_schedule.xls"`,
      );
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting professor schedules:", error);
      res.status(500).json({ error: "Failed to export schedules" });
    }
  },
};

export { schedulecontroller };