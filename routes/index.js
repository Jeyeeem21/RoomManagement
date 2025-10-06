
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
import {
  buildingPage,
  dashboardPage,
  schedulePage,
  roomPage,
  collegePage,
  collegeDetailPage,
  settingsPage
} from "../controllers/pagecontroller.js";


const router = express.Router();

router.get('/', dashboardPage);
router.get('/dashboard', dashboardPage);
router.get('/colleges', collegePage);
router.get('/college', collegeDetailPage);
router.get('/buildings', buildingPage);
router.get('/rooms',   roomPage);
router.get('/schedules', schedulePage);
router.get('/settings', settingsPage);


import express from "express";

/* -------------------------
   Controllers Import
-------------------------- */
import { collegecontroller } from "../controllers/collegecontroller.js";
import { buildingcontroller } from "../controllers/buildingcontroller.js";
import { roomcontroller } from "../controllers/roomcontroller.js";
import { schedulecontroller } from "../controllers/schedulecontroller.js";
import { 
  loginPage, 
  registerPage, 
  forgotPasswordPage, 
  dashboardPage, 
  loginUser, 
  registerUser, 
  logoutUser 
} from "../controllers/authController.js";



//user
router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/register", registerPage);
router.post("/register", registerUser);
router.get("/forgot-password", forgotPasswordPage);
router.get("/dashboard", dashboardPage);
router.get("/logout", logoutUser);

//college
router.get("/colleges", collegecontroller.indexCollege);
router.post("/colleges/add", collegecontroller.addCollege);
router.post("/colleges/delete", collegecontroller.deleteCollege);
router.get("/colleges/add", collegecontroller.addNewCollege);
router.get("/colleges/edit/:id", collegecontroller.editCollege);
router.post("/colleges/update/:id", collegecontroller.updateCollege);

//building
router.get("/buildings", buildingcontroller.indexBuilding);
router.post("/buildings/add", buildingcontroller.addBuilding);
router.post("/buildings/delete", buildingcontroller.deleteBuilding);
router.get("/buildings/add", buildingcontroller.addNewBuilding);
router.get("/buildings/edit/:id", buildingcontroller.editBuilding);
router.post("/buildings/update/:id", buildingcontroller.updateBuilding);

//room
router.get("/rooms", roomcontroller.indexRoom);
router.post("/rooms/add", roomcontroller.addRoom);
router.post("/rooms/delete", roomcontroller.deleteRoom);
router.get("/rooms/add", roomcontroller.addNewRoom);
router.get("/rooms/edit/:id", roomcontroller.editRoom);
router.post("/rooms/update/:id", roomcontroller.updateRoom);

//schedule
router.get("/schedules", schedulecontroller.indexSchedule);
router.post("/schedules/add", schedulecontroller.addSchedule);
router.post("/schedules/delete", schedulecontroller.deleteSchedule);
router.get("/schedules/add", schedulecontroller.addNewSchedule);
router.get("/schedules/edit/:id", schedulecontroller.editSchedule);
router.post("/schedules/update/:id", schedulecontroller.updateSchedule);



export default router;
