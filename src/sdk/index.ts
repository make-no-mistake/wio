import { useRelation } from "./db";
import { renderMarkdown } from "./markdown/index";
import { WioWebSocket } from "./websockets";
import { ask } from "./ai";
import { playSound } from "./play-sound";
import { WioCookieImpl } from "./cookies";

export default class wio {
  static useRelation = useRelation;
  static ws = new WioWebSocket();
  static ask = ask;
  static renderMarkdown = renderMarkdown;
  static playSound = playSound;
  static cookies = new WioCookieImpl();
}
