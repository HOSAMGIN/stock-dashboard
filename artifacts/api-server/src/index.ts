import app from "./app.js";

export default app;

if (process.env["NODE_ENV"] !== "production") {
  const port = Number(process.env["PORT"] || 3000);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
