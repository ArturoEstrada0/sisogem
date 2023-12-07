import axios from 'axios'

const API_URL = 'https://api-sisogem2.onrender.com'

export class RolService {
  static async getAllRoles(userEmail) {
    const { data } = await axios.get(`${API_URL}/rol`)
    return data
  }
}
