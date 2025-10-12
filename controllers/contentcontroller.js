// controllers/contentcontroller.js
import { Content, sequelize } from "../models/Content.js"; // Note: Capitalized 'Content' to match convention
await sequelize.sync();

const contentcontroller = {
  // controllers/contentcontroller.js (partial)
index: async (req, res) => {
  try {
    let mainContent = await Content.findByPk(1);
    if (!mainContent) {
      // Create a default record if none exists
      mainContent = await Content.create({
        id: 1,
        name: "Default University",
        content: "Default content",
        logo: null,
      });
    }
    const users = []; // Placeholder; fetch users if needed
    console.log("Fetched mainContent:", mainContent); // Debug log
    res.render("settings", {
      mainContent,
      users,
      title: "Settings",
      active: "settings",
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Error loading settings page");
  }
},


  // controllers/contentcontroller.js (partial)
save: async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, content } = req.body;
    const logo = req.file ? req.file.filename : null;

    const existingContent = await Content.findByPk(1);
    if (!existingContent) {
      return res.status(404).json({ message: "❌ No content record found to update." });
    }

    const updateData = { name, content };
    if (logo) updateData.logo = logo;
    console.log("Updating content with:", updateData); // Additional debug log
    await Content.update(updateData, { where: { id: 1 } });
    console.log("Content updated successfully");
    res.json({ message: "✅ Content updated successfully!" });
  } catch (error) {
    console.error("Error in save:", error);
    res.status(500).json({ message: `❌ Failed to save content: ${error.message}` });
  }
},  

  add: async (req, res) => {
    const { name, content, logo } = req.body;
    await Content.create({ name, content, logo });
    res.send("✅ Content added successfully!");
  },

  delete: async (req, res) => {
    const { id } = req.body;
    await Content.destroy({ where: { id } });
    res.send("🗑️ Content deleted successfully!");
  },

  addNew: (req, res) => {
    res.render("add-content", { title: "Add Content", active: "contents" });
  },

  edit: async (req, res) => {
    const { id } = req.params;
    const content = await Content.findByPk(id);
    if (!content) return res.status(404).send("❌ Content not found");
    res.render("edit-content", { content, title: "Edit Content", active: "contents" });
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { name, content, logo } = req.body;
    const [updated] = await Content.update(
      { name, content, logo },
      { where: { id } }
    );
    if (updated) res.send("✅ Content updated successfully!");
    else res.status(404).send("❌ No changes or content not found");
  },
};

export { contentcontroller };