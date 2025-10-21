/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { College } from "../models/College.js"; // Adjusted import to include User
import { Building } from "../models/Building.js";
import { Room } from "../models/Room.js";
import { Schedule } from "../models/Schedule.js";
import { sequelize } from "../models/db.js";
import { User } from "../models/userModel.js";
import "../models/assiociation.js";

// Dashboard controller with real data
export const dashboardPage = async (req, res) => {
  try {
    // Fetch user data
    const user = await User.findByPk(req.session.userId, {
      attributes: ['name', 'role']
    });
    if (!user) {
      req.session.destroy();
      return res.redirect("/login");
    }
    const initials = user.name.charAt(0).toUpperCase(); // First letter of name

    await sequelize.authenticate();
    console.log("Database connected");

    const totalColleges = await College.count();
    console.log("Total colleges:", totalColleges);

    const totalBuildings = await Building.count();
    console.log("Total buildings:", totalBuildings);

    const totalRooms = await Room.count();
    console.log("Total rooms:", totalRooms);

    const totalSchedules = await Schedule.count();
    console.log("Total schedules:", totalSchedules);

    const capacityResult = await Room.findAll({
      attributes: [[sequelize.fn("SUM", sequelize.col("capacity")), "takenCapacity"]],
      raw: true,
    });
    const totalCapacity = parseInt(capacityResult[0]?.takenCapacity) || 0;
    console.log("Total capacity:", totalCapacity);

    const roomsByBuilding = await Building.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.fn("COALESCE", sequelize.fn("COUNT", sequelize.col("rooms.id")), 0), "roomCount"],
      ],
      include: [{ model: Room, attributes: [], required: false }],
      group: ["id", "name"],
      raw: true,
    });
    console.log("Rooms by building:", roomsByBuilding);

    const roomsWithSchedules = await Room.findAll({
      attributes: ["id", "capacity"],
      include: [{ model: Schedule, attributes: [], required: true }],
      raw: true,
    });
    console.log("Rooms with schedules:", roomsWithSchedules);
    const usedCapacity = roomsWithSchedules.reduce((sum, room) => sum + (parseInt(room.capacity) || 0), 0);
    const availableCapacity = totalCapacity - usedCapacity;
    console.log("Used capacity:", usedCapacity, "Available capacity:", availableCapacity);

    const recentColleges = await College.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "dean", "createdAt"],
    });
    console.log("Recent colleges:", recentColleges.map(c => c.get({ plain: true })));

    const recentBuildings = await Building.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: College, attributes: ["name"], required: false }],
      attributes: ["id", "name", "location", "createdAt"],
    });
    console.log("Recent buildings:", recentBuildings.map(b => b.get({ plain: true })));

    const today = new Date();
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
    const todaySchedules = await Schedule.count({
      where: { day_of_week: dayOfWeek },
    });
    console.log("Today's schedules:", todaySchedules);

    const chartData = {
      roomsByBuilding: roomsByBuilding.map(building => ({
        name: (building.name || "Unknown").replace(/['"]/g, ""),
        rooms: parseInt(building.roomCount) || 0,
      })),
      capacityUsed: usedCapacity,
      capacityAvailable: availableCapacity,
    };
    console.log("Chart data:", chartData);
    console.log("Stringified chartData:", JSON.stringify(chartData));

    res.render("dashboard", {
      active: "dashboard",
      title: "Dashboard",
      stats: {
        totalColleges,
        totalBuildings,
        totalRooms,
        totalSchedules,
        totalCapacity,
        todaySchedules,
      },
      recentColleges,
      recentBuildings,
      chartData: JSON.stringify(chartData),
      user: { name: user.name, role: user.role, initials }
    });
  } catch (error) {
    console.error("Dashboard error:", error.message, error.stack);
    res.render("dashboard", {
      active: "dashboard",
      title: "Dashboard",
      error: `Failed to load dashboard data: ${error.message}`,
      stats: {
        totalColleges: 0,
        totalBuildings: 0,
        totalRooms: 0,
        totalSchedules: 0,
        totalCapacity: 0,
        todaySchedules: 0,
      },
      recentColleges: [],
      recentBuildings: [],
      chartData: JSON.stringify({
        roomsByBuilding: [],
        capacityUsed: 0,
        capacityAvailable: 0,
      }),
      user: { name: "Guest", role: "Unknown", initials: "G" } // Fallback for error case
    });
  }
};