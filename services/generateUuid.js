import { v4 as uuidv4 } from "uuid";

export function generateUUID() {
  const newUUID = uuidv4();
  console.log("Generated UUID:", newUUID);
  return newUUID;
}

// Call the function to generate a UUID
// generateUUID();
