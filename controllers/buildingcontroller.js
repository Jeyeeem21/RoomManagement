/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { Building } from "../models/Building.js";
import { College } from "../models/College.js";
import { Room } from "../models/Room.js";
import { Schedule } from "../models/Schedule.js";
import { User } from "../models/userModel.js"; // Fixed import for User
import { sequelize } from "../models/db.js";
import { Op } from "sequelize";
import "../models/assiociation.js";

const buildingcontroller = {
  indexBuilding: async (req, res) => {
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

      // Fetch building and college data
      const buildings = await Building.findAll();
      const colleges = await College.findAll();

      const collegeIdToName = Object.fromEntries(colleges.map(c => [c.id, c.name]));
      const roomAgg = await Room.findAll({
        attributes: ["building_id", [sequelize.fn("COUNT", sequelize.col("id")), "rooms"]],
        group: ["building_id"],
        raw: true,
      });
      const buildingIdToRooms = Object.fromEntries(roomAgg.map(r => [r.building_id, Number(r.rooms) || 0]));

      const buildingsView = buildings.map(b => {
        const plain = b.get({ plain: true });
        return {
          ...plain,
          college: collegeIdToName[plain.college_id] || "Unknown",
          // Use the totalrooms value from the DB (explicit total rooms for the building)
          totalrooms: plain.totalrooms ?? 0,
          // Provide current_rooms as the actual counted number of Room records
          current_rooms: buildingIdToRooms[plain.id] || 0,
        };
      });

      res.render("buildings", {
        active: "buildings",
        title: "Buildings",
        buildings: buildingsView,
        colleges,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Building index error:", error);
      res.render("buildings", {
        active: "buildings",
        title: "Buildings",
        error: "Failed to load buildings",
        buildings: [],
        colleges: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

 addBuilding: async (req, res) => {
  try {
    const { college_id, name, location, description, floors, totalrooms, built_year, status } = req.body;
    const newBuilding = await Building.create({
      college_id,
      name,
      location,
      description,
      totalrooms,
      floors,
      built_year,
      status
    });

    // Get updated buildings list for the same college
    const updatedBuildings = await Building.findAll({
      where: { college_id },
      raw: true
    });

    res.status(200).json({
      message: "✅ Building data saved!",
      buildings: updatedBuildings
    });
  } catch (error) {
    console.error("Error adding building:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
},


  deleteBuilding: async (req, res) => {
    try {
      const { id } = req.body;
      await Building.destroy({ where: { id } });
      res.send("🗑️ Building deleted!");
    } catch (error) {
      console.error("Error deleting building:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  addNewBuilding: async (req, res) => {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();
      const colleges = await College.findAll();
      res.render("add-new-building", {
        title: "Add New Building",
        active: "buildings",
        colleges,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error rendering add building:", error);
      res.render("add-new-building", {
        title: "Add New Building",
        active: "buildings",
        error: "Failed to load add building form",
        colleges: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  editBuilding: async (req, res) => {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();
      const { id } = req.params;
      const building = await Building.findByPk(id);
      const colleges = await College.findAll();
      if (!building) return res.status(404).send("Building not found");
      res.render("edit-building", {
        title: "Edit Building",
        active: "buildings",
        building,
        colleges,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error fetching building:", error);
      res.render("edit-building", {
        title: "Edit Building",
        active: "buildings",
        error: "Failed to load building data",
        building: null,
        colleges: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  getBuilding: async (req, res) => {
    try {
      const { id } = req.params;
      const building = await Building.findByPk(id);
      if (!building) return res.status(404).json({ error: "Not found" });
      res.json(building);
    } catch (error) {
      console.error("Error fetching building:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  viewBuilding: async (req, res) => {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();
      const { id } = req.params;
      const building = await Building.findByPk(id, { raw: true });
      if (!building) return res.status(404).send("Building not found");

      const college = await College.findByPk(building.college_id, { raw: true });
      const rooms = await Room.findAll({ where: { building_id: id }, raw: true });

      const roomStats = await Room.findAll({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "rooms"],
          [sequelize.fn("SUM", sequelize.col("capacity")), "capacity"],
        ],
        where: { building_id: id },
        raw: true,
      }).catch(err => {
        console.error("Room stats query error:", err);
        return [{ rooms: 0, capacity: 0 }];
      });
      const stats = roomStats?.[0] || { rooms: 0, capacity: 0 };

      const now = new Date();
      const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long', timeZone: 'America/Los_Angeles' });
      const currentTime = now.toTimeString().slice(0, 8);

      let occupiedRooms = 0;
      let allRoomsHaveSchedules = true;
      let roomsWithSchedules = 0;
      const roomIds = rooms.map(r => r.id);

      if (roomIds.length > 0) {
        const allSchedules = await Schedule.findAll({
          where: {
            room_id: { [Op.in]: roomIds },
            is_recurring: 1,
            start_date: { [Op.lte]: now },
            last_date: { [Op.gte]: now },
          },
          raw: true,
        });
        roomsWithSchedules = [...new Set(allSchedules.map(s => s.room_id))].length;
        allRoomsHaveSchedules = roomIds.every(roomId => new Set(allSchedules.map(s => s.room_id)).has(roomId));

        const activeSchedules = await Schedule.findAll({
          where: {
            room_id: { [Op.in]: roomIds },
            day_of_week: dayOfWeek,
            [Op.or]: [
              { start_time: { [Op.lte]: currentTime }, end_time: { [Op.gte]: currentTime } },
              { is_recurring: 1, start_date: { [Op.lte]: now }, last_date: { [Op.gte]: now } },
            ],
          },
          raw: true,
        });
        occupiedRooms = [...new Set(activeSchedules.map(s => s.room_id))].length;
      } else {
        allRoomsHaveSchedules = false;
        roomsWithSchedules = 0;
      }

      const totalRooms = building.totalrooms || stats.rooms || 0;
      const maintenanceRooms = 0;
      const availableRooms = Math.max(0, totalRooms - occupiedRooms - maintenanceRooms);
      const utilRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
      const remainingRoomsWithoutSchedules = Math.max(0, totalRooms - roomsWithSchedules);

      res.render("building", {
        active: "buildings",
        title: "Building Details",
        building: {
          ...building,
          college_name: college?.name || "Unknown",
          rooms: Number(stats.rooms) || 0,
          capacity: Number(stats.capacity) || 0,
          available_rooms: availableRooms,
          occupied_rooms: occupiedRooms,
          maintenance_rooms: maintenanceRooms,
          util_rate: utilRate,
          all_rooms_have_schedules: allRoomsHaveSchedules,
          rooms_with_schedules: roomsWithSchedules,
          remaining_rooms_without_schedules: remainingRoomsWithoutSchedules,
        },
        rooms,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error viewing building:", error);
      res.render("building", {
        active: "buildings",
        title: "Building Details",
        error: "Failed to load building details: " + error.message,
        building: null,
        rooms: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  updateBuilding: async (req, res) => {
    try {
      const { id } = req.params;
      const { college_id, name, location, description, floors, totalrooms, built_year, status } = req.body;
      const [updated] = await Building.update(
        { college_id, name, location, description, floors, totalrooms, built_year, status },
        { where: { id } }
      );
      if (updated) res.send("✅ Building updated successfully");
      else res.status(404).send("❌ Building not found or no changes made");
    } catch (error) {
      console.error("Error updating building:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

export { buildingcontroller };