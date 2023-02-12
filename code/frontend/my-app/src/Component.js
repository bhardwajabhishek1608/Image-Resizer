import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import {useState} from "react";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import {getResizedImage} from "./service";

const Component = () => {
    const [image, setImage] = useState("");
    const [resizedImage,setResizedImage] = useState();
    const [encoded,setEncoded] = useState();
    const [width,setWidth] = useState("");
    const [height,setHeight] = useState("");

    const onLoad = fileString => {
        console.log(fileString);
        setEncoded(fileString);
    };
    const base64Encoder = file => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            onLoad(reader.result);
        };
    };
    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setImage(URL.createObjectURL(event.target.files[0]));
            base64Encoder(event.target.files[0]);
            console.log("dimensions",event.target.files[0],URL.createObjectURL(event.target.files[0]));
        }
    };
    const onResize = ()=>{
        //checking encoded
        console.log(encoded);
        const formData = new FormData();
        formData.append("image",encoded);
        formData.append("height",height);
        formData.append("width",width);
        getResizedImage(formData).then(r  =>{console.log(r);setResizedImage(r.data.substring(2,r.data.length-1))});
    }
    const handleChangeWidth = (event) => {
        setWidth(event.target.value);
    };
    const handleChangeHeight = (event) => {
        setHeight(event.target.value);
    };
    return (

            <div className="app">
                <div className="app-header">
                    <IconButton className="icon">
                        <AspectRatioIcon />
                    </IconButton>
                    <h2 style={{padding:"0px 10px"}}>Image Resizer</h2>
                </div>
                <div className = "center-body">
                    {!image &&
                        <div className="content">
                            <h1 style={{padding:"0px",fontSize:"40px",paddingBottom:"0px"}}>Welcome to Image Resizer Tool !</h1>
                            <h2 style={{padding:"0px",paddingBottom:"0px"}}>Resize any image in 3 simple steps</h2>
                            <h3>
                                <ul>
                                    <li>Click on choose file button to upload an image.</li>
                                    <li>Enter width and height for the new image.</li>
                                    <li>Once you have entered valid width and height, Resize button will be enabled.</li>
                                    <li>Click on Resize button to generate the image.</li>
                                    <li>You can download the newly generated image using Download Button.</li>
                                </ul>
                            </h3>
                        </div>}
                    <div style={{display:"flex",flexDirection:"row",margin:"10px"}}>
                        {image && <div className="canvas"><img src={image}/><label>Input Canvas</label></div>}
                        {resizedImage && <div className="canvas"><img src={`data:image/jpeg;base64,${resizedImage}`}/><label>Output Canvas</label></div>}
                    </div>
                </div>
                <div className="app-footer">
                    <input type="file" onChange={onImageChange} style={{width:"250px",padding:"10px",margin:"20px",height:"40px",fontSize:"18px"}}></input>
                    <label>Height</label>
                    <input className="inputs" onChange={handleChangeHeight}/>
                    <label>Pixels</label>
                    <label>Width</label>
                    <input className="inputs" onChange={handleChangeWidth}/>
                    <label>Pixels</label>
                    <button onClick={onResize} disabled={!(Number(width)>0 && Number(height) >0)} className="action-buttons">Resize</button>
                    <a href={`data:image/jpeg;base64,${resizedImage}`} download="Resized Image"> <button disabled={!resizedImage} className="action-buttons">Download</button></a>
                </div>
            </div>
    );
}

export default Component;