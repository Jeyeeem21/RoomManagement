/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { Room, sequelize } from "../models/Room.js";
import { Building } from "../models/Building.js";
import { Schedule } from "../models/Schedule.js";
import { User } from "../models/userModel.js"; // Added User import
import { Op } from "sequelize";

await sequelize.sync();

const roomcontroller = {
  indexRoom: async (req, res) => {
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

      const rooms = await Room.findAll();
      const buildings = await Building.findAll();

      const buildingIdToName = Object.fromEntries(buildings.map(b => [b.id, b.name]));
      const roomCounts = await Room.findAll({
        attributes: ["building_id", [sequelize.fn("COUNT", sequelize.col("id")), "room_count"]],
        group: ["building_id"],
        raw: true,
      });
      const buildingIdToRoomCount = Object.fromEntries(roomCounts.map(r => [r.building_id, Number(r.room_count) || 0]));

      const roomsView = rooms.map(r => ({
        ...r.get({ plain: true }),
        building_name: buildingIdToName[r.building_id] || "Unknown",
      }));
      const buildingsWithCapacity = buildings.map(b => ({
        ...b.get({ plain: true }),
        current_rooms: buildingIdToRoomCount[b.id] || 0,
      }));

      res.render("rooms", {
        active: "rooms",
        title: "Rooms",
        rooms: roomsView,
        buildings: buildingsWithCapacity,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Room index error:", error);
      res.render("rooms", {
        active: "rooms",
        title: "Rooms",
        error: "Failed to load rooms",
        rooms: [],
        buildings: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  addRoom: async (req, res) => {
    try {
      const { building_id, name, capacity, type, description } = req.body;
      
      // Check building room capacity limit
      const building = await Building.findByPk(building_id);
      if (!building) {
        return res.status(400).json({ error: "Building not found" });
      }
      
      if (building.totalrooms !== null && building.totalrooms !== undefined) {
        const existingRoomsCount = await Room.count({ where: { building_id } });
        if (existingRoomsCount >= building.totalrooms) {
          return res.status(400).json({ error: `Cannot add more rooms. Building "${building.name}" has reached its maximum capacity of ${building.totalrooms} rooms.` });
        }
      }
      
      // Validate inputs
      if (!name || !capacity || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (isNaN(capacity) || capacity <= 0) {
        return res.status(400).json({ error: "Capacity must be a positive number" });
      }

      await Room.create({ building_id, name, capacity, type, description });
      res.json({ message: "Room added successfully" });
    } catch (error) {
      console.error("Error adding room:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteRoom: async (req, res) => {
    try {
      const { id } = req.body;
      const [deleted] = await Room.destroy({ where: { id } });
      if (deleted) res.json({ message: "Room deleted successfully" });
      else res.status(404).json({ error: "Room not found" });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  addNewRoom: async (req, res) => {
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

      const buildings = await Building.findAll();
      const roomCounts = await Room.findAll({
        attributes: ["building_id", [sequelize.fn("COUNT", sequelize.col("id")), "room_count"]],
        group: ["building_id"],
        raw: true,
      });
      const buildingIdToRoomCount = Object.fromEntries(roomCounts.map(r => [r.building_id, Number(r.room_count) || 0]));
      const buildingsWithCapacity = buildings.map(b => ({
        ...b.get({ plain: true }),
        current_rooms: buildingIdToRoomCount[b.id] || 0,
      }));

      res.render("add-new-room", {
        active: "rooms",
        title: "Add New Room",
        buildings: buildingsWithCapacity,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error rendering add room:", error);
      res.render("add-new-room", {
        active: "rooms",
        title: "Add New Room",
        error: "Failed to load add room form",
        buildings: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  editRoom: async (req, res) => {
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
      const room = await Room.findByPk(id);
      if (!room) return res.status(404).send("Room not found");

      const buildings = await Building.findAll();
      const roomCounts = await Room.findAll({
        attributes: ["building_id", [sequelize.fn("COUNT", sequelize.col("id")), "room_count"]],
        group: ["building_id"],
        raw: true,
      });
      const buildingIdToRoomCount = Object.fromEntries(roomCounts.map(r => [r.building_id, Number(r.room_count) || 0]));
      const buildingsWithCapacity = buildings.map(b => ({
        ...b.get({ plain: true }),
        current_rooms: buildingIdToRoomCount[b.id] || 0,
      }));

      res.render("edit-room", {
        active: "rooms",
        title: "Edit Room",
        room,
        buildings: buildingsWithCapacity,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error fetching room:", error);
      res.render("edit-room", {
        active: "rooms",
        title: "Edit Room",
        error: "Failed to load room data",
        room: null,
        buildings: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  getRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const room = await Room.findByPk(id);
      if (!room) return res.status(404).json({ error: "Not found" });
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const { building_id, name, capacity, type, description } = req.body;
      
      const currentRoom = await Room.findByPk(id);
      if (!currentRoom) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      if (currentRoom.building_id !== parseInt(building_id)) {
        const building = await Building.findByPk(building_id);
        if (!building) {
          return res.status(400).json({ error: "Building not found" });
        }
        
        if (building.totalrooms !== null && building.totalrooms !== undefined) {
          const existingRoomsCount = await Room.count({ where: { building_id } });
          if (existingRoomsCount >= building.totalrooms) {
            return res.status(400).json({ error: `Cannot move room to building "${building.name}". It has reached its maximum capacity of ${building.totalrooms} rooms.` });
          }
        }
      }
      
      if (!name || !capacity || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (isNaN(capacity) || capacity <= 0) {
        return res.status(400).json({ error: "Capacity must be a positive number" });
      }

      const [updated] = await Room.update(
        { building_id, name, capacity, type, description },
        { where: { id } }
      );
      if (updated) res.json({ message: "Room updated successfully" });
      else res.status(404).json({ error: "Room not found or no changes made" });
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllRooms: async (req, res) => {
    try {
      const rooms = await Room.findAll({
        attributes: ['id', 'name', 'capacity', 'type'],
      });
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getRoomsByBuilding: async (req, res) => {
    try {
      const { buildingId } = req.params;
      const rooms = await Room.findAll({
        where: { building_id: buildingId },
        attributes: ['id', 'name', 'type', 'capacity', 'description'],
        raw: true,
      });
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getBuildingStats: async (req, res) => {
    try {
      const { buildingId } = req.params;
      const building = await Building.findByPk(buildingId);
      if (!building) return res.status(404).json({ error: "Building not found" });

      const roomStats = await Room.findAll({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "rooms"],
          [sequelize.fn("SUM", sequelize.col("capacity")), "capacity"],
        ],
        where: { building_id: buildingId },
        raw: true,
      });

      const stats = roomStats?.[0] || { rooms: 0, capacity: 0 };
      const now = new Date();
      const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long', timeZone: 'America/Los_Angeles' });
      const currentTime = now.toTimeString().slice(0, 8);

      let occupiedRooms = 0;
      let roomsWithSchedules = 0;
      let allRoomsHaveSchedules = true;
      const roomIds = (await Room.findAll({ where: { building_id: buildingId }, attributes: ['id'], raw: true })).map(r => r.id);

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

      res.json({
        rooms: Number(stats.rooms) || 0,
        capacity: Number(stats.capacity) || 0,
        available_rooms: availableRooms,
        occupied_rooms: occupiedRooms,
        maintenance_rooms: maintenanceRooms,
        util_rate: utilRate,
        rooms_with_schedules: roomsWithSchedules,
        remaining_rooms_without_schedules: remainingRoomsWithoutSchedules,
      });
    } catch (error) {
      console.error("Error fetching building stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export { roomcontroller };