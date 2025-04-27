/**
 * Tests for the ClientTransaction class
 *
 * This file contains test cases to verify the functionality of the
 * ClientTransaction class and transaction ID generation.
 */
import { assertEquals } from "@std/assert";
import { handleXMigration, ClientTransaction } from "./mod.ts";

/**
 * Test to verify the transaction ID generation process
 *
 * This test fetches the X homepage, creates a ClientTransaction instance,
 * and generates a transaction ID for a sample API endpoint.
 */
Deno.test("generateTransactionId", async () => {
  // Get X homepage document
  const response = await handleXMigration();

  // Create and initialize ClientTransaction instance
  const ct = await ClientTransaction.create(response);

  // Generate a transaction ID for an example API endpoint
  const transactionId = await ct.generateTransactionId(
    "GET",
    "/1.1/jot/client_event.json"
  );

  console.log("Transaction ID:", transactionId);

  // Verify that the result is a string
  assertEquals(typeof transactionId, "string");
});
