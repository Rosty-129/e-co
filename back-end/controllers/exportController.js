
import ExcelJS from "exceljs";
import prisma from "../lib/prisma.js"; // Use the same Prisma import as your other controllers

export const exportDashboard = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "E-co Admin";
    workbook.created = new Date();

    // Fetch all dashboard data
    const [
      orders,
      products,
      customers,
      categories
    ] = await Promise.all([

      // All orders, including customer and purchased products
      prisma.order.findMany({
        include: {
          user: {
            select: {
              firstname: true,
              lastname: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),

      // All products with their categories
      prisma.product.findMany({
        include: {
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),

      // Customers (excluding admins)
      prisma.user.findMany({
        where: {
          role: {
            not: "ADMIN"
          }
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          isVerified: true
        }
      }),

      // All categories
      prisma.category.findMany()
    ]);

    // Calculate dashboard statistics
    const revenue = orders
      .filter(order => order.status === "COMPLETED")
      .reduce((sum, order) => sum + order.total, 0);

    const pending = orders.filter(
      order => order.status === "PENDING"
    ).length;

    const completed = orders.filter(
      order => order.status === "COMPLETED"
    ).length;

    const lowStock = products.filter(
      product => product.Stock > 0 && product.Stock <= 5
    ).length;

    const outOfStock = products.filter(
      product => product.Stock === 0
    ).length;

    const totalStock = products.reduce(
      (sum, product) => sum + product.Stock,
      0
    );

    // Helper to style worksheet headers
    const styleHeader = (sheet) => {
      const header = sheet.getRow(1);

      header.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }
      };

      header.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF171717" }
      };

      header.alignment = {
        vertical: "middle",
        horizontal: "center"
      };

      header.height = 25;

      sheet.views = [{ state: "frozen", ySplit: 1 }];

      if (sheet.columnCount > 0) {
        sheet.autoFilter = {
          from: "A1",
          to: header.getCell(sheet.columnCount).address
        };
      }
    };

    // ===================================
    // 1. OVERVIEW SHEET
    // ===================================

    const overview = workbook.addWorksheet("Overview");

    overview.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 25 }
    ];

    overview.addRows([
      { metric: "Total Revenue", value: revenue },
      { metric: "Total Orders", value: orders.length },
      { metric: "Pending Orders", value: pending },
      { metric: "Completed Orders", value: completed },
      { metric: "Total Products", value: products.length },
      { metric: "Low Stock Products", value: lowStock },
      { metric: "Out of Stock Products", value: outOfStock },
      { metric: "Total Customers", value: customers.length },
      { metric: "Total Categories", value: categories.length },
      { metric: "Total Stock Units", value: totalStock }
    ]);

    styleHeader(overview);

    // ===================================
    // 2. ORDERS SHEET
    // ===================================

    const ordersSheet = workbook.addWorksheet("Orders");

    ordersSheet.columns = [
      { header: "Order ID", key: "id", width: 15 },
      { header: "Customer", key: "customer", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Status", key: "status", width: 18 },
      { header: "Total", key: "total", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Items Count", key: "itemsCount", width: 15 },
      { header: "Order Date", key: "createdAt", width: 22 }
    ];

    orders.forEach(order => {
      ordersSheet.addRow({
        id: order.id,
        customer: `${order.user.firstname} ${order.user.lastname}`,
        email: order.user.email,
        status: order.status,
        total: order.total,
        address: order.address || "Not provided",
        itemsCount: order.items.length,
        createdAt: order.createdAt
      });
    });

    ordersSheet.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm";

    styleHeader(ordersSheet);

    // ===================================
    // 3. ORDER ITEMS SHEET
    // ===================================

    const itemsSheet = workbook.addWorksheet("Order Items");

    itemsSheet.columns = [
      { header: "Order ID", key: "orderId", width: 15 },
      { header: "Product", key: "product", width: 30 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Unit Price", key: "unitPrice", width: 18 },
      { header: "Subtotal", key: "subtotal", width: 18 }
    ];

    orders.forEach(order => {
      order.items.forEach(item => {
        itemsSheet.addRow({
          orderId: order.id,
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice
        });
      });
    });

    styleHeader(itemsSheet);

    // ===================================
    // 4. PRODUCTS SHEET
    // ===================================

    const productsSheet = workbook.addWorksheet("Products");

    productsSheet.columns = [
      { header: "Product ID", key: "id", width: 15 },
      { header: "Product Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 25 },
      { header: "Price", key: "price", width: 15 },
      { header: "Stock", key: "stock", width: 15 },
      { header: "Created At", key: "createdAt", width: 22 }
    ];

    products.forEach(product => {
      productsSheet.addRow({
        id: product.id,
        name: product.name,
        category: product.category.name,
        price: product.price,
        stock: product.Stock,
        createdAt: product.createdAt
      });
    });

    productsSheet.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm";

    styleHeader(productsSheet);

    // ===================================
    // 5. CUSTOMERS SHEET
    // ===================================

    const customersSheet = workbook.addWorksheet("Customers");

    customersSheet.columns = [
      { header: "Customer ID", key: "id", width: 15 },
      { header: "First Name", key: "firstname", width: 20 },
      { header: "Last Name", key: "lastname", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Verified", key: "verified", width: 15 }
    ];

    customers.forEach(customer => {
      customersSheet.addRow({
        id: customer.id,
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone || "Not provided",
        verified: customer.isVerified ? "Yes" : "No"
      });
    });

    styleHeader(customersSheet);

    // ===================================
    // 6. GENERATE EXCEL FILE
    // ===================================

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="e-co-dashboard.xlsx"'
    );

    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("Dashboard export error:", error);

    res.status(500).json({
      message: "Failed to export dashboard"
    });
  }
};
