const { randomUUID } = require("crypto");  // Use `require` for CommonJS

// Function to generate a UUID
const generateUUID = async () => {
  const newUUID = randomUUID();  // No need for `await` since `randomUUID` isn't a promise
  console.log("Generated UUID:", newUUID);
  return newUUID;
};

// Export the function
module.exports = { generateUUID };
