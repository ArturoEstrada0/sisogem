import axios from 'axios'

const API_URL = 'https://api-sisogem2.onrender.com/organismo'

export class OrganismoService {
  static async getAllOrganismos(userEmail) {
    const { data } = await axios.get(API_URL)
    return data
  }
}
