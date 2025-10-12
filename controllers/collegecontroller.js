/*
  MIT License
  (c) 2025 Christian I. Cabrera || XianFire Framework
*/

import { College, sequelize } from "../models/College.js";
import { Building } from "../models/Building.js";
import { Room } from "../models/Room.js";
import { User } from "../models/userModel.js"; // Added User import
import "../models/assiociation.js";

const collegecontroller = {
  // Show all colleges
  indexCollege: async (req, res) => {
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

      const colleges = await College.findAll();
      res.render("colleges", {
        active: "colleges",
        title: "Colleges",
        colleges,
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("College index error:", error);
      res.render("colleges", {
        active: "colleges",
        title: "Colleges",
        error: "Failed to load colleges",
        colleges: [],
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },
  

  // Add college
  addCollege: async (req, res) => {
    try {
      const { name, dean, description, established, email, phone } = req.body;
      await College.create({ name, dean, description, established, email, phone });
      res.send("✅ College data saved!");
    } catch (error) {
      console.error("Error adding college:", error);
      res.status(500).send("❌ Failed to save college");
    }
  },

  // Delete college
  deleteCollege: async (req, res) => {
    try {
      const { id } = req.body;
      await College.destroy({ where: { id } });
      res.send("🗑️ College deleted!");
    } catch (error) {
      console.error("Error deleting college:", error);
      res.status(500).send("❌ Failed to delete college");
    }
  },

  // Get college for editing
  getCollege: async (req, res) => {
    try {
      const { id } = req.params;
      const college = await College.findByPk(id);
      if (!college) return res.status(404).json({ error: "Not found" });
      res.json(college);
    } catch (error) {
      console.error("Error fetching college:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update college
  updateCollege: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, dean, description, established, email, phone } = req.body;
      const [updated] = await College.update(
        { name, dean, description, established, email, phone },
        { where: { id } }
      );
      if (updated) res.send("✅ College updated successfully");
      else res.status(404).send("❌ College not found or no changes made");
    } catch (error) {
      console.error("Error updating college:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // View college details
  viewCollege: async (req, res) => {
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

      const college = await College.findByPk(req.params.id);
      if (!college) return res.status(404).send("College not found");
      const buildings = await Building.findAll({ where: { college_id: req.params.id }, order: [["name", "ASC"]] });
      const totalBuildings = buildings.length;
      const totalRooms = buildings.reduce((sum, b) => sum + (Number(b.totalrooms) || 0), 0);
      res.render("college", {
        active: "colleges",
        title: "College Details",
        college,
        buildings,
        stats: { totalBuildings, totalRooms },
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error("Error viewing college:", error);
      res.render("college", {
        active: "colleges",
        title: "College Details",
        error: "Failed to load college details",
        college: null,
        buildings: [],
        stats: { totalBuildings: 0, totalRooms: 0 },
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },
};

export { collegecontroller };