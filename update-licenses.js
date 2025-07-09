import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATAPACKAGE_PATH = join(__dirname, "data", "datapackage.json");
const LICENSES_API_URL = "https://licenses.opendefinition.org/licenses/groups/all.json";

/**
 * Fetch license data from the Open Definition API
 */
async function fetchLicenseData() {
  const response = await fetch(LICENSES_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch license data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Read and parse the datapackage.json file
 */
function readDatapackage() {
  const fileContent = fs.readFileSync(DATAPACKAGE_PATH, "utf8");
  return JSON.parse(fileContent);
}

/**
 * Write the updated datapackage back to file
 */
function writeDatapackage(datapackage) {
  const jsonString = JSON.stringify(datapackage, null, 2);
  fs.writeFileSync(DATAPACKAGE_PATH, jsonString, "utf8");
}

/**
 * Find and update the license_id field with enum values
 */
function updateLicenseIdField(datapackage, licenseIds) {
  const portalsResource = datapackage.resources.find(r => r.name === "portals");
  const licenseIdField = portalsResource.schema.fields.find(f => f.name === "license_id");
  
  if (!licenseIdField.constraints) {
    licenseIdField.constraints = {};
  }
  licenseIdField.constraints.enum = licenseIds;
}

/**
 * Display summary of the update
 */
function showUpdateSummary(licenseIds) {
  console.log("✅ Successfully updated datapackage.json with license enum values");
  console.log(`   Added ${licenseIds.length} license IDs to the enum constraint`);
  
  const firstFive = licenseIds.slice(0, 5);
  const lastFive = licenseIds.slice(-5);
  const examples = [...firstFive, "...", ...lastFive];
  const exampleString = examples.join(", ");
  console.log(`   Examples: ${exampleString}`);
}

/**
 * Update the datapackage.json file with license enum values
 */
async function updateDatapackage() {
  try {
    console.log("Fetching license data from Open Definition API...");
    const licenseData = await fetchLicenseData();
    const licenseIds = Object.keys(licenseData).sort();
    console.log(`Found ${licenseIds.length} license IDs`);

    console.log("Reading current datapackage.json...");
    const datapackage = readDatapackage();

    updateLicenseIdField(datapackage, licenseIds);

    console.log("Writing updated datapackage.json...");
    writeDatapackage(datapackage);

    showUpdateSummary(licenseIds);
  } catch (error) {
    console.error("❌ Error updating datapackage.json:", error.message);
    process.exit(1);
  }
}

// Run the update
updateDatapackage();
