import { describe, expect, it } from "vitest";
import Lodestone from "../../src/index.js";

describe("Lodestone", () => {
  describe("init", () => {
    it("can initialize without options", () => {
      expect(() => new Lodestone()).not.toThrow();
    });
    it("can initialize with options", () => {
      expect(() => new Lodestone({ locale: "jp" })).not.toThrow();
    });
  });

  describe("character", () => {
    const lodestone = new Lodestone();

    describe("get()", () => {
      it("returns a character object for a valid ID", async () => {
        const result = await lodestone.character.get(29193229);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("name");
      });

      it("returns a character object with columns", async () => {
        const result = await lodestone.character.get(29193229, {
          columns: ["achievement", "faceaccessory", "minion", "mount"],
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("achievement");
        expect(result).toHaveProperty("faceaccessory");
        expect(result).toHaveProperty("minion");
        expect(result).toHaveProperty("mount");
      });

      it("returns null for an invalid ID", async () => {
        const result = await lodestone.character.get(0);
        expect(result).toBeNull();
      });
    });

    describe("find()", () => {
      it("returns search results", async () => {
        const results = await lodestone.character.find({ q: "Chomu Suke", worldname: "Raiden" });

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results?.length).toBeGreaterThan(0);
      });
    });
  });
});
