import { generateUUID } from "./uuid.util";

describe("generateUUID", () => {
  it("should generate a string uuid", () => {
    const uuid = generateUUID();
    expect(typeof uuid).toBe("string");
    expect(uuid.length).toBeGreaterThan(0);
  });
  it("should generate unique uuids", () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});
