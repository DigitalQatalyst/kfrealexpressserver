// import { v4 as uuidv4 } from "uuid";

import { randomUUID } from "crypto";

// export function generateUUID() {
//   const newUUID = uuidv4();
//   console.log("Generated UUID:", newUUID);
//   return newUUID;
// }

// // Call the function to generate a UUID
// // generateUUID();

export function generateUUID() {
  const newUUID = randomUUID();
  console.log("Generated UUID:", newUUID);
  return newUUID;
}

// generateUUID();
