import axios from "axios";

const apiUrl = 'http://localhost:3000/api'

export async function getAuthToken(username: string, password: string): Promise<string> {
    try {
        const response = await axios.post(`${apiUrl}/auth/login`, {username, password})
        return response.data["Authorization"]
    } catch (error) {
        console.error(error)
        return ''
    }
}

export async function getForYouPosts(page: number, authToken: string) {
    try {
        const response = await axios.get(`${apiUrl}/posts/foryou`, {
            headers: {Authorization: `Bearer ${authToken}`},
            params: {page}
        })
        return response.data.map((post: any) => {
            return {...post, datePosted: new Date(post.datePosted)}
        })
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getFollowingPosts(page: number, authToken: string) {
    try {
        const response = await axios.get(`${apiUrl}/posts/followed`, {
            headers: {Authorization: `Bearer ${authToken}`},
            params: {page}
        });
        return response.data.map((post: any) => {
            return {...post, datePosted: new Date(post.datePosted)}
        })
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getPost(postId: string, authToken: string) {
    try {
        const response = await axios.get(`${apiUrl}/posts/id/${postId}`, {headers: {Authorization: `Bearer ${authToken}`}})
        return {...response.data, datePosted: new Date(response.data.datePosted)}
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function getReplies(postId: string, authToken: string) {
    try {
        const response = await axios.get(`${apiUrl}/posts/id/${postId}/replies`, {headers: {Authorization: `Bearer ${authToken}`}})
        return response.data.map((post: any) => {
            return {...post, datePosted: new Date(post.datePosted)}
        })
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function createPost(body: string, media: string, parent: string, authToken: string) {
    try {
        const data: any = {}
        if (parent) data["parent"] = parent
        if (body) data["body"] = body
        if (media) data["media"] = media
        const response = await axios.post(`${apiUrl}/posts`, data, {headers: {Authorization: `Bearer ${authToken}`}})
        return {...response.data, datePosted: new Date(response.data.datePosted)}
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function signUp(username: string, email: string, password: string, displayName: string) {
    try {
        const response = await axios.post(`${apiUrl}/users`, {username, email, password, displayName})
        return response.data
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function validateToken(authToken: string) {
    try {
        const response = await axios.post(`${apiUrl}/auth/validate`, null, {headers: {Authorization: `Bearer ${authToken}`}});
        return response.status === 200;
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function likePost(postId: string, authToken: string) {
    try {
        const response = await axios.post(`${apiUrl}/posts/id/${postId}/like`, null, {headers: {Authorization: `Bearer ${authToken}`}})
        return response.status === 200;
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function unlikePost(postId: string, authToken: string) {
    try {
        const response = await axios.post(`${apiUrl}/posts/id/${postId}/unlike`, null, {headers: {Authorization: `Bearer ${authToken}`}})
        return response.status === 200;
    } catch (error) {
        console.error(error)
        return false
    }
}