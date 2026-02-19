import { useRelation } from "./db";
import { WioWebSocket } from "./websockets";

export default class wio {
  static useRelation = useRelation;
  static ws = new WioWebSocket();
}
