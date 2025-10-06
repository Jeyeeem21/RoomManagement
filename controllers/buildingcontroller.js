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
import { Building, sequelize } from "../models/Building.js";
await sequelize.sync();

const buildingcontroller = {
  indexBuilding: async (req, res) => {
    const buildings = await Building.findAll();
    res.render("buildings", { buildings });
  },

  addBuilding: async (req, res) => {
    const { college_id, name, location, description } = req.body;
    await Building.create({ college_id, name, location, description });
    res.send("✅ Building data saved!");
  },

  deleteBuilding: async (req, res) => {
    const { id } = req.body;
    await Building.destroy({ where: { id } });
    res.send("🗑️ Building deleted!");
  },

  addNewBuilding: (req, res) => {
    res.render("add-new-building");
  },

  editBuilding: async (req, res) => {
    try {
      const { id } = req.params;
      const building = await Building.findByPk(id);
      if (!building) return res.status(404).send("Building not found");
      res.render("edit-building", { building });
    } catch (error) {
      console.error("Error fetching building:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  updateBuilding: async (req, res) => {
    try {
      const { id } = req.params;
      const { college_id, name, location, description } = req.body;
      const [updated] = await Building.update(
        { college_id, name, location, description },
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
