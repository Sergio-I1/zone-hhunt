// Adds the permission texts and background-location switch that iOS requires.
import { execFileSync } from "node:child_process";
const plist = "ios/App/App/Info.plist";
const pb = (...cmd) => { try { execFileSync("/usr/libexec/PlistBuddy", ["-c", cmd.join(" "), plist], { stdio: "pipe" }); } catch (e) { /* key already there */ } };
const text = {
  NSLocationWhenInUseUsageDescription: "Zone Hunt shows your position to the other players in your game.",
  NSLocationAlwaysAndWhenInUseUsageDescription: "Zone Hunt keeps sharing your position with your game while your phone is locked, until the game ends.",
  NSCameraUsageDescription: "Take a photo to use as your icon on the game map.",
  NSPhotoLibraryUsageDescription: "Pick a photo to use as your icon on the game map."
};
for (const [k, v] of Object.entries(text)) { pb("Add", ":" + k, "string", JSON.stringify(v)); pb("Set", ":" + k, JSON.stringify(v)); }
pb("Add", ":UIBackgroundModes", "array");
pb("Add", ":UIBackgroundModes:0", "string", "location");
pb("Add", ":ITSAppUsesNonExemptEncryption", "bool", "false");
console.log("Info.plist patched");
