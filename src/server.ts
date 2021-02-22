import express from "express";

const app = express();

app.get("/", (request, response) => {
	return response.json({ message: "Hello World - NLW04" });
});

app.post("/", (request, response) => {
	// Save data
	return response.json({ message: "The data has been saved" });
});

app.listen(3333, () => console.log("Server is running!"));
