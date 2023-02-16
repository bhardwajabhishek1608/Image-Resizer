import React, {useEffect, useRef} from 'react';
import {IconButton, Tooltip} from "@mui/material";
import {useState} from "react";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import {getResizedImage} from "../src/api/service"
import {FabricJSCanvas, useFabricJSEditor} from "fabricjs-react";
import {fabric} from 'fabric';
const Component = () => {
    const [image, setImage] = useState("");
    const [resizedImage,setResizedImage] = useState("");
    const [encoded,setEncoded] = useState();
    const [width,setWidth] = useState("");
    const [height,setHeight] = useState("");
    const [ogHeight,setOgHeight] = useState(0);
    const [ogWidth,setOgWidth] = useState(0);
    const { editor, onReady } = useFabricJSEditor();
    const [downloadedImage,setDownloadImage] = useState();
    const [cropImage, setCropImage] = useState(false);
    const [clip,setClip] = useState(false);
    const complete = useRef(false);
    var cropPoints = [];
    var cropLines = [];
    var positionsX =[];
    var positionsY =[];
    var coord = useRef([]);
    var polygon;
    var currImage;
    const cropFunction =() =>{
        setCropImage(true);
    }
    cropImage && editor.canvas.on("mouse:down", function (opt) {
        if(!complete.current){
            console.log("mouse down event",cropImage);
            var pointer = editor.canvas.getPointer(opt.e);
            var positionX = pointer.x;
            var positionY = pointer.y;
            positionsX.push(positionX);
            positionsY.push(positionY);
            // Add small circle as an indicative point
            var circlePoint = new fabric.Circle({
                radius: 3,
                fill: "black",
                left: positionX,
                top: positionY,
                selectable: false,
                originX: "center",
                originY: "center",
                hoverCursor: "auto"
            });
            editor.canvas.add(circlePoint);
            if(positionsX.length>1){
                if(positionX - positionsX[0]<3 && positionX - positionsX[0]>-3){
                    if(positionY - positionsY[0]<3 && positionY - positionsY[0]>-3){
                        setCropImage(false);
                        complete.current = true;
                        console.log("complete cycle detected",complete,cropImage);
                        circlePoint = new fabric.Circle({
                            radius: 3,
                            fill: "black",
                            left: positionsX[0],
                            top: positionsY[0],
                            selectable: false,
                            originX: "center",
                            originY: "center",
                            hoverCursor: "auto"
                        });
                    }
                }
            }
            // Store the points to draw the lines
            cropPoints.push(circlePoint);
            console.log(circlePoint.get("top"),circlePoint.get("left"));
            if (cropPoints.length > 1) {
                // Just draw a line using the last two points, so we don't need to clear
                // and re-render all the lines
                var startPoint = cropPoints[cropPoints.length - 2];
                var endPoint = cropPoints[cropPoints.length - 1];

                var cropLine = new fabric.Line(
                    [
                        startPoint.get("left"),
                        startPoint.get("top"),
                        endPoint.get("left"),
                        endPoint.get("top")
                    ],
                    {
                        stroke: "black",
                        strokeWidth: 1,
                        hasControls: false,
                        hasBorders: false,
                        selectable: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        hoverCursor: "default",
                        originX: "center",
                        originY: "center",
                        strokeDashArray: [5]
                    }
                );

                cropLines.push(cropLine);
                editor.canvas.add(cropLine);
                if(complete.current){
                    setCropImage(false);
                    console.log("entered complete cycle function");
                    editor.canvas.remove(...editor.canvas.getObjects());
                    var coordinates = [];
                    for(let i=0;i<positionsX.length;i++){
                        coordinates.push({x:positionsX[i],y:positionsY[i]})
                    }
                    coord.current = coordinates;
                    polygon = new fabric.Polygon(coordinates, {
                        fill: 'transparent',
                        stroke: 'red',
                        strokeWidth: 3,
                        selectable: false,
                    });
                    editor.canvas.add(polygon);
                    cropPoints = [];
                    cropLines = [];
                }
                if(complete.current){
                    setCropImage(false);
                }
            }
        }
    });
    const addBackground = () => {
        if (!editor || !fabric) {
            return;
        }

        fabric.Image.fromURL(
            `data:image/jpeg;base64,${resizedImage}`,
            (image) => {
                editor.canvas.setBackgroundImage(
                    image,
                    editor.canvas.renderAll.bind(editor.canvas)
                );
                currImage = image;
            }
        );
    };
    const clipFunction =()=>{
        currImage.selectable = true;
       const poly = new fabric.Polygon(coord.current, {fill: 'transparent',
           stroke: 'red',
           strokeWidth: 3, selectable : false});
       console.log(poly);
       // editor.canvas.remove(editor.canvas.backgroundImage);
       editor.canvas.add(currImage);
       editor.canvas.clipPath = poly;
       editor.canvas.remove(...editor.canvas.getObjects());
       setClip(true);
       setDownloadImage(editor.canvas.toDataURL("image/jpg"));
       console.log("clip downloaded",downloadedImage,typeof(downloadedImage));

    }
    const resetFunction =()=>{
        
    }
    useEffect(() => {
        if (!editor || !fabric) {
            return;
        }
        editor.canvas.setHeight(height);
        editor.canvas.setWidth(width);
        addBackground();
        editor.canvas.renderAll();
    }, [editor?.canvas.backgroundImage]);

    const onLoad = fileString => {
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
    const onResize = () => {
        //checking encoded
        console.log(encoded);
        const formData = new FormData();
        formData.append("image", encoded);
        formData.append("height", height);
        formData.append("width", width);
        getResizedImage(formData).then(r => {
            console.log("received", r, r.data);
            setResizedImage(r.data["image_string"].substring(2, r.data["image_string"].length - 1));
            setOgHeight(r.data["height"]);
            setOgWidth(r.data["width"]);
        });
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
                    {resizedImage && <div className="canvas"><FabricJSCanvas className="fabric-canvas" id = "output-canvas-area" onReady={onReady}/>
                        <label>Output Canvas</label>
                        <label>Original Dimensions are: {ogHeight} and {ogWidth}</label>
                        <label>New Dimensions are: {height} and {width}</label>
                    </div>}
                    {clip && <div className="blah"><img src={`data:image/jpeg;base64,${resizedImage}`} /></div>}
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
                {clip && <a href={downloadedImage} download="Resized Image"> <button disabled={!resizedImage} className="action-buttons">Download</button></a>}
                <button onClick={cropFunction} className="action-buttons">Crop</button>
                <button id={"clipFunc"} onClick={clipFunction} className="action-buttons">Clip</button>

            </div>
        </div>
    );
}

export default Component;