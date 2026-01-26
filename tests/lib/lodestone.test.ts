import { describe, expect, it } from "vitest";
import Lodestone from "../../src/index.js";

// Other than the character, all ids and results are chosen at random.
describe("Lodestone", () => {
  describe("init", () => {
    it("can initialize without options", () => {
      expect(() => new Lodestone()).not.toThrow();
    });
    it("can initialize with options", () => {
      expect(() => new Lodestone({ locale: "jp" })).not.toThrow();
    });
  });

  describe("endpoint", () => {
    const lodestone = new Lodestone({ locale: "jp" });

    describe("character", () => {
      describe("get", () => {
        it("returns null for an invalid identifier", async () => {
          const result = await lodestone.character.get(0);
          expect(result).toBeNull();
        });

        it("returns an object for a valid identifier", async () => {
          const result = await lodestone.character.get("29193229");

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");
          expect(result).toHaveProperty("id");
          expect(result).toHaveProperty("name");
          expect(result).not.toHaveProperty("achievement");
        });

        it("returns an object with provided columns", async () => {
          const result = await lodestone.character.get("29193229", { columns: ["achievement"] });

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");
          expect(result).toHaveProperty("achievement");
          expect(result).not.toHaveProperty("minion");
          expect(result).not.toHaveProperty("mount");
          expect(result).not.toHaveProperty("faceaccessory");
        });
      });

      describe("find", () => {
        it("errors if invalid parameters", async () => {
          // @ts-expect-error - missing required parameter
          await expect(lodestone.character.find({})).rejects.toThrow();
          // @ts-expect-error - invalid parameter
          await expect(lodestone.character.find({ dcname: "", q: "" })).rejects.toThrow();
        });

        it("returns an array of objects for the query", async () => {
          const results = await lodestone.character.find({ q: "Chomu Suke", worldname: "Raiden" });

          expect(results).toBeDefined();
          expect(Array.isArray(results)).toBe(true);
          expect(results?.length).toBeGreaterThan(0);
        });
      });
    });

    describe("cwls", () => {
      describe("get", () => {
        it("returns null for an invalid identifier", async () => {
          const result = await lodestone.cwls.get(0);
          expect(result).toBeNull();
        });

        it("returns an object for a valid identifier", async () => {
          const result = await lodestone.cwls.get("e4d9a64fa0316b8ebe701e818b0a6b8e7be61d2c");

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");
          expect(result).toHaveProperty("name");
        });
      });

      describe("find", () => {
        it("errors if invalid parameters", async () => {
          // @ts-expect-error - missing required parameter
          await expect(lodestone.cwls.find({})).rejects.toThrow();
          // @ts-expect-error - invalid parameter
          await expect(lodestone.cwls.find({ q: "", worldname: "" })).rejects.toThrow();
        });

        it("returns an array of objects for the query", async () => {
          const results = await lodestone.cwls.find({ dcname: "_dc_Light", q: "" });

          expect(results).toBeDefined();
          expect(Array.isArray(results)).toBe(true);
          expect(results?.length).toBeGreaterThan(0);
        });
      });
    });

    describe("freecompany", () => {
      describe("get", () => {
        it("returns null for an invalid identifier", async () => {
          const result = await lodestone.freecompany.get(0);
          expect(result).toBeNull();
        });

        it("returns an object for a valid identifier", async () => {
          const result = await lodestone.freecompany.get("9237023573225242625");

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");
          expect(result).toHaveProperty("id");
          expect(result).toHaveProperty("name");
        });
      });

      describe("find", () => {
        it("errors if invalid parameters", async () => {
          // @ts-expect-error - missing required parameter
          await expect(lodestone.freecompany.find({})).rejects.toThrow();
          // @ts-expect-error - invalid parameter
          await expect(lodestone.freecompany.find({ dcname: "", q: "" })).rejects.toThrow();
        });

        it("returns an array of objects for the query", async () => {
          const results = await lodestone.freecompany.find({ q: "", worldname: "Raiden" });

          expect(results).toBeDefined();
          expect(Array.isArray(results)).toBe(true);
          expect(results?.length).toBeGreaterThan(0);
        });
      });
    });

    describe("linkshell", () => {
      describe("get", () => {
        it("returns null for an invalid identifier", async () => {
          const result = await lodestone.linkshell.get(0);
          expect(result).toBeNull();
        });

        it("returns an object for a valid identifier", async () => {
          const result = await lodestone.linkshell.get("4503599627448110");

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");
          expect(result).toHaveProperty("name");
        });
      });

      describe("find", () => {
        it("errors if invalid parameters", async () => {
          // @ts-expect-error - missing required parameter
          await expect(lodestone.linkshell.find({})).rejects.toThrow();
          // @ts-expect-error - invalid parameter
          await expect(lodestone.linkshell.find({ dcname: "", q: "" })).rejects.toThrow();
        });

        it("returns an array of objects for the query", async () => {
          const results = await lodestone.linkshell.find({ q: "", worldname: "Raiden" });

          expect(results).toBeDefined();
          expect(Array.isArray(results)).toBe(true);
          expect(results?.length).toBeGreaterThan(0);
        });
      });
    });

    describe("pvpteam", () => {
      describe("get", () => {
        it("returns null for an invalid identifier", async () => {
          const result = await lodestone.pvpteam.get(0);
          expect(result).toBeNull();
        });

        it("returns an object for a valid identifier", async () => {
          const result = await lodestone.pvpteam.get("2ab412c104fdcd9c1e43e384bf7e8503d34a645b");

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");
          expect(result).toHaveProperty("name");
        });
      });

      describe("find", () => {
        it("errors if invalid parameters", async () => {
          // @ts-expect-error - missing required parameter
          await expect(lodestone.pvpteam.find({})).rejects.toThrow();
          // @ts-expect-error - invalid parameter
          await expect(lodestone.pvpteam.find({ q: "", worldname: "" })).rejects.toThrow();
        });

        it("returns an array of objects for the query", async () => {
          const results = await lodestone.pvpteam.find({ dcname: "_dc_Light", q: "" });

          expect(results).toBeDefined();
          expect(Array.isArray(results)).toBe(true);
          expect(results?.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
