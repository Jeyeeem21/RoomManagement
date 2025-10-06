import { College } from "./College.js";
import { Building } from "./Building.js";
import { Room } from "./Room.js";
import { Schedule } from "./Schedule.js";

College.hasMany(Building, { foreignKey: "college_id", onDelete: "CASCADE" });
Building.belongsTo(College, { foreignKey: "college_id" });

Building.hasMany(Room, { foreignKey: "building_id", onDelete: "CASCADE" });
Room.belongsTo(Building, { foreignKey: "building_id" });

Room.hasMany(Schedule, { foreignKey: "room_id", onDelete: "CASCADE" });
Schedule.belongsTo(Room, { foreignKey: "room_id" });
