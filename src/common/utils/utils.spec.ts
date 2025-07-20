import { paginate } from "./pagination.util";
import { Test, TestingModule } from "@nestjs/testing";


describe("paginate", () => {
  it("should paginate array", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = paginate(arr, 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.total).toBe(5);
  });
});
