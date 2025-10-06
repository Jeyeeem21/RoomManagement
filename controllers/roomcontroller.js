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
import { Room, sequelize } from "../models/Room.js";
await sequelize.sync();

const roomcontroller = {
  indexRoom: async (req, res) => {
    const rooms = await Room.findAll();
    res.render("rooms", { rooms });
  },

  addRoom: async (req, res) => {
    const { building_id, name, capacity, type, description } = req.body;
    await Room.create({ building_id, name, capacity, type, description });
    res.send("✅ Room data saved!");
  },

  deleteRoom: async (req, res) => {
    const { id } = req.body;
    await Room.destroy({ where: { id } });
    res.send("🗑️ Room deleted!");
  },

  addNewRoom: (req, res) => {
    res.render("add-new-room");
  },

  editRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const room = await Room.findByPk(id);
      if (!room) return res.status(404).send("Room not found");
      res.render("edit-room", { room });
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  updateRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const { building_id, name, capacity, type, description } = req.body;
      const [updated] = await Room.update(
        { building_id, name, capacity, type, description },
        { where: { id } }
      );
      if (updated) res.send("✅ Room updated successfully");
      else res.status(404).send("❌ Room not found or no changes made");
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

export { roomcontroller };
