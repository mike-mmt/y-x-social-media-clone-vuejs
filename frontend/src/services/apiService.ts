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
        console.log("axios", response.data)
        return response.data.map((post: any) => { return {...post, datePosted: new Date(post.datePosted)} })
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getPost(postId: string, authToken: string) {
    try {
        const response = await axios.get(`${apiUrl}/posts/id/${postId}`, {headers: {Authorization: `Bearer ${authToken}`}})
        console.log("axios", response.data)
        return {...response.data, datePosted: new Date(response.data.datePosted)}
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function getReplies(postId: string, authToken: string) {
    try {
        const response = await axios.get(`${apiUrl}/posts/id/${postId}/replies`, {headers: {Authorization: `Bearer ${authToken}`}})
        return response.data.map((post: any) => { return {...post, datePosted: new Date(post.datePosted)} })
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
        console.log("axios", response.data)
        return {...response.data, datePosted: new Date(response.data.datePosted)}
    } catch (error) {
        console.error(error)
        return null
    }
}