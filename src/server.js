const express = require("express");
const cors = require("cors");
require("dotenv").config();

const printerRoutes = require("./routes/printer.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/printers", printerRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Paper Jam API is running!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
