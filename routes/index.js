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

import express from "express";
import { collegecontroller } from "../controllers/collegecontroller.js";
import { buildingcontroller } from "../controllers/buildingcontroller.js";
import { roomcontroller } from "../controllers/roomcontroller.js";
import { schedulecontroller } from "../controllers/schedulecontroller.js";
import { dashboardPage } from "../controllers/dashboardcontroller.js";
import { settingscontroller } from "../controllers/settingcontroller.js";
import { loginPage, registerPage, forgotPasswordPage, dashboard, loginUser, registerUser, logoutUser } from "../controllers/authcontroller.js";
import { homePage } from "../controllers/homeController.js";


import multer from "multer";

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });
router.get('/', homePage);
router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/register", registerPage);
router.post("/register", registerUser);
router.get("/forgot-password", forgotPasswordPage);
router.get("/dashboard", dashboardPage);
router.get("/logout", logoutUser);


// Admin routes (combined settings and content)
router.get("/settings", settingscontroller.index);
router.post("/settings/users/add", settingscontroller.addUser);
router.post("/settings/users/delete/:id", settingscontroller.deleteUser);
router.get("/settings/users/add", settingscontroller.addNewUser);
router.get("/settings/users/edit/:id", settingscontroller.editUser);
router.post("/settings/users/update/:id", settingscontroller.updateUser);
router.get("/settings/users/get/:id", settingscontroller.getUser);
router.post("/settings/content/save", upload.single("logo"), settingscontroller.saveContent);
router.post("/settings/content/add", settingscontroller.addContent);
router.post("/settings/content/delete", settingscontroller.deleteContent);
router.get("/settings/content/add", settingscontroller.addNewContent);
router.get("/settings/content/edit/:id", settingscontroller.editContent);
router.post("/settings/content/update/:id", settingscontroller.updateContent);

// Dashboard
router.get("/dashboard", dashboardPage);
router.get("/", dashboardPage);

// College routes
router.get("/colleges", collegecontroller.indexCollege);
router.post("/colleges/add", collegecontroller.addCollege);
router.post("/colleges/delete", collegecontroller.deleteCollege);
router.get("/colleges/get/:id", collegecontroller.getCollege);
router.post("/colleges/update/:id", collegecontroller.updateCollege);
router.get('/colleges/view/:id', collegecontroller.viewCollege);
// router.post("/buildings/add", buildingcontroller.addBuilding);
// Building routes
router.get("/buildings", buildingcontroller.indexBuilding);
router.post("/buildings/add", buildingcontroller.addBuilding);
router.post("/buildings/delete", buildingcontroller.deleteBuilding);
router.get("/buildings/add", buildingcontroller.addNewBuilding);
router.get("/buildings/edit/:id", buildingcontroller.editBuilding);
router.get("/buildings/get/:id", buildingcontroller.getBuilding);
router.post("/buildings/update/:id", buildingcontroller.updateBuilding);
router.get('/buildings/view/:id', buildingcontroller.viewBuilding);

// Room routes
router.get("/rooms", roomcontroller.indexRoom);
router.post("/rooms/add", roomcontroller.addRoom);
router.post("/rooms/delete", roomcontroller.deleteRoom);
router.get("/rooms/add", roomcontroller.addNewRoom);
router.get("/rooms/edit/:id", roomcontroller.editRoom);
router.get("/rooms/get/:id", roomcontroller.getRoom);
router.post("/rooms/update/:id", roomcontroller.updateRoom);
router.get("/rooms/all", roomcontroller.getAllRooms);
router.get("/rooms/building/:buildingId", roomcontroller.getRoomsByBuilding);
router.get("/buildings/:buildingId/stats", roomcontroller.getBuildingStats);

// Schedule routes
router.get("/schedules", schedulecontroller.indexSchedule);
router.get("/schedules/events", schedulecontroller.eventsJson);
router.get("/schedules/data", schedulecontroller.getSchedulesData);
router.post("/schedules/add", schedulecontroller.addSchedule);
router.post("/schedules/delete", schedulecontroller.deleteSchedule);
router.get("/schedules/add", schedulecontroller.addNewSchedule);
router.get("/schedules/edit/:id", schedulecontroller.editSchedule);
router.get("/schedules/get/:id", schedulecontroller.getSchedule);
router.post("/schedules/update/:id", schedulecontroller.updateSchedule);
router.get("/schedules/export/program", schedulecontroller.exportProgramSchedules);
router.get("/schedules/export/professor", schedulecontroller.exportProfessorSchedules);
// Lightweight endpoint to let client pages check whether the user is authenticated.
// Used by the login page to detect a cached restore and redirect if the session is active.
router.get('/session', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.userId) });
});

export default router;

// /*
//   MIT License
  
//   Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
//   Mindoro State University - Philippines

//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:

//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.

//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
// */

// import express from "express";
// import { collegecontroller } from "../controllers/collegecontroller.js";
// import { buildingcontroller } from "../controllers/buildingcontroller.js";
// import { roomcontroller } from "../controllers/roomcontroller.js";
// import { schedulecontroller } from "../controllers/schedulecontroller.js";
// import { dashboardPage } from "../controllers/dashboardcontroller.js";
// import { settingscontroller } from "../controllers/settingcontroller.js";
// import { loginPage, registerPage, forgotPasswordPage, dashboard, loginUser, registerUser, logoutUser } from "../controllers/authcontroller.js";
// import multer from "multer";

