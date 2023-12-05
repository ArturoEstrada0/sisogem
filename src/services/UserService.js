import axios from 'axios'

const API_URL = 'http://localhost:3001/user'

export class UserService {
  static async getUserInfoByEmail(userEmail) {
    const { data } = await axios.post(`${API_URL}/email`, {
      email: userEmail,
    })
    console.log(data)
    return data
  }

  static async getUserByOrganismo(organimo) {
    const { data } = await axios.get(`${API_URL}/listUser/${organimo}`)
    return data
  }

  static async saveUser(userData) {
    const { data } = await axios.post(`${API_URL}/create-user`, userData)
    return data
  }
}
