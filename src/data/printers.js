const printers = [
    {
        id: "P1",
        type: "BW",
        speed: 30,
        status: "AVAILABLE"
    },
    {
        id: "P2",
        type: "BW",
        speed: 20,
        status: "AVAILABLE",
        bufferSlots: [
            { startTime: "11:00", endTime: "11:20" },
            { startTime: "14:00", endTime: "14:20" }
        ]
    },
    {
        id: "P3",
        type: "COLOR",
        speed: 10,
        status: "AVAILABLE"
    }
];

module.exports = printers;