const ColorConverter = require('color-convert');
const ColorTemperature = require('color-temperature');

module.exports = function(RED) {
    function ColorConverterNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.target = config.target || "payload";

        this.temperatures = {
            "9000":"deepshade",
            "7500":"lightshade",
            "6500":"snow",
            "6100":"ivory",
            "6000":"cloudy",
            "5000":"daylight",
            "4000":"coolwhite",
            "3000":"warmwhite",
            "2700":"incandescent",
            "2000":"candlelight"
        };

        this.colors = {
            "rgb":["red","green","blue"],
            "hsv":['hue',"saturation","brightness"],
            "hex":"",
            "hsl":['hue',"saturation","lightness"],
            "hwb":['hue',"whiteness","blackness"],
            "cmyk":['cyan','magenta','yellow','black'],
            "ansi16":"",
            "ansi254": "",
            "xyz":['x','y','z'],
            "lab":["longitude","latitude","altitude"],
            "lch":["lightness","chroma","hue"],
            "keyword":"",
            "hcg":['hue','chroma','grayness'],
            "gray":"",
            "temperature": ""
        };

        this.default_color = function (comp,col) {
            switch (comp) {
                case "rgb":
                    //RGB
                    if(col.rgb !== undefined && col.rgb.red === undefined && col.rgb.green === undefined && col.rgb.blue === undefined)
                        delete col.rgb;

                    if(col.rgb !== undefined && col.rgb.red === undefined)
                        col.rgb.red = 0;
    
                    if(col.rgb !== undefined && col.rgb.green === undefined)
                        col.rgb.green = 0;
      
                    if(col.rgb !== undefined && col.rgb.blue === undefined)
                        col.rgb.blue = 0;
    
                    if(col.rgb !== undefined)
                        return this.color_converter("rgb",col);
                break;

                case "hex":
                    if(col.hex === undefined)
                        delete col.hex;
                    else   
                        return this.color_converter("hex",col);
                break;
                    
                case "hsv":
                    //HSV
                    if(col.hsv !== undefined && col.hsv.hue === undefined && col.hsv.saturation === undefined && col.hsv.brightness === undefined)
                        delete col.hsv;

                    if(col.hsv !== undefined && col.hsv.hue === undefined)
                        delete col.hsv;
                    
                    if(col.hsv !== undefined && col.hsv.saturation === undefined)
                        col.hsv.saturation = 100;
                        
                    if(col.hsv !== undefined && col.hsv.brightness === undefined)
                        col.hsv.brightness = 100;

                    if(col.hsv !== undefined)
                        return this.color_converter("hsv",col);
                break;   
                    
                case "hsl":
                    //HSL
                    if(col.hsl !== undefined && col.hsl.hue === undefined && col.hsl.saturation === undefined && col.hsl.lightness === undefined)
                        delete col.hsl;

                    if(col.hsl !== undefined && col.hsl.hue === undefined)
                        delete col.hsl;
                    
                    if(col.hsl !== undefined && col.hsl.saturation === undefined)
                        col.hsl.saturation = 100;
                        
                    if(col.hsl !== undefined && col.hsl.lightness === undefined)
                        col.hsl.lightness = 100;

                    if(col.hsl !== undefined)
                        return this.color_converter("hsl",col);
                break;
            }

            delete col[comp];
            return col;
        }

        this.color_converter = function(main,col){

            main_color = main;

            rcolor = JSON.parse(JSON.stringify(col));

            param = [];

            //Basic Convertrs
            if(main_color === "temperature"){
                rcolor['rgb'] = ColorTemperature.colorTemperature2rgb(col.temperature);
                rcolor['temperature'] = col.temperature;
                main_color = 'rgb';
            }else if(main_color === "keyword"){
                for( cname in this.temperatures){
                    if(this.temperatures[cname] === rcolor.keyword){
                        rcolor['rgb'] = ColorTemperature.colorTemperature2rgb(cname);
                        rcolor['temperature'] = parseInt(cname);
                        main_color = 'rgb';
                        delete (rcolor.keyword);
                        break;
                    }
                }

                if(rcolor.keyword !== undefined){
                    rgb = ColorConverter.keyword.rgb(rcolor.keyword);
                    if(rgb !== undefined){
                        rcolor.rgb = {};
                        rcolor.rgb.red   = rgb[0];
                        rcolor.rgb.green = rgb[1];
                        rcolor.rgb.blue  = rgb[2];
                        main_color = 'rgb';
                    }else{
                        return {};  
                    }
                }   
            }else{
                delete rcolor.temperature;
                delete rcolor.keyword;
            }

            if(Array.isArray(this.colors[main_color])){
                for(i in this.colors[main_color]){
                    comp = this.colors[main_color][i];
                    param.push(rcolor[main_color][comp]);
                }
            }else{
                param.push(rcolor[main_color]);
            }

            for(c in this.colors){
                if(c === main_color)
                    continue;

                if(c === "temperature")
                    continue;

                delete rcolor[c];

                if(ColorConverter[main_color] === undefined || ColorConverter[main_color][c] === undefined)
                    continue;
                
                data = ColorConverter[main_color][c](param);

                if(data === undefined)
                    continue;
                
                if(Array.isArray(this.colors[c])){
                    rcolor[c] = {};
                    for(i in this.colors[c]){
                        comp = this.colors[c][i];
                        rcolor[c][comp] = data[i];
                    }
                }else{
                    rcolor[c] = data;
                }
            } 

            return rcolor;
        }   

        this.on('input', function(msg, send, done) {

            // NPM module exposed as variable, npm_module
            if(msg.payload === undefined)
                msg.payload = {};

            var c = RED.util.getMessageProperty(msg,this.target);

            if(c === undefined)
                c = {};

            //Direct Color Code
            if(typeof c == "string"){
                field = c;
                c = {};
                c.keyword = field;
            }


            full_converter = "";

            //Find Complete Color Space
            for(var color in this.colors){

                //If no Color Space Continue;
                if(c[color] === undefined)
                    continue;

                //Check If Converter
                if(this.colors[color] === undefined)
                    continue;

                full_converter = "";

                if(Array.isArray(this.colors[color])){
                    for(i in this.colors[color]){
                        comp = this.colors[color][i];
                        if(c[color][comp] === undefined){
                            full_converter = "";
                            break; 
                        }
                        full_converter = color;
                    }

                    if(full_converter !== "") //Found on full match
                        break;
                }else if(c[color] !== undefined && c[color] !== ""){
                    full_converter = color;
                    break;
                }
            }

            rcolor = {};

            if(full_converter !== ""){
                //Found Full Converter
                rcolor = this.color_converter(full_converter,c);
            }else{
                //Try to Default
                for(color in this.colors){
                    c = this.default_color(color,c);
                    if(c[color] !== undefined){
                        rcolor = c; 
                        break;
                    }
                }
            }

            if(typeof rcolor !== "object")
                rcolor = {};


            //Extra Convertions
            if(rcolor.rgb !== undefined && rcolor.rgb.red !== undefined && rcolor.rgb.green !== undefined && rcolor.rgb.blue !== undefined){
                rcolor.rgbi = (rcolor.rgb.red * 65536) + (rcolor.rgb.green * 256) + (rcolor.rgb.blue);
                
                if(rcolor.temperature === undefined)
                rcolor.temperature = ColorTemperature.rgb2colorTemperature(rcolor.rgb);

                if(this.temperatures[rcolor.temperature] !== undefined)
                rcolor.keyword = this.temperatures[rcolor.temperature];

            }

            RED.util.setMessageProperty(msg, this.target, rcolor);

            //Return Message
            send = send || function() { node.send.apply(node,arguments) }
            send(msg);

            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType("node-red-contrib-colorspace",ColorConverterNode);
}