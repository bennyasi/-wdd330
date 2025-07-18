// ProductData.mjs

const mockProducts = [
  {
    Id: "1",
    Name: "Awesome Widget",
    Brand: { Name: "WidgetCo" },
    DescriptionHtmlSimple: "An awesome widget for all your widget needs.",
    Images: {
      PrimaryLarge: "https://via.placeholder.com/800x600?text=Widget+Large",
      PrimaryMedium: "https://via.placeholder.com/400x300?text=Widget+Medium",
    },
    SuggestedRetailPrice: 99.99,
    ListPrice: 89.99,
    FinalPrice: 79.99,
  },
  {
    Id: "2",
    Name: "Great Gadget",
    Brand: { Name: "GadgetCorp" },
    DescriptionHtmlSimple: "A great gadget that does lots of things.",
    Images: {
      PrimaryLarge: "https://via.placeholder.com/800x600?text=Gadget+Large",
      PrimaryMedium: "https://via.placeholder.com/400x300?text=Gadget+Medium",
    },
    SuggestedRetailPrice: 149.99,
    ListPrice: 139.99,
    FinalPrice: 139.99,
  },
];

// Simulated async API
export default class ProductData {
  async findProductById(id) {
    // Simulate async delay
    await new Promise((res) => setTimeout(res, 300));
    return mockProducts.find((p) => p.Id === id) || null;
  }
}
