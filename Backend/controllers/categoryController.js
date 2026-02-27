import Category from "../models/categoryModel.js";

export const getCategoriesController = async (request, response) => {
    try {
        const data = await Category.find({ isActive: true }).sort({ createdAt: 1 });

        return response.json({
            message: "Category list",
            error: false,
            success: true,
            data: data
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const createCategoryController = async (request, response) => {
    // ... (existing code)
};

export const seedCategoriesController = async (request, response) => {
    try {
        const categories = [
            { id: 'agarbatti', name: 'Agarbatti & Dhoop', icon: '🕯️' },
            { id: 'murti', name: 'Idols & Murti', icon: '🕉️' },
            { id: 'diya', name: 'Diya & Oil', icon: '🪔' },
            { id: 'samagri', name: 'Pujan Samagri', icon: '🥣' },
            { id: 'flowers', name: 'Flowers & Garlands', icon: '🌸' },
            { id: 'books', name: 'Spiritual Books', icon: '📖' },
            { id: 'vessels', name: 'Puja Vessels', icon: '🏺' },
            { id: 'decor', name: 'Temple Decor', icon: '🏮' },
        ];

        await Category.deleteMany({}); // Clear existing
        const data = await Category.insertMany(categories);

        return response.json({
            message: "Categories seeded successfully",
            error: false,
            success: true,
            data: data
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
