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

  it("uses a spacious responsive editorial grid", () => {
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

    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("xl:grid-cols-3");
    expect(html).toContain("loading=\"eager\"");
    expect(html).toContain("۲ تصویر");
    expect(html).toContain("اثر منتخب");
    expect(html).not.toContain("قیمت");
  });
});
