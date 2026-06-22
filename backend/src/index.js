import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

const [{ connectDB }, { app }] = await Promise.all([
    import("./db/index.js"),
    import("./app.js"),
]);

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        })
    })
    .catch((error) => {
        console.error("MongoDB connection failed.", error);
        process.exit(1);
    });