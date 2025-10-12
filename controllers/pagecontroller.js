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
// import { Page, sequelize } from "../models/Page.js";
// await sequelize.sync();
// const pagecontroller ={
//   index: async (req, res) => {
//     res.send("Index Page");
//   },
// };
// export { pagecontroller };

export const buildingPage = (req, res) => {
  res.render("buildings", { active: 'buildings', title: 'Buildings' });
};
export const dashboardPage = (req, res) => {
  res.render("dashboard", { active: 'dashboard', title: 'Dashboard' });
};
export const roomPage = (req, res) => {
  res.render("rooms", { active: 'rooms', title: 'Rooms' });
}
export const schedulePage = (req, res) => {
  res.render("schedules", { active: 'schedules', title: 'Schedules' });
}
export const collegePage = (req, res) => {
  res.render("colleges", { active: 'colleges', title: 'Colleges' });
}
export const collegeDetailPage = (req, res) => {
  res.render("college", { active: 'colleges', title: 'College Details' });
}
export const settingsPage = (req, res) => {
  res.render("settings", { active: 'settings', title: 'Settings' });
}



