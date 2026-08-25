import Api from "../../utils/axios";

export const getCurrentUser = async () => {
    try {
        const { data } = await Api.get("/api/me");
        console.log(data);
        return data; // <-- Data return karna zaroori hai
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error; // Error ko upar bhejna taaki caller handle kar sake
    }
};