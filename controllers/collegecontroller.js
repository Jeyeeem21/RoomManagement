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
import { College, sequelize } from "../models/College.js";
await sequelize.sync();

const collegecontroller = {
  indexCollege: async (req, res) => {
    const colleges = await College.findAll();
    res.render("colleges", { colleges });
  },

  addCollege: async (req, res) => {
    const { name, dean, description } = req.body;
    await College.create({ name, dean, description });
    res.send("✅ College data saved!");
  },

  deleteCollege: async (req, res) => {
    const { id } = req.body;
    await College.destroy({ where: { id } });
    res.send("🗑️ College deleted!");
  },

  addNewCollege: (req, res) => {
    res.render("add-new-college");
  },

  editCollege: async (req, res) => {
    try {
      const { id } = req.params;
      const college = await College.findByPk(id);
      if (!college) return res.status(404).send("College not found");
      res.render("edit-college", { college });
    } catch (error) {
      console.error("Error fetching college:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  updateCollege: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, dean, description } = req.body;
      const [updated] = await College.update(
        { name, dean, description },
        { where: { id } }
      );
      if (updated) res.send("✅ College updated successfully");
      else res.status(404).send("❌ College not found or no changes made");
    } catch (error) {
      console.error("Error updating college:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

export { collegecontroller };
