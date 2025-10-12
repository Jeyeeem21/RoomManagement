/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/
//models/Schedule.js
import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Schedule = sequelize.define("schedules", {
  room_id: { type: DataTypes.INTEGER, allowNull: false },
  faculty_name: { type: DataTypes.STRING, allowNull: false },
  course: { type: DataTypes.STRING, allowNull: true },
  program: { type: DataTypes.STRING, allowNull: true },
  // Split year and section
  year: { type: DataTypes.STRING, allowNull: true },
  section: { type: DataTypes.STRING, allowNull: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: true },
  last_date: { type: DataTypes.DATEONLY, allowNull: true },
  day_of_week: {
    type: DataTypes.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
    allowNull: true,
  },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },

  // Unit as integer
  unit: { type: DataTypes.INTEGER, allowNull: true },

  is_recurring: { type: DataTypes.BOOLEAN, defaultValue: false },
  color_code: { type: DataTypes.STRING, defaultValue: "#4FA9E2" },
});

export { sequelize };
