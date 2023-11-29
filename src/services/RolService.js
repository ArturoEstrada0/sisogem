import axios from "axios";

const API_URL = 'http://localhost:3001/api/'

export class RolService {
    static async getAllRoles (userEmail) {
        const { data } = await axios.get(`${API_URL}/roles`)
        return data;
    }
}
