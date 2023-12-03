import axios from "axios";

const API_URL = 'http://localhost:3001/api/'

export class OrganismoService {
    static async getAllOrganismos (userEmail) {
        const { data } = await axios.get(`${API_URL}/organismos`)
        return data;
    }
}
