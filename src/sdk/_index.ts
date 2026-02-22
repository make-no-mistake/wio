import { useRelation } from "./db";
import { WioWebSocket } from "./websockets";
import { ask } from "./ai";

export default class wio {
  static useRelation = useRelation;
  static ws = new WioWebSocket();
  static ask = ask;
}
