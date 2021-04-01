const ColorConverter = require("color-convert");
const ColorTemperature = require("color-temperature");

module.exports = function exports(RED) {
  function ColorConverterNode(config) {
    var node;

    RED.nodes.createNode(this, config);

    node = this;
    this.target = config.target || "payload";

    this.temperatures = {
      9000: "deepshade",
      7500: "lightshade",
      6500: "snow",
      6100: "ivory",
      6000: "cloudy",
      5000: "daylight",
      4000: "coolwhite",
      3000: "warmwhite",
      2700: "incandescent",
      2000: "candlelight",
    };

    this.colors = {
      rgb: ["red", "green", "blue"],
      hsv: ["hue", "saturation", "brightness"],
      hex: "",
      hsl: ["hue", "saturation", "lightness"],
      hwb: ["hue", "whiteness", "blackness"],
      cmyk: ["cyan", "magenta", "yellow", "black"],
      ansi16: "",
      ansi254: "",
      xyz: ["x", "y", "z"],
      lab: ["longitude", "latitude", "altitude"],
      lch: ["lightness", "chroma", "hue"],
      keyword: "",
      hcg: ["hue", "chroma", "grayness"],
      gray: "",
      temperature: "",
    };

    this.defaultColor = function defaultColor(comp, col) {
      var colRet = col;

      switch (comp) {
        case "rgb":
          // RGB
          if (colRet.rgb !== undefined && colRet.rgb.red === undefined && colRet.rgb.green === undefined && colRet.rgb.blue === undefined) delete colRet.rgb;

          if (colRet.rgb !== undefined && colRet.rgb.red === undefined) colRet.rgb.red = 0;

          if (colRet.rgb !== undefined && colRet.rgb.green === undefined) colRet.rgb.green = 0;

          if (colRet.rgb !== undefined && colRet.rgb.blue === undefined) colRet.rgb.blue = 0;

          if (colRet.rgb !== undefined) return this.colorConverter("rgb", col);
          break;

        case "hex":
          if (colRet.hex === undefined) delete colRet.hex;
          else return this.colorConverter("hex", colRet);
          break;

        case "hsv":
          // HSV
          if (colRet.hsv !== undefined && colRet.hsv.hue === undefined && colRet.hsv.saturation === undefined && colRet.hsv.brightness === undefined) delete colRet.hsv;

          if (colRet.hsv !== undefined && colRet.hsv.hue === undefined) delete colRet.hsv;

          if (colRet.hsv !== undefined && colRet.hsv.saturation === undefined) colRet.hsv.saturation = 100;

          if (colRet.hsv !== undefined && colRet.hsv.brightness === undefined) colRet.hsv.brightness = 100;

          if (colRet.hsv !== undefined) return this.colorConverter("hsv", colRet);
          break;

        case "hsl":
          // HSL
          if (colRet.hsl !== undefined && colRet.hsl.hue === undefined && colRet.hsl.saturation === undefined && colRet.hsl.lightness === undefined) delete colRet.hsl;

          if (colRet.hsl !== undefined && colRet.hsl.hue === undefined) delete colRet.hsl;

          if (colRet.hsl !== undefined && colRet.hsl.saturation === undefined) colRet.hsl.saturation = 100;

          if (colRet.hsl !== undefined && colRet.hsl.lightness === undefined) colRet.hsl.lightness = 100;

          if (colRet.hsl !== undefined) return this.colorConverter("hsl", col);
          break;
        default:
        // Do Nothing
      }

      delete colRet[comp];
      return colRet;
    };

    this.colorConverter = function colorConverter(main, col) {
      var mainColor = main;
      var rcolor = JSON.parse(JSON.stringify(col));
      var param = [];

      // Basic Convertrs
      if (mainColor === "temperature") {
        rcolor.rgb = ColorTemperature.colorTemperature2rgb(col.temperature);
        rcolor.temperature = col.temperature;
        mainColor = "rgb";
      } else if (mainColor === "keyword") {
        for (const cname in this.temperatures) {
          if (this.temperatures[cname] === rcolor.keyword) {
            rcolor.rgb = ColorTemperature.colorTemperature2rgb(cname);
            rcolor.temperature = parseInt(cname, 10);
            mainColor = "rgb";
            delete rcolor.keyword;
            break;
          }
        }

        if (rcolor.keyword !== undefined) {
          const rgb = ColorConverter.keyword.rgb(rcolor.keyword);
          if (rgb !== undefined) {
            rcolor.rgb = {};
            [rcolor.rgb.red, rcolor.rgb.green, rcolor.rgb.blue] = rgb;
            mainColor = "rgb";
          } else {
            return {};
          }
        }
      } else {
        delete rcolor.temperature;
        delete rcolor.keyword;
      }

      if (Array.isArray(this.colors[mainColor])) {
        for (const i in this.colors[mainColor]) {
          const comp = this.colors[mainColor][i];
          param.push(rcolor[mainColor][comp]);
        }
      } else {
        param.push(rcolor[mainColor]);
      }

      for (const c in this.colors) {
        if (c === mainColor) continue;

        if (c === "temperature") continue;

        delete rcolor[c];

        if (ColorConverter[mainColor] === undefined || ColorConverter[mainColor][c] === undefined) continue;

        const data = ColorConverter[mainColor][c](param);

        if (data === undefined) continue;

        if (Array.isArray(this.colors[c])) {
          rcolor[c] = {};
          for (const i in this.colors[c]) {
            const comp = this.colors[c][i];
            rcolor[c][comp] = data[i];
          }
        } else {
          rcolor[c] = data;
        }
      }

      return rcolor;
    };

    this.on("input", (msg, send, done) => {
      var message = msg;
      var sendMessage = send;

      // NPM module exposed as variable, npm_module
      if (message.payload === undefined) message.payload = {};

      let c = RED.util.getMessageProperty(message, this.target);

      if (c === undefined) c = {};

      // Direct Color Code
      if (typeof c === "string") {
        const field = c;
        c = {};
        c.keyword = field;
      }

      let fullConverter = "";

      // Find Complete Color Space
      for (const color in this.colors) {
        // If no Color Space Continue;
        if (c[color] === undefined) continue;

        // Check If Converter
        if (this.colors[color] === undefined) continue;

        fullConverter = "";

        if (Array.isArray(this.colors[color])) {
          for (const i in this.colors[color]) {
            const comp = this.colors[color][i];
            if (c[color][comp] === undefined) {
              fullConverter = "";
              break;
            }
            fullConverter = color;
          }

          if (fullConverter !== "") break; // Found on full match
        } else if (c[color] !== undefined && c[color] !== "") {
          fullConverter = color;
          break;
        }
      }

      let rcolor = {};

      if (fullConverter !== "") {
        // Found Full Converter
        rcolor = this.colorConverter(fullConverter, c);
      } else {
        // Try to Default
        for (const color in this.colors) {
          c = this.defaultColor(color, c);
          if (c[color] !== undefined) {
            rcolor = c;
            break;
          }
        }
      }

      if (typeof rcolor !== "object") rcolor = {};

      // Extra Convertions
      if (rcolor.rgb !== undefined && rcolor.rgb.red !== undefined && rcolor.rgb.green !== undefined && rcolor.rgb.blue !== undefined) {
        rcolor.rgbi = rcolor.rgb.red * 65536 + rcolor.rgb.green * 256 + rcolor.rgb.blue;

        if (rcolor.temperature === undefined) rcolor.temperature = ColorTemperature.rgb2colorTemperature(rcolor.rgb);

        if (this.temperatures[rcolor.temperature] !== undefined) rcolor.keyword = this.temperatures[rcolor.temperature];
      }

      RED.util.setMessageProperty(message, this.target, rcolor);

      // Return Message
      sendMessage =
        sendMessage ||
        function smsg() {
          node.send.apply(node, arguments);
        };
      sendMessage(message);

      if (done) {
        done();
      }
    });
  }
  RED.nodes.registerType("node-red-contrib-colorspace", ColorConverterNode);
};
