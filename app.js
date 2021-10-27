const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "product.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    productId: dbObject.product_id,
    productName: dbObject.product_name,
    itemNumber: dbObject.item_number,
  };
};

app.get("/products/", async (request, response) => {
  const getProductsQuery = `
    SELECT
      *
    FROM
      product;`;
  const productsArray = await database.all(getProductsQuery);
  response.send(
    productsArray.map((eachProduct) =>
      convertDbObjectToResponseObject(eachProduct)
    )
  );
});

app.get("/products/:productId/", async (request, response) => {
  const { productId } = request.params;
  const getProductQuery = `
    SELECT 
      * 
    FROM 
      product 
    WHERE 
      product_id = ${productId};`;
  const product = await database.get(getProductQuery);
  response.send(convertDbObjectToResponseObject(product));
});

app.post("/products/", async (request, response) => {
  const { productName, itemNumber } = request.body;
  const postProductQuery = `
  INSERT INTO
    product (product_name, item_number)
  VALUES
    ('${productName}', ${itemNumber};`;
  const product = await database.run(postProductQuery);
  response.send("Product Added to Team");
});

app.put("/products/:productId/", async (request, response) => {
  const { productName, itemNumber } = request.body;
  const { productId } = request.params;
  const updateProductQuery = `
  UPDATE
    product
  SET
    product_name = '${productName}',
    item_number = ${itemNumber},
  WHERE
    product_id = ${productId};`;

  await database.run(updateProductQuery);
  response.send("Product Details Updated");
});

app.delete("/products/:productId/", async (request, response) => {
  const { productId } = request.params;
  const deleteProductQuery = `
  DELETE FROM
    product
  WHERE
    product_id = ${productId};`;
  await database.run(deleteProductQuery);
  response.send("Product Removed");
});
module.exports = app;
