import { useRelation } from "./db";
import { renderMarkdown } from "./markdown/index";
import { WioWebSocket } from "./websockets";
import { ask } from "./ai";
import { openModal } from "./helpers/modal";
import "./webcomponents";

export default class wio {
  static useRelation = useRelation;
  static ws = new WioWebSocket();
  static ask = ask;
  static renderMarkdown = renderMarkdown;
  static openModal = openModal;
}
