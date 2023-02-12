import axios from "axios";

const baseUrl = "http://localhost:9000/resizer";

export const getResizedImage = async(formData) => {

    try{
        console.log("checking received formData",formData);
        const resizedImageRes = await axios.post(baseUrl, formData,
            {headers : {'content-type': 'multipart/form-data'}}).then(r => {return r}).catch(err => {
         throw err;
        });
        return resizedImageRes;
    }catch(err){
        throw err;
    }

}
