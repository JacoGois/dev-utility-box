import { describe, it, expect } from "vitest";
import { createApps } from "../apps";

describe("createApps", () => {
  const t = (key: string) => key;

  it("returns an object with all registered apps", () => {
    const apps = createApps(t);
    const keys = Object.keys(apps);
    expect(keys).toContain("Auth");
    expect(keys).toContain("Pomodoro");
    expect(keys).toContain("Todo");
    expect(keys).toContain("Kanban");
    expect(keys).toContain("KnowledgeBase");
    expect(keys).toContain("SvgLab");
    expect(keys.length).toBeGreaterThanOrEqual(10);
  });

  it("each app has name, shortName, icon, component and instance limits", () => {
    const apps = createApps(t);
    for (const [, app] of Object.entries(apps)) {
      expect(app).toHaveProperty("name", expect.any(String));
      expect(app).toHaveProperty("shortName", expect.any(String));
      expect(app).toHaveProperty("icon");
      expect(app).toHaveProperty("component");
      expect(app).toHaveProperty("maxInstances", expect.any(Number));
      expect(app.maxInstances).toBeGreaterThan(0);
    }
  });

  it("uses t function to translate name and shortName", () => {
    const tMock = (key: string) => `translated:${key}`;
    const apps = createApps(tMock);
    expect(apps.Pomodoro.name).toBe("translated:apps.pomodoro.name");
    expect(apps.Pomodoro.shortName).toBe("translated:apps.pomodoro.shortName");
  });
});
