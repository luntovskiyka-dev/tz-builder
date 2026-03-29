import { describe, expect, it } from "vitest";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";
import type { CanvasBlock } from "@/lib/blockTypes";

function mapById(blocks: CanvasBlock[]): Record<string, CanvasBlock> {
  return Object.fromEntries(blocks.map((block) => [block.id, block]));
}

describe("puck editor round-trip", () => {
  it("preserves drag/drop hierarchy after data round-trip", () => {
    const initialBlocks: CanvasBlock[] = [
      { id: "template-1", type: "template", props: { template: "blank" } },
      { id: "grid-1", type: "grid", props: { numColumns: 3, __parentId: "template-1", __zone: "children" } },
      { id: "heading-1", type: "heading", props: { text: "Title", __parentId: "grid-1", __zone: "items" } },
      { id: "flex-1", type: "flex", props: { direction: "row", __parentId: "template-1", __zone: "children" } },
      { id: "button-1", type: "button", props: { label: "CTA", __parentId: "flex-1", __zone: "children" } },
    ];

    const data = canvasBlocksToPuckData(initialBlocks);
    const roundTripBlocks = puckDataToCanvasBlocks(data);
    const byId = mapById(roundTripBlocks);

    expect(byId["grid-1"]?.props.__parentId).toBe("template-1");
    expect(byId["grid-1"]?.props.__zone).toBe("children");
    expect(byId["heading-1"]?.props.__parentId).toBe("grid-1");
    expect(byId["heading-1"]?.props.__zone).toBe("items");
    expect(byId["button-1"]?.props.__parentId).toBe("flex-1");
    expect(byId["button-1"]?.props.__zone).toBe("children");
  });

  it("preserves structure across edit props and project reload", () => {
    const initialBlocks: CanvasBlock[] = [
      { id: "template-1", type: "template", props: { template: "blank" } },
      { id: "grid-1", type: "grid", props: { numColumns: 2, __parentId: "template-1", __zone: "children" } },
      { id: "heading-1", type: "heading", props: { text: "Old", __parentId: "grid-1", __zone: "items" } },
    ];

    const data = canvasBlocksToPuckData(initialBlocks) as {
      content: Array<{ id?: string; type: string; props: Record<string, unknown> }>;
      zones?: Record<string, Array<{ id?: string; type: string; props: Record<string, unknown> }>>;
      root: { props: Record<string, unknown> };
    };

    const gridNode = (data.zones?.["template-1:children"] ?? []).find((node) => node.id === "grid-1");
    const headingNode = (data.zones?.["grid-1:items"] ?? []).find((node) => node.id === "heading-1");
    expect(gridNode).toBeTruthy();
    expect(headingNode).toBeTruthy();

    if (gridNode) gridNode.props.numColumns = 3;
    if (headingNode) headingNode.props.text = "New heading";

    const afterEditBlocks = puckDataToCanvasBlocks(normalizePuckData(data as any));
    const reloadedData = canvasBlocksToPuckData(afterEditBlocks);
    const afterReloadBlocks = puckDataToCanvasBlocks(reloadedData);
    const byId = mapById(afterReloadBlocks);

    expect(byId["grid-1"]?.props.numColumns).toBe(3);
    expect(byId["heading-1"]?.props.text).toBe("New heading");
    expect(byId["grid-1"]?.props.__parentId).toBe("template-1");
    expect(byId["grid-1"]?.props.__zone).toBe("children");
    expect(byId["heading-1"]?.props.__parentId).toBe("grid-1");
    expect(byId["heading-1"]?.props.__zone).toBe("items");
  });

  it("migrates flat layout keys into layout object for blocks with layout", () => {
    const data = normalizePuckData({
      content: [],
      zones: {},
      root: { props: {} },
    } as any);

    const withLegacy = {
      ...data,
      zones: {
        "grid-1:items": [
          {
            id: "heading-1",
            type: "heading",
            props: { text: "Hi", spanCol: 2, grow: 1, layout: { padding: "8px" } },
          },
        ],
      },
    };

    const normalized = normalizePuckData(withLegacy as any);
    const node = (normalized.zones as Record<string, unknown>)["grid-1:items"] as Array<{
      props: Record<string, unknown>;
    }>;
    const props = node[0]?.props;
    expect(props?.spanCol).toBeUndefined();
    expect(props?.grow).toBeUndefined();
    expect(props?.layout).toEqual({ spanCol: 2, grow: 1, padding: "8px" });
  });

  it("migrates legacy grid col-* zones into a single items zone", () => {
    const normalized = normalizePuckData({
      content: [{ id: "grid-1", type: "grid", props: { numColumns: 2 } }],
      zones: {
        "grid-1:col-1": [{ id: "a", type: "text", props: { text: "A" } }],
        "grid-1:col-2": [{ id: "b", type: "text", props: { text: "B" } }],
      },
      root: { props: {} },
    } as any);

    const zones = normalized.zones as Record<string, unknown>;
    const items = zones["grid-1:items"] as Array<{ id?: string }>;
    expect(items).toHaveLength(2);
    expect(items.map((n) => n.id)).toEqual(["a", "b"]);
    expect(zones["grid-1:col-1"]).toBeUndefined();
    expect(zones["grid-1:col-2"]).toBeUndefined();
  });

  it("migrates template slot zone from content to children", () => {
    const normalized = normalizePuckData({
      content: [{ id: "template-1", type: "template", props: { template: "blank" } }],
      zones: {
        "template-1:content": [{ id: "grid-1", type: "grid", props: { numColumns: 2 } }],
      },
      root: { props: {} },
    } as any);

    const zones = normalized.zones as Record<string, unknown>;
    expect(zones["template-1:content"]).toBeUndefined();
    expect(Array.isArray(zones["template-1:children"])).toBe(true);
    expect((zones["template-1:children"] as { id?: string }[])[0]?.id).toBe("grid-1");
  });

  it("migrates heading level to h1–h6 and space direction both from legacy values", () => {
    const normalized = normalizePuckData({
      content: [
        { id: "heading-legacy", type: "heading", props: { text: "T", level: "3" } },
        { id: "space-legacy", type: "space", props: { size: "32px", direction: "" } },
      ],
      zones: {},
      root: { props: {} },
    } as any);

    const heading = (normalized.content as Array<{ id?: string; props: Record<string, unknown> }>).find(
      (n) => n.id === "heading-legacy",
    );
    const space = (normalized.content as Array<{ id?: string; props: Record<string, unknown> }>).find(
      (n) => n.id === "space-legacy",
    );
    expect(heading?.props.level).toBe("h3");
    expect(space?.props.direction).toBe("both");
  });

  it("migrates legacy grid children zone into items", () => {
    const normalized = normalizePuckData({
      content: [{ id: "grid-1", type: "grid", props: { numColumns: 2 } }],
      zones: {
        "grid-1:children": [{ id: "t1", type: "text", props: { text: "In legacy children zone" } }],
      },
      root: { props: {} },
    } as any);

    const zones = normalized.zones as Record<string, unknown>;
    expect(zones["grid-1:children"]).toBeUndefined();
    const items = zones["grid-1:items"] as Array<{ id?: string; props?: { text?: string } }>;
    expect(items).toHaveLength(1);
    expect(items[0]?.props?.text).toBe("In legacy children zone");
  });

  it("migrates logos text/url to alt/imageUrl and round-trips to canvas blocks", () => {
    const normalized = normalizePuckData({
      content: [
        {
          id: "logos-1",
          type: "logos",
          props: {
            logos: [
              { text: "Old alt", url: "https://example.com/a.png" },
              { alt: "Already new", imageUrl: "https://example.com/b.png" },
            ],
          },
        },
      ],
      zones: {},
      root: { props: {} },
    } as any);

    const logosNode = (normalized.content as Array<{ props?: { logos?: unknown[] } }>)[0];
    expect(logosNode?.props?.logos).toEqual([
      { alt: "Old alt", imageUrl: "https://example.com/a.png" },
      { alt: "Already new", imageUrl: "https://example.com/b.png" },
    ]);

    const blocks = puckDataToCanvasBlocks(normalized);
    const again = canvasBlocksToPuckData(blocks);
    const roundLogos = (again.content as Array<{ props?: { logos?: unknown[] } }>)[0]?.props?.logos;
    expect(roundLogos).toEqual(logosNode?.props?.logos);
  });

  it("migrates stats value/label to title/description and round-trips to canvas blocks", () => {
    const normalized = normalizePuckData({
      content: [
        {
          id: "stats-1",
          type: "stats",
          props: {
            items: [
              { value: "12", label: "Months" },
              { title: "99", description: "Percent" },
            ],
          },
        },
      ],
      zones: {},
      root: { props: {} },
    } as any);

    const statsNode = (normalized.content as Array<{ props?: { items?: unknown[] } }>)[0];
    expect(statsNode?.props?.items).toEqual([
      { title: "12", description: "Months" },
      { title: "99", description: "Percent" },
    ]);

    const blocks = puckDataToCanvasBlocks(normalized);
    const again = canvasBlocksToPuckData(blocks);
    const roundItems = (again.content as Array<{ props?: { items?: unknown[] } }>)[0]?.props?.items;
    expect(roundItems).toEqual(statsNode?.props?.items);
  });

  it("normalizes stat block type to stats in content and zones", () => {
    const normalized = normalizePuckData({
      content: [{ id: "s1", type: "stat", props: { items: [{ value: "1", label: "A" }] } }],
      zones: {
        "grid-1:items": [{ id: "s2", type: "stat", props: { items: [] } }],
      },
      root: { props: {} },
    } as any);

    expect((normalized.content as { type: string }[])[0]?.type).toBe("stats");
    expect(((normalized.zones as Record<string, { type: string }[]>)[
      "grid-1:items"
    ])[0]?.type).toBe("stats");
  });

  it("preserves root title through normalizePuckData and defaults when absent", () => {
    const withTitle = normalizePuckData({
      content: [],
      zones: {},
      root: { props: { title: "Legacy project name" } },
    } as any);
    expect(withTitle.root.props.title).toBe("Legacy project name");

    const defaulted = normalizePuckData({
      content: [],
      zones: {},
      root: { props: {} },
    } as any);
    expect(defaulted.root.props.title).toBe("");
  });

  it("migrates template props content array to children for old saves", () => {
    const normalized = normalizePuckData({
      content: [
        {
          id: "template-1",
          type: "template",
          props: { template: "blank", content: [{ text: "nested would be wrong here" }] as unknown },
        },
      ],
      zones: {},
      root: { props: {} },
    } as any);

    const props = (normalized.content as Array<{ props?: Record<string, unknown> }>)[0]?.props;
    expect(props?.content).toBeUndefined();
    expect(Array.isArray(props?.children)).toBe(true);
  });

  it("normalizes a composite legacy project snapshot", () => {
    const normalized = normalizePuckData({
      content: [{ id: "template-1", type: "template", props: { template: "blank" } }],
      zones: {
        "template-1:content": [{ id: "grid-1", type: "grid", props: { numColumns: 2 } }],
        "grid-1:col-1": [{ id: "logos-1", type: "logos", props: { logos: [{ text: "Logo", url: "https://x/y.png" }] } }],
        "grid-1:col-2": [{ id: "stats-1", type: "stat", props: { items: [{ value: "10", label: "Ten" }] } }],
      },
      root: { props: { title: "Snapshot" } },
    } as any);

    const zones = normalized.zones as Record<string, unknown>;
    expect(zones["template-1:content"]).toBeUndefined();
    expect((zones["template-1:children"] as { id?: string }[])?.some((n) => n.id === "grid-1")).toBe(true);

    const items = zones["grid-1:items"] as Array<{ id?: string; type?: string; props?: Record<string, unknown> }>;
    expect(items?.length).toBeGreaterThanOrEqual(2);
    const logos = items.find((n) => n.id === "logos-1");
    const stats = items.find((n) => n.id === "stats-1");
    expect(logos?.props?.logos).toEqual([{ alt: "Logo", imageUrl: "https://x/y.png" }]);
    expect(stats?.type).toBe("stats");
    expect(stats?.props?.items).toEqual([{ title: "10", description: "Ten" }]);
    expect(normalized.root.props.title).toBe("Snapshot");

    const blocks = puckDataToCanvasBlocks(normalized);
    const again = normalizePuckData(canvasBlocksToPuckData(blocks) as any);
    const items2 = (again.zones as Record<string, unknown>)["grid-1:items"] as typeof items;
    expect(items2.find((n) => n.id === "logos-1")?.props?.logos).toEqual(logos?.props?.logos);
    expect(items2.find((n) => n.id === "stats-1")?.props?.items).toEqual(stats?.props?.items);
  });
});
