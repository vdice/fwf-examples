# Tutorial: Querying relational Databases

This folder contains the sample application written as part of the [Querying relational Databases](https://wasm-functions.fermyon.app/fermyon-wasm-functions/querying-relational-database) tutorial.

## Prerequisites

You need the following tools on your machine, to build, run and deploy the application to _Fermyon Wasm Functions_:

- The `spin` CLI
- Node.js (Version `20` or later)
- The `aka` plugin for `spin` CLI
- Access to a PostgreSQL database server (As part of the tutorial, we're using NEON's free tier)
- Access to _Fermyon Wasm Functions_


## SQL Scripts

To provision the necessary `Products` table, use the following SQL command:

```sql
CREATE TABLE IF NOT EXISTS Products (
  Id varchar(36) PRIMARY KEY,
  Name TEXT NOT NULL,
  Price DOUBLE PRECISION
);
```

Use the following SQL commands to seed sample data:

```sql
INSERT INTO Products (Id, Name, Price)
SELECT 'faac630e-a645-4459-9d7e-751df4016a6e', 'V-Neck T-Shirt', 19.99
WHERE NOT EXISTS (SELECT Id FROM Products WHERE Id = 'faac630e-a645-4459-9d7e-751df4016a6e');

INSERT INTO Products (Id, Name, Price)
SELECT 'c01dce8a-3a50-4ef6-a0f1-7f9f48a238c8', 'Hoodie with Logo', 79.99
WHERE NOT EXISTS (SELECT Id FROM Products WHERE Id = 'c01dce8a-3a50-4ef6-a0f1-7f9f48a238c8');

INSERT INTO Products (Id, Name, Price) 
SELECT 'f062dc2-bbf2-4c6c-8169-3511462cd54b', 'Belt', 14.99
WHERE NOT EXISTS (SELECT Id FROM Products WHERE Id = '6f062dc2-bbf2-4c6c-8169-3511462cd54b');
```

## Building the Spin Application

Once you've cloned the repository, move into the tutorial folder ([./tutorials/postgresql-tutorial](./tutorials/postgresql-tutorial)), install the dependencies using `npm` and run `spin build`:

```console
cd tutorials/postgresql-tutorial

npm install

spin build
```

