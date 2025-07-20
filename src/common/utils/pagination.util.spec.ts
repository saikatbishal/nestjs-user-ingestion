import { getPagination, paginate } from "./pagination.util";

describe("getPagination", () => {
  it("should return default pagination if query is empty", () => {
    expect(getPagination({})).toEqual({ page: 1, limit: 10 });
  });
  it("should parse valid page and limit", () => {
    expect(getPagination({ page: "2", limit: "5" })).toEqual({
      page: 2,
      limit: 5,
    });
  });
  it("should clamp limit to 100", () => {
    expect(getPagination({ limit: "200" })).toEqual({ page: 1, limit: 100 });
  });
  it("should not allow page < 1", () => {
    expect(getPagination({ page: "0" })).toEqual({ page: 1, limit: 10 });
  });
});

describe("paginate", () => {
  it("should paginate array and return items/total", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = paginate(arr, 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.total).toBe(5);
  });
  it("should return empty items if page is out of range", () => {
    const arr = [1, 2, 3];
    const result = paginate(arr, 10, 2);
    expect(result.items).toEqual([]);
    expect(result.total).toBe(3);
  });
});