// const router = express.Router();

// // Authentication middleware
// const requireAuth = (req, res, next) => {
//   if (!req.session.userId) {
//     return res.redirect("/login");
//   }
//   next();
// };

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/Uploads");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// // Public routes (no authentication required)
// router.get("/login", loginPage);
// router.post("/login", loginUser);
// router.get("/register", registerPage);
// router.post("/register", registerUser);
// router.get("/forgot-password", forgotPasswordPage);
// router.get("/logout", logoutUser);

// // Protected routes (require authentication)
// router.get("/dashboard", requireAuth, dashboardPage);
// router.get("/", requireAuth, dashboardPage);

// // Admin routes (combined settings and content)
// router.get("/settings", requireAuth, settingscontroller.index);
// router.post("/settings/users/add", requireAuth, settingscontroller.addUser);
// router.post("/settings/users/delete/:id", requireAuth, settingscontroller.deleteUser);
// router.get("/settings/users/add", requireAuth, settingscontroller.addNewUser);
// router.get("/settings/users/edit/:id", requireAuth, settingscontroller.editUser);
// router.post("/settings/users/update/:id", requireAuth, settingscontroller.updateUser);
// router.get("/settings/users/get/:id", requireAuth, settingscontroller.getUser);
// router.post("/settings/content/save", requireAuth, upload.single("logo"), settingscontroller.saveContent);
// router.post("/settings/content/add", requireAuth, settingscontroller.addContent);
// router.post("/settings/content/delete", requireAuth, settingscontroller.deleteContent);
// router.get("/settings/content/add", requireAuth, settingscontroller.addNewContent);
// router.get("/settings/content/edit/:id", requireAuth, settingscontroller.editContent);
// router.post("/settings/content/update/:id", requireAuth, settingscontroller.updateContent);

// // College routes
// router.get("/colleges", requireAuth, collegecontroller.indexCollege);
// router.post("/colleges/add", requireAuth, collegecontroller.addCollege);
// router.post("/colleges/delete", requireAuth, collegecontroller.deleteCollege);
// router.get("/colleges/get/:id", requireAuth, collegecontroller.getCollege);
// router.post("/colleges/update/:id", requireAuth, collegecontroller.updateCollege);
// router.get("/colleges/view/:id", requireAuth, collegecontroller.viewCollege);

// // Building routes
// router.get("/buildings", requireAuth, buildingcontroller.indexBuilding);
// router.post("/buildings/add", requireAuth, buildingcontroller.addBuilding);
// router.post("/buildings/delete", requireAuth, buildingcontroller.deleteBuilding);
// router.get("/buildings/add", requireAuth, buildingcontroller.addNewBuilding);
// router.get("/buildings/edit/:id", requireAuth, buildingcontroller.editBuilding);
// router.get("/buildings/get/:id", requireAuth, buildingcontroller.getBuilding);
// router.post("/buildings/update/:id", requireAuth, buildingcontroller.updateBuilding);
// router.get("/buildings/view/:id", requireAuth, buildingcontroller.viewBuilding);

// // Room routes
// router.get("/rooms", requireAuth, roomcontroller.indexRoom);
// router.post("/rooms/add", requireAuth, roomcontroller.addRoom);
// router.post("/rooms/delete", requireAuth, roomcontroller.deleteRoom);
// router.get("/rooms/add", requireAuth, roomcontroller.addNewRoom);
// router.get("/rooms/edit/:id", requireAuth, roomcontroller.editRoom);
// router.get("/rooms/get/:id", requireAuth, roomcontroller.getRoom);
// router.post("/rooms/update/:id", requireAuth, roomcontroller.updateRoom);
// router.get("/rooms/all", requireAuth, roomcontroller.getAllRooms);
// router.get("/rooms/building/:buildingId", requireAuth, roomcontroller.getRoomsByBuilding);
// router.get("/buildings/:buildingId/stats", requireAuth, roomcontroller.getBuildingStats);

// // Schedule routes
// router.get("/schedules", requireAuth, schedulecontroller.indexSchedule);
// router.get("/schedules/events", requireAuth, schedulecontroller.eventsJson);
// router.get("/schedules/data", requireAuth, schedulecontroller.getSchedulesData);
// router.post("/schedules/add", requireAuth, schedulecontroller.addSchedule);
// router.post("/schedules/delete", requireAuth, schedulecontroller.deleteSchedule);
// router.get("/schedules/add", requireAuth, schedulecontroller.addNewSchedule);
// router.get("/schedules/edit/:id", requireAuth, schedulecontroller.editSchedule);
// router.get("/schedules/get/:id", requireAuth, schedulecontroller.getSchedule);
// router.post("/schedules/update/:id", requireAuth, schedulecontroller.updateSchedule);
// router.get("/schedules/export/program", requireAuth, schedulecontroller.exportProgramSchedules);
// router.get("/schedules/export/professor", requireAuth, schedulecontroller.exportProfessorSchedules);

// export default router;