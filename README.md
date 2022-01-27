## node-red-contrib-colorspace

#### Node-RED Node, that helps conver colors

node-red-contrib-colorspace imports into NodeRed the conversion from npm packages color-convert and color-temperature

Please note that color temperature is a extimation! It's very usefull to emulate color temperature in RGB lamps, but the values are not 100% accurate.

### Install

Just run

```
    npm install node-red-contrib-colorspace
```

### Usage

This node recives any of the supported color spaces (RGB, RGBW, HSV, HSI, HEX, HSL, HWB, CMYK, ANSI, XYZ, LAB, LCH, Color Name, HCG, GARY, Color Temperature) and returns all of the other)

Return

```
{
   "rgb":{
      "red":140,
      "green":200,
      "blue":100
   },
   "rgbw":{
      "red":40,
      "green":94,
      "blue":0,
      "white":100
   },
   "hsi":{
      "hue":95,
      "staturation":31,
      "intensity":57
   },
   "hsv":{
      "hue":96,
      "staturation":50,
      "brightness":78
   },
   "hex":"8CC864",
   "hsl":{
      "hue":96,
      "staturation":48,
      "lightness":59
   },
   "hwb":{
      "hue":96,
      "whiteness":39,
      "blackness":22
   },
   "cmyk":{
      "cyan":30,
      "magenta":0,
      "yellow":50,
      "black":22
   },
   "ansi16":93,
   "xyz":{
      "x":34,
      "y":48,
      "z":20
   },
   "lab":{
      "longitude":75,
      "latitude":-37,
      "altitude":44
   },
   "lch":{
      "lightness":75,
      "chroma":57,
      "hue":130
   },
   "keyword":"darkseagreen",
   "hcg":{
      "hue":96,
      "chroma":39,
      "grayness":65
   },
   "gray":[
      58
   ],
   "rgbi":9226340,
   "temperature":4429
}
```

### How to use

You can send in the payload one of the types supported

You can send

RGB

```
{
    "payload":{
        "rgb": {
            "red": 255,
            "green": 10,
            "blue": 20
        }
    }
}
```

RGBW

```
{
    "payload":{
        "rgbw": {
            "red": 40,
            "green": 94,
            "blue": 0,
            "white": 100
        }
    }
}
```

HSI

```
{
    "payload":{
        "hsi": {
            "hue": 95,
            "staturation": 31,
            "intensity": 57
        }
    }
}
```

HSV

```
{
    "payload":{
        "hsv": {
            "hue": 358,
            "staturation": 96,
            "brightness": 100
        }
    }
}
```

HSL

```
{
    "payload":{
        "hsl": {
            "hue": 358,
            "staturation": 96,
            "lightness": 52
        }
    }
}
```

HWB

```
{
    "payload":{
        "hwb": {
            "hue": 358,
            "whiteness": 4,
            "blackness": 0
        }
    }
}
```

CMYK

```
{
    "payload":{
        "cmyk": {
            "cyan": 0,
            "magenta": 96,
            "yellow": 92,
            "black": 0
        }
    }
}
```

XYZ

```
{
    "payload":{
        "xyz": {
            "x": 41,
            "y": 22,
            "z": 3
        }
    }
}
```

HEX

```
{
    "payload":{
        "hex": "FF0A14"
    }
}
```

Temperature

```
{
    "payload":{
        "temperatute": 5000
    }
}
```

Keyword

```
{
    "payload":{
        "keyword": "red"
    }
}
```

Direct Payload

```
{
    "payload": "red"
}
```

Direct Color Name in Payload

```
{
    "payload": "red"
}
```

Direct Color Temperature Name in Payload

```
{
    "payload": "daylight"
}
```
