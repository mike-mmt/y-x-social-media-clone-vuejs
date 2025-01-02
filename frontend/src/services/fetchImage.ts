import axios from "axios";

export async function fetchImage(url: string) {
    try {
        const response = await axios.get(url);
        if (response.status === 200 && response.headers["content-type"].startsWith("image")) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}