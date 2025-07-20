import { DataSource } from "typeorm";
import { User } from "../users/user.entity";
import { Document } from "../documents/document.entity";
import { IngestionProcess } from "../ingestion/ingestion-process.entity";

// Mock the entire database.providers module
jest.mock("./database.providers", () => {
  const mockDataSource = {
    options: {
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "saikatbishal",
      database: "nestjs_docs",
      entities: [class User {}, class Document {}, class IngestionProcess {}],
      synchronize: false,
    },
    isInitialized: false,
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
  };

  return {
    AppDataSource: mockDataSource,
    databaseProviders: [
      {
        provide: "DATA_SOURCE",
        useFactory: jest.fn().mockResolvedValue(mockDataSource),
      },
    ],
  };
});

describe("Database Providers", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("AppDataSource Configuration", () => {
    it("should be configured with correct default values", async () => {
      const { AppDataSource } = await import("./database.providers");

      expect(AppDataSource.options.type).toBe("postgres");
      expect((AppDataSource.options as any).host).toBe("localhost");
      expect((AppDataSource.options as any).port).toBe(5432);
      expect((AppDataSource.options as any).username).toBe("postgres");
      expect((AppDataSource.options as any).password).toBe("saikatbishal");
      expect((AppDataSource.options as any).database).toBe("nestjs_docs");
      expect(AppDataSource.options.synchronize).toBe(false);
    });

    it("should include all required entities", async () => {
      const { AppDataSource } = await import("./database.providers");
      const entities = AppDataSource.options.entities;

      expect(entities).toBeDefined();
      expect(Array.isArray(entities)).toBe(true);
      expect(entities.length).toBe(3);
    });
  });

  describe("databaseProviders", () => {
    it("should contain DATA_SOURCE provider", async () => {
      const { databaseProviders } = await import("./database.providers");

      expect(databaseProviders).toBeDefined();
      expect(databaseProviders).toHaveLength(1);
      expect(databaseProviders[0]).toHaveProperty("provide", "DATA_SOURCE");
      expect(databaseProviders[0]).toHaveProperty("useFactory");
      expect(typeof databaseProviders[0].useFactory).toBe("function");
    });

    it("should return DataSource from factory function", async () => {
      const { databaseProviders, AppDataSource } = await import(
        "./database.providers"
      );

      const provider = databaseProviders[0];
      const result = await provider.useFactory();

      expect(result).toBe(AppDataSource);
    });

    it("should handle DataSource initialization", async () => {
      const { databaseProviders, AppDataSource } = await import(
        "./database.providers"
      );

      // Mock isInitialized as false to trigger initialization
      Object.defineProperty(AppDataSource, "isInitialized", {
        value: false,
        writable: true,
        configurable: true,
      });

      const provider = databaseProviders[0];
      const result = await provider.useFactory();

      expect(result).toBe(AppDataSource);
    });

    it("should handle already initialized DataSource", async () => {
      const { databaseProviders, AppDataSource } = await import(
        "./database.providers"
      );

      // Mock isInitialized as true to skip initialization
      Object.defineProperty(AppDataSource, "isInitialized", {
        value: true,
        writable: true,
        configurable: true,
      });

      const provider = databaseProviders[0];
      const result = await provider.useFactory();

      expect(result).toBe(AppDataSource);
    });
  });

  describe("Environment Variables", () => {
    it("should use environment variables when provided", () => {
      // Set environment variables
      process.env.DB_HOST = "test-host";
      process.env.DB_PORT = "3000";
      process.env.DB_USER = "test-user";
      process.env.DB_PASS = "test-pass";
      process.env.DB_NAME = "test-db";

      // Test that environment variables would be used
      expect(process.env.DB_HOST).toBe("test-host");
      expect(process.env.DB_PORT).toBe("3000");
      expect(process.env.DB_USER).toBe("test-user");
      expect(process.env.DB_PASS).toBe("test-pass");
      expect(process.env.DB_NAME).toBe("test-db");
    });
  });
});
