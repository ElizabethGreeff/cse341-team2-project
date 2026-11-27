import mongoose from "mongoose";

const requiredString = () => ({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
});

const tripSchema = new mongoose.Schema(
    {
        id: {
            ...requiredString(),
            unique: true,
        },
        name: requiredString(),
        description: requiredString(),
        region: requiredString(),
        startStation: requiredString(),
        endStation: requiredString(),
        duration: requiredString(),
        distance: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isFinite,
                message: "distance must be a finite number",
            },
        },
        highlights: {
            type: [
                {
                    type: String,
                    required: true,
                    trim: true,
                    minlength: 1,
                },
            ],
            required: true,
            validate: {
                validator: (highlights) => highlights.length > 0,
                message: "highlights must contain at least one item",
            },
        },
        bestSeason: requiredString(),
        operatingMonths: {
            type: [
                {
                    type: Number,
                    min: 1,
                    max: 12,
                },
            ],
            required: true,
            validate: [
                {
                    validator: (months) =>
                        months.every(
                            (month) =>
                                Number.isInteger(month) && month >= 1 && month <= 12
                        ),
                    message: "operatingMonths must contain whole numbers from 1 to 12",
                },
                {
                    validator: (months) => months.length > 0,
                    message: "operatingMonths must contain at least one month",
                },
                {
                    validator: (months) => new Set(months).size === months.length,
                    message: "operatingMonths must not contain duplicates",
                },
            ],
        },
        imageUrl: {
            ...requiredString(),
            validate: {
                validator: (value) =>
                    typeof value === "string" &&
                    value.startsWith("/images/") &&
                    !value.split("/").some((segment) => segment === "." || segment === ".."),
                message: "imageUrl must be a same-origin path under /images/",
            },
        },
    },
    {
        collection: "trips",
    }
);

const trip = mongoose.model("Trip", tripSchema, "trips");

export default trip;
