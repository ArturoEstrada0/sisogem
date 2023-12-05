import axios from 'axios'

const API_URL = 'http://localhost:3001/organismo'

export class OrganismoService {
  static async getAllOrganismos(userEmail) {
    const { data } = await axios.get(API_URL)
    return data
  }
}
