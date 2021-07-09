type Colors =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "magenta"
  | "cyan"
  | "white";
const colorsCode: Record<Colors, string> = {
  blue: "\x1b[34m%s\x1b[0m",
  green: "\x1b[32m%s\x1b[0m",
  yellow: "\x1b[33m%s\x1b[0m",
  red: "\x1b[31m%s\x1b[0m",
  magenta: "\x1b[35m%s\x1b[0m",
  cyan: "\x1b[36m%s\x1b[0m",
  white: "\x1b[37m%s\x1b[0m",
};

class LogService {
  constructor() {}

  static write(msg: any[], color: Colors) {
    console.log(colorsCode[color], ...msg);
  }

  static error(msg: any[]) {
    LogService.write(msg, "red");
  }
}

export default LogService;
