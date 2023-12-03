import axios from "axios";

const API_URL = 'https://api-sisogem.onrender.com/api'

export class UserService {
    static async getUserInfoByEmail (userEmail) {
        const { data } = await axios.post(`${API_URL}/user/email`, {
            email: userEmail
        })
        console.log(data)
        return data;
    }

    static async getUserByOrganismo (organimo) {
        const {data} = await axios.get(`${API_URL}/listUser/${organimo}`)
        return data;
    }
    

}
