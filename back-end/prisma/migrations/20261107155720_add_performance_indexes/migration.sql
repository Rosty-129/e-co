-- CreateIndex
CREATE INDEX "CartItem_cartid_productid_idx" ON "CartItem"("cartid", "productid");

-- CreateIndex
CREATE INDEX "CartItem_productid_idx" ON "CartItem"("productid");

-- CreateIndex
CREATE INDEX "Category_createdAt_id_idx" ON "Category"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Order_userid_createdAt_id_idx" ON "Order"("userid", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_id_idx" ON "Order"("status", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Order_createdAt_id_idx" ON "Order"("createdAt", "id");

-- CreateIndex
CREATE INDEX "OrderItem_orderid_idx" ON "OrderItem"("orderid");

-- CreateIndex
CREATE INDEX "OrderItem_productid_idx" ON "OrderItem"("productid");

-- CreateIndex
CREATE INDEX "Product_categoryid_createdAt_id_idx" ON "Product"("categoryid", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Product_createdAt_id_idx" ON "Product"("createdAt", "id");

-- CreateIndex
CREATE INDEX "ProductPhoto_productid_idx" ON "ProductPhoto"("productid");

-- CreateIndex
CREATE INDEX "Review_userid_createdAt_id_idx" ON "Review"("userid", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Review_productid_createdAt_id_idx" ON "Review"("productid", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Review_createdAt_id_idx" ON "Review"("createdAt", "id");
