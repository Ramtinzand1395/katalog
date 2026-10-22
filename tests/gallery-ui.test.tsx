import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GalleryEmptyState } from "@/components/GalleryEmptyState";
import { GalleryGrid } from "@/components/GalleryGrid";

describe("gallery UI", () => {
  it("renders a friendly empty catalog state", () => {
    const html = renderToStaticMarkup(<GalleryEmptyState />);

    expect(html).toContain("هنوز تابلویی اضافه نشده است");
    expect(html).not.toContain("قیمت");
  });

  it("uses two, three, and four-column responsive grid breakpoints", () => {
    const html = renderToStaticMarkup(
      <GalleryGrid
        items={[
          {
            id: "wall-art-123",
            name: "تابلو نمونه",
            images: [
              "https://example.com/art-front.webp",
              "https://example.com/art-side.webp",
            ],
          },
        ]}
      />,
    );

    expect(html).toContain("grid-cols-2");
    expect(html).toContain("md:grid-cols-3");
    expect(html).toContain("lg:grid-cols-4");
    expect(html).toContain("loading=\"eager\"");
    expect(html).toContain("۲ تصویر");
    expect(html).not.toContain("قیمت");
  });
});
