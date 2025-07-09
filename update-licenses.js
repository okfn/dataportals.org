import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATAPACKAGE_PATH = path.join(__dirname, "data", "datapackage.json");
const LICENSES_API_URL =
  "https://licenses.opendefinition.org/licenses/groups/all.json";

/**
 * Fetch license data from the Open Definition API
 */
function fetchLicenseData() {
  return new Promise((resolve, reject) => {
    https
      .get(LICENSES_API_URL, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      })
      .on("error", (error) => {
        reject(new Error(`Failed to fetch license data: ${error.message}`));
      });
  });
}

/**
 * Update the datapackage.json file with license enum values
 */
async function updateDatapackage() {
  try {
    console.log("Fetching license data from Open Definition API...");
    const licenseData = await fetchLicenseData();

    // Extract license IDs (keys from the JSON object)
    const licenseIds = Object.keys(licenseData).sort();
    console.log(`Found ${licenseIds.length} license IDs`);

    // Read current datapackage.json
    console.log("Reading current datapackage.json...");
    const datapackageContent = fs.readFileSync(DATAPACKAGE_PATH, "utf8");
    const datapackage = JSON.parse(datapackageContent);

    // Find the license_id field in the schema
    const portalsResource = datapackage.resources.find(
      (r) => r.name === "portals"
    );
    if (!portalsResource) {
      throw new Error('Could not find "portals" resource in datapackage.json');
    }

    const licenseIdField = portalsResource.schema.fields.find(
      (f) => f.name === "license_id"
    );
    if (!licenseIdField) {
      throw new Error('Could not find "license_id" field in schema');
    }

    // Update the constraints to include enum values
    if (!licenseIdField.constraints) {
      licenseIdField.constraints = {};
    }

    licenseIdField.constraints.enum = licenseIds;

    // Write updated datapackage.json back to file
    console.log("Writing updated datapackage.json...");
    const updatedContent = JSON.stringify(datapackage, null, 2);
    fs.writeFileSync(DATAPACKAGE_PATH, updatedContent, "utf8");

    console.log(
      "✅ Successfully updated datapackage.json with license enum values"
    );
    console.log(
      `   Added ${licenseIds.length} license IDs to the enum constraint`
    );

    // Display first few and last few license IDs as examples
    const examples = licenseIds
      .slice(0, 5)
      .concat(["..."], licenseIds.slice(-5));
    console.log(`   Examples: ${examples.join(", ")}`);
  } catch (error) {
    console.error("❌ Error updating datapackage.json:", error.message);
    process.exit(1);
  }
}

// Run the update
updateDatapackage();
