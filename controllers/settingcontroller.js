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

import { User, sequelize } from "../models/userModel.js";
import { Content } from "../models/Content.js";
import crypto from "crypto";

await sequelize.sync();

export const settingscontroller = {
  // Display all users and content
  index: async (req, res) => {
    try {
      // Fetch logged-in user data
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();

      const users = await User.findAll();
      const mainContent = await Content.findByPk(1);
      res.render("settings", {
        users,
        mainContent,
        active: "settings",
        title: "Admin Settings",
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      res.render("settings", {
        users: [],
        mainContent: null,
        active: "settings",
        title: "Admin Settings",
        error: `Failed to load admin data: ${error.message}`,
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  // Render form to add new user
  addNewUser: async (req, res) => {
    try {
      // Fetch logged-in user data
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();

      res.render("add-setting", {
        active: "settings",
        title: "Add New User",
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error('Error rendering add user form:', error);
      res.render("add-setting", {
        active: "settings",
        title: "Add New User",
        error: `Failed to load form: ${error.message}`,
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  // Add user
  addUser: async (req, res) => {
    try {
      const { name, email, role, status, password } = req.body;
      console.log('Received user data:', { name, email, role, status, password });
      if (!name || !email || !role || !status || !password) {
        return res.status(400).send('❌ Missing required fields');
      }

      // Encrypt password with SHA-1
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      await User.create({
        name,
        email,
        role,
        status,
        password: hashedPassword,
      });

      res.send('✅ User saved successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).send(`❌ Error adding user: ${error.message}`);
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).send('❌ User not found');
      }
      // Prevent deleting the logged-in user
      if (user.id === req.session.userId) {
        return res.status(400).send('❌ Cannot delete the currently logged-in user');
      }
      await User.destroy({ where: { id } });
      res.send("🗑️ User deleted successfully!");
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send(`❌ Error deleting user: ${error.message}`);
    }
  },

  // Edit user
  editUser: async (req, res) => {
    try {
      // Fetch logged-in user data
      const loggedInUser = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!loggedInUser) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = loggedInUser.name.charAt(0).toUpperCase();

      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.render("edit-setting", {
          user: null,
          active: "settings",
          title: "Edit User",
          error: "User not found",
          user: { name: loggedInUser.name, role: loggedInUser.role, initials }
        });
      }
      res.render("edit-setting", {
        user,
        active: "settings",
        title: "Edit User",
        user: { name: loggedInUser.name, role: loggedInUser.role, initials }
      });
    } catch (error) {
      console.error('Error fetching user for edit:', error);
      res.render("edit-setting", {
        user: null,
        active: "settings",
        title: "Edit User",
        error: `Failed to load user: ${error.message}`,
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, status, password } = req.body;

      let updatedData = { name, email, role, status };
      if (password) {
        updatedData.password = crypto.createHash("sha1").update(password).digest("hex");
      }

      const [updated] = await User.update(updatedData, { where: { id } });
      if (updated) res.send("✅ User updated successfully!");
      else res.status(404).send("❌ No changes or user not found");
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send(`❌ Error updating user: ${error.message}`);
    }
  },

  // Get user data for modal
  getUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'role', 'status', 'password']
      });
      if (!user) {
        return res.status(404).send('❌ User not found');
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: user.password
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send(`❌ Error fetching user: ${error.message}`);
    }
  },

  // Save content
  saveContent: async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ message: "❌ Name and content are required" });
    }

    const logo = req.file ? req.file.filename : null;

    let existingContent = await Content.findByPk(1);
    if (!existingContent) {
      existingContent = await Content.create({ id: 1, name, content, logo });
      return res.json({ message: "✅ Content created successfully!" });
    }

    const updateData = { name, content };
    if (logo) updateData.logo = logo;
    console.log("Updating content with:", updateData);
    await Content.update(updateData, { where: { id: 1 } });
    console.log("Content updated successfully");
    res.json({ message: "✅ Content updated successfully!" });
  } catch (error) {
    console.error("Error in save:", error);
    res.status(500).json({ message: `❌ Failed to save content: ${error.message}` });
  }
},
  // Add content
  addContent: async (req, res) => {
    try {
      const { name, content, logo } = req.body;
      await Content.create({ name, content, logo });
      res.send("✅ Content added successfully!");
    } catch (error) {
      console.error('Error adding content:', error);
      res.status(500).send(`❌ Error adding content: ${error.message}`);
    }
  },

  // Delete content
  deleteContent: async (req, res) => {
    try {
      const { id } = req.body;
      const content = await Content.findByPk(id);
      if (!content) {
        return res.status(404).send('❌ Content not found');
      }
      await Content.destroy({ where: { id } });
      res.send("🗑️ Content deleted successfully!");
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).send(`❌ Error deleting content: ${error.message}`);
    }
  },

  // Render form to add new content
  addNewContent: async (req, res) => {
    try {
      // Fetch logged-in user data
      const user = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!user) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = user.name.charAt(0).toUpperCase();

      res.render("add-content", {
        title: "Add Content",
        active: "settings",
        user: { name: user.name, role: user.role, initials }
      });
    } catch (error) {
      console.error('Error rendering add content form:', error);
      res.render("add-content", {
        title: "Add Content",
        active: "settings",
        error: `Failed to load form: ${error.message}`,
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  // Edit content
  editContent: async (req, res) => {
    try {
      // Fetch logged-in user data
      const loggedInUser = await User.findByPk(req.session.userId, {
        attributes: ['name', 'role']
      });
      if (!loggedInUser) {
        req.session.destroy();
        return res.redirect("/login");
      }
      const initials = loggedInUser.name.charAt(0).toUpperCase();

      const { id } = req.params;
      const content = await Content.findByPk(id);
      if (!content) {
        return res.render("edit-content", {
          content: null,
          title: "Edit Content",
          active: "settings",
          error: "Content not found",
          user: { name: loggedInUser.name, role: loggedInUser.role, initials }
        });
      }
      res.render("edit-content", {
        content,
        title: "Edit Content",
        active: "settings",
        user: { name: loggedInUser.name, role: loggedInUser.role, initials }
      });
    } catch (error) {
      console.error('Error fetching content for edit:', error);
      res.render("edit-content", {
        content: null,
        title: "Edit Content",
        active: "settings",
        error: `Failed to load content: ${error.message}`,
        user: { name: "Guest", role: "Unknown", initials: "G" }
      });
    }
  },

  // Update content
  updateContent: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, content, logo } = req.body;
      const [updated] = await Content.update(
        { name, content, logo },
        { where: { id } }
      );
      if (updated) res.send("✅ Content updated successfully!");
      else res.status(404).send("❌ No changes or content not found");
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).send(`❌ Error updating content: ${error.message}`);
    }
  }
};