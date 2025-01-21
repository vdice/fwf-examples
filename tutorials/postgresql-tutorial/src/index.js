import { Router, Variables, Postgres } from "@fermyon/spin-sdk";
import { v4 as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';
const decoder = new TextDecoder();
const router = Router();

router.post("/products", async (_, req, res, extras) => createProduct(await req.arrayBuffer(), extras[0], res));
router.get("/products", (_, _req, res, extras) => readAllProducts(extras[0], res));
router.get("/products/:id", ({ params }, _req, res, extras) => readProductById(params.id, extras[0], res));
router.put("/products/:id", async ({ params }, req, res, extras) => updateProductById(params.id, await req.arrayBuffer(), extras[0], res));
router.delete("/products/:id", ({ params }, _req, res, extras) => deleteProductById(params.id, extras[0], res));
router.all("*", (_, _req, res) => notFound("Endpoint not found", res));

export async function handler(req, res) {
  const connectionString = Variables.get("pg_connection_string");
  if (!connectionString) {
    res.status(500);
    res.set(DEFAULT_HEADERS);
    res.send(JSON.stringify({
      message: "Connection String not specified"
    }));
    return;
  }
  await router.handleRequest(req, res, connectionString)
}

const SQL_CREATE = "INSERT INTO Products (Id, Name, Price) VALUES ($1, $2, $3)";
const SQL_READ_ALL = "SELECT Id, Name, Price from Products ORDER BY Name";
const SQL_READ_BY_ID = "SELECT Id, Name, Price from Products WHERE Id = $1";
const SQL_UPDATE_BY_ID = "UPDATE Products SET Name = $1, Price = $2 WHERE Id = $3";
const SQL_DELETE_BY_ID = "DELETE FROM Products WHERE Id = $1";

const DEFAULT_HEADERS = {
  "content-type": "application/json"
};

function badRequest(message, res) {
  res.status(400);
  res.set(DEFAULT_HEADERS);
  res.send(JSON.stringify({ message }));
}

function notFound(message, res) {
  res.status(404);
  res.set(DEFAULT_HEADERS);
  res.send(JSON.stringify({ message }));
}

function readAllProducts(connectionString, res) {
  const connection = Postgres.open(connectionString);
  let result = connection.query(SQL_READ_ALL, []);
  let items = result.rows.map(row => {
    return {
      id: row["id"],
      name: row["name"],
      price: +row["price"]
    };
  });
  res.status(200);
  res.set(DEFAULT_HEADERS);
  res.send(JSON.stringify(items));
}

function readProductById(id, connectionString, res) {
  if (!uuidValidate(id)) {
    return badRequest("Invalid identifier received via URL", res);
  }
  let connection = Postgres.open(connectionString);
  let result = connection.query(SQL_READ_BY_ID, [id]);
  if (result.rows.length == 0) {
    return notFound("Product not found");
  }
  let found = {
    id: result.rows[0]["id"],
    name: result.rows[0]["name"],
    price: +result.rows[0]["price"]
  };
  res.status(200);
  res.set(DEFAULT_HEADERS);
  res.send(JSON.stringify(found));
}

function createProduct(requestBody, connectionString, res) {
  let payload = JSON.parse(decoder.decode(requestBody));
  if (!payload || !payload.name || typeof payload.price != "number") {
    return badRequest("Invalid payload received. Expecting {\"name\":\"some name\", \"price\": 9.99}", res);
  }

  const newProduct = {
    id: uuidv4(),
    name: payload.name,
    price: payload.price
  };

  const connection = Postgres.open(connectionString);
  connection.execute(SQL_CREATE, [newProduct.id, newProduct.name, newProduct.price]);

  let customHeaders = {
    "Location": `/products/${newProduct.id}`
  };
  Object.assign(customHeaders, DEFAULT_HEADERS);

  res.status(201);
  res.set(customHeaders);
  res.send(JSON.stringify(newProduct));
}

function updateProductById(id, requestBody, connectionString, res) {
  if (!uuidValidate(id)) {
    return badRequest("Invalid identifier received via URL", res);
  }
  let payload = JSON.parse(decoder.decode(requestBody));
  if (!payload || !payload.name || typeof payload.price != "number") {
    return badRequest("Invalid payload received. Expecting {\"name\":\"some name\", \"price\": 9.99}", res);
  }

  const product = {
    id: id,
    name: payload.name,
    price: payload.price
  };
  const connection = Postgres.open(connectionString);
  const updatedRows = connection.execute(SQL_UPDATE_BY_ID, [product.name, product.price, product.id]);
  if (updatedRows == 0) {
    return notFound("Product not found", res);
  }
  let customHeaders = {
    "Location": `/items/${id}`
  }
  Object.assign(customHeaders, DEFAULT_HEADERS);

  res.status(200);
  res.set(customHeaders);
  res.send(JSON.stringify(product));
}

function deleteProductById(id, connectionString, res) {
  if (!uuidValidate(id)) {
    return badRequest("Invalid identifier received via URL", res);
  }
  const connection = Postgres.open(connectionString);
  const deletedRows = connection.execute(SQL_DELETE_BY_ID, [id]);
  if (deletedRows == 0) {
    return notFound("Product not found", res);
  }
  res.status(204);
  res.set(DEFAULT_HEADERS);
  res.end();
}

